import { chatWithGroq } from "./groq";
import { z } from "zod";

// Zod Schemas for Validation
const CourseOutlineSchema = z.object({
    courseTitle: z.string(),
    description: z.string(),
    learningOutcomes: z.array(z.string()),
    capstoneProject: z.string(),
    modules: z.array(z.object({
        title: z.string(),
        description: z.string(),
        lessons: z.array(z.object({
            title: z.string(),
            focus: z.string()
        }))
    }))
});

const LessonContentSchema = z.object({
    explanation: z.string(),
    realWorldExample: z.string(),
    codeExample: z.string().optional(),
    commonMistakes: z.array(z.string()),
    exercise: z.string(),
    interviewQuestions: z.array(z.object({
        question: z.string(),
        answer: z.string()
    }))
});

const QuizSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string()
    }))
});

/**
 * Executes a call to Groq with Premium Engine specific handling
 */
async function callGroqPremium(model: string, systemPrompt: string, userPrompt: string, jsonMode: boolean = true) {
    try {
        const responseData = await chatWithGroq([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], {
            model: model,
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.7
        });

        if (!responseData?.choices?.[0]?.message?.content) {
            throw new Error("Empty response from Groq Engine");
        }

        return responseData.choices[0].message.content;
    } catch (error: any) {
        console.error(`[PREMIUM_GROQ_ERROR] API Call Failed:`, error.message);
        throw error;
    }
}

/**
 * STEP 1: Generate the high-level course skeleton
 */
export async function generateCourseOutline(topic: string, level: string, duration: string, goalType: string) {
    console.log(">>> [DEBUG] generateCourseOutline START <<<", { topic, level, duration, goalType });
    const systemPrompt = `You are a Senior Industry Educator and FAANG-Level Technical Instructor.
    You design advanced, structured, progressive courses that prepare learners for real-world job roles and technical interviews.
    Return ONLY a strict JSON object. No markdown, no filler.`;

    const userPrompt = `Generate a comprehensive ${duration} course on "${topic}" for ${level} learners.
    Constraints:
    - Max 6 modules.
    - Each module must contain 4-5 lessons.
    - Each lesson must build logically from previous ones.
    - Include a final capstone project.
    - Course must focus on ${goalType}.
    - Emphasize practical depth.

    Required JSON Format:
    {
      "courseTitle": "...",
      "description": "...",
      "learningOutcomes": ["...", "..."],
      "capstoneProject": "...",
      "modules": [
        {
          "title": "...",
          "description": "...",
          "lessons": [{"title": "...", "focus": "..."}]
        }
      ]
    }`;

    try {
        const raw = await callGroqPremium("llama-3.3-70b-versatile", systemPrompt, userPrompt);
        console.log("[BEDROCK] Raw Outline Response:", raw);

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            console.error("[BEDROCK] JSON Parse Failed:", raw);
            throw new Error("AI returned invalid JSON structure");
        }

        const validated = CourseOutlineSchema.safeParse(parsed);
        if (!validated.success) {
            console.error("[BEDROCK] Schema Validation Failed:", validated.error.format());
            throw new Error("AI response did not match the expected course structure");
        }

        return validated.data;
    } catch (error: any) {
        console.error("Course Outline Generation Failed:", error);
        throw new Error(error.message || "Failed to generate course structure");
    }
}

/**
 * STEP 2: Generate deep-dive content for a specific lesson
 */
export async function generateLessonContent(lessonTitle: string, focus: string, level: string, goalType: string) {
    const wordLimits: Record<string, string> = {
        "Beginner": "400-600",
        "Intermediate": "600-800",
        "Advanced": "800-1200"
    };
    const limit = wordLimits[level] || "600-800";

    const systemPrompt = `You are a Senior Industry Educator.
    Generate a highly detailed, industry-aligned lesson.
    Follow these rules:
    1. Depth: Aim for ${limit} words in the explanation.
    2. Format: Return strict JSON only.
    3. Interview focus: Include real-world gaps and recruiter-style questions.`;

    const userPrompt = `Generate lesson content for:
    Topic: "${lessonTitle}"
    Focus Area: ${focus}
    Level: ${level}
    Goal: ${goalType}

    Include:
    - explanation (Min ${limit.split('-')[0]} words)
    - realWorldExample (Concrete industry scenario)
    - codeExample (Clean, professional code if applicable)
    - commonMistakes (List of things professionals get wrong)
    - exercise (Actionable task)
    - interviewQuestions (5-8 high-quality Q&A)

    JSON Format:
    {
      "explanation": "...",
      "realWorldExample": "...",
      "codeExample": "...",
      "commonMistakes": ["...", "..."],
      "exercise": "...",
      "interviewQuestions": [{"question": "...", "answer": "..."}]
    }`;

    let attempt = 0;
    while (attempt < 2) {
        try {
            const raw = await callGroqPremium("llama-3.3-70b-versatile", systemPrompt, userPrompt);
            const parsed = LessonContentSchema.parse(JSON.parse(raw));

            // Basic word count enforcement
            const wordCount = parsed.explanation.split(/\s+/).length;
            const min = parseInt(limit.split('-')[0]);

            if (wordCount < min && attempt === 0) {
                console.warn(`Lesson too short (${wordCount}/${min}). Retrying...`);
                attempt++;
                continue;
            }

            return parsed;
        } catch (error) {
            console.error(`Lesson Generation Attempt ${attempt + 1} Failed:`, error);
            attempt++;
            if (attempt === 2) throw error;
        }
    }
    throw new Error("Failed to generate lesson content after retries.");
}

/**
 * STEP 3: Generate high-quality MCQs
 */
export async function generateQuiz(content: string) {
    const systemPrompt = `You are an Expert Examiner. Generate 8 high-quality MCQs.
    Mix conceptual and scenario-based questions. Return strict JSON.`;

    const userPrompt = `Based on this content, generate 8 MCQs:
    ${content.substring(0, 3000)}

    JSON Format:
    {
      "questions": [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "..."
        }
      ]
    }`;

    try {
        const raw = await callGroqPremium("llama-3.1-8b-instant", systemPrompt, userPrompt);
        return QuizSchema.parse(JSON.parse(raw));
    } catch (error) {
        console.error("Quiz Generation Failed:", error);
        return { questions: [] }; // Graceful failure
    }
}

/**
 * Rank YouTube videos using AI
 */
export async function rankYouTubeVideos(videos: any[], level: string) {
    if (!videos || videos.length === 0) return null;

    const systemPrompt = `Select the most structured, high-quality educational tutorial best suited for ${level} learners. 
    Return ONLY the videoId as a string. No other text.`;

    const userPrompt = `Rank these videos for a ${level} learner and return the best one:
    ${videos.map((v, i) => `${i + 1}. Title: ${v.title} | Channel: ${v.channelTitle} | ID: ${v.videoId}`).join("\n")}`;

    try {
        const videoId = await callGroq("llama-3.1-8b-instant", systemPrompt, userPrompt, false);
        return videoId.trim().replace(/['"]/g, "");
    } catch (error) {
        return videos[0]?.videoId; // Fallback to first
    }
}
