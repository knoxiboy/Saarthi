import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db";
import { mockInterviewsTable, interviewQuestionsTable } from "@/lib/db/schema";
import { generateGroqCompletion } from "@/lib/ai/groq";
import { eq, asc } from "drizzle-orm";

export async function POST(req: Request) {
    console.log("[DEBUG] /api/mi-evaluate hit");
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { interviewId, questionId, userTranscript } = body;

        if (!interviewId || !questionId || !userTranscript) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Fetch the interview to get context
        const interviewRecords = await db.select().from(mockInterviewsTable).where(eq(mockInterviewsTable.id, interviewId));
        if (interviewRecords.length === 0) {
            return new NextResponse("Interview not found", { status: 404 });
        }
        const interview = interviewRecords[0];

        // 2. Fetch the current question to evaluate
        const questionRecords = await db.select().from(interviewQuestionsTable).where(eq(interviewQuestionsTable.id, questionId));
        if (questionRecords.length === 0) {
            return new NextResponse("Question not found", { status: 404 });
        }
        const currentQuestion = questionRecords[0];

        // 3. Evaluate the answer and generate the next question using Groq
        const systemPrompt = `You are a professional technical interviewer conducting a ${interview.duration} mock interview on "${interview.topic}" at ${interview.difficulty} difficulty.
You just asked this question: "${currentQuestion.questionText}"
The ideal answer concepts you had in mind: "${currentQuestion.idealAnswer}"
The candidate responded with: "${userTranscript}"

Your task:
1. Briefly evaluate the candidate's answer (keep it under 2 sentences). Give a score from 1-10.
2. Based on their answer, generate the NEXT question. If they did poorly, ask a simpler follow-up. If they did well, ask a harder question or move to a new area of the topic.
3. If the interview has gone on long enough (e.g., this is the 5th or 6th question, use your judgment), you can conclude the interview instead of asking another question. Set 'isFinished' to true in that case.

Return the result STRICTLY as a JSON object:
{
  "evaluationText": "Your brief review of their answer...",
  "score": 8,
  "nextQuestion": "Your next question, or closing remarks if finished...",
  "idealAnswerForNext": "Brief notes on ideal answer for this new question (leave empty if finished)",
  "isFinished": false
}`;

        const llmResponse = await generateGroqCompletion([
            { role: "system", content: systemPrompt },
            { role: "user", content: "Evaluate the response and give the next step." }
        ], {
            response_format: { type: "json_object" }
        });

        const parsedResponse = JSON.parse(llmResponse);

        // 4. Update the current question record with the evaluation
        await db.update(interviewQuestionsTable).set({
            userTranscript,
            aiEvaluationText: parsedResponse.evaluationText,
            score: parsedResponse.score,
        }).where(eq(interviewQuestionsTable.id, questionId));

        let nextQuestionRecord = null;

        // 5. If not finished, insert the next question into the DB
        if (!parsedResponse.isFinished) {
            const [newQuestion] = await db.insert(interviewQuestionsTable).values({
                interviewId: interview.id,
                questionText: parsedResponse.nextQuestion,
                idealAnswer: parsedResponse.idealAnswerForNext,
                sequenceOrder: currentQuestion.sequenceOrder + 1,
            }).returning();
            nextQuestionRecord = newQuestion;
        } else {
            // Mark interview as completed
            await db.update(mockInterviewsTable).set({
                status: "Completed",
            }).where(eq(mockInterviewsTable.id, interviewId));
        }

        return NextResponse.json({
            evaluation: parsedResponse.evaluationText,
            score: parsedResponse.score,
            nextQuestion: nextQuestionRecord,
            isFinished: parsedResponse.isFinished,
            closingRemarks: parsedResponse.isFinished ? parsedResponse.nextQuestion : null
        });

    } catch (error) {
        console.error("[MOCK_INTERVIEW_EVAL]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
