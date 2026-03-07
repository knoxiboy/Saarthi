import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq } from "@/lib/ai/groq";
import { MODELS } from "@/lib/ai/models";
import { db } from "@/lib/db/db";
import { roadmapsTable } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit, getRequestIP, AI_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        // Rate limit check
        const ip = getRequestIP(req);
        const { limited, resetIn } = checkRateLimit(`roadmap:${ip}`, AI_RATE_LIMIT);
        if (limited) {
            return NextResponse.json(
                { error: `Too many requests. Please try again in ${resetIn} seconds.` },
                { status: 429 }
            );
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { targetField, timeline, currentLevel, weeklyCommitment } = await req.json();

        if (!targetField || !timeline || !currentLevel) {
            return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
        }

        const systemPrompt = `
        You are an expert Career Strategist and Curriculum Designer.
        Create a detailed, non-linear learning roadmap that spans exactly the user's requested timeline.
        
        STRICT RULES:
        - NO REPETITION: Every milestone must have a distinct, unique goal. Do not repeat "Review basics".
        - RESOURCE PRECISION: Do not just say "Online tutorials". Suggest specific, high-quality resources (e.g., "Eloquent JavaScript (Chapter 4)", "MDN docs on Flexbox", or "Harvard CS50 Lecture 2").
        - ACTIONABLE STEPS: Every "detailedStep" must be a concrete task (e.g., "Build a counter app using Redux" instead of "Learn Redux").

        Output ONLY valid JSON:
        {
          "title": "Roadmap Title",
          "description": "Concise overview",
          "milestones": [
            {
              "week": "Date Range",
              "goal": "Unique Module Goal",
              "topics": ["Specific Topic 1", "Specific Topic 2"],
              "resources": ["Specific Resource Link/Name 1", "Specific Resource Link/Name 2"],
              "detailedSteps": ["Task 1", "Task 2"]
            }
          ],
          "tips": ["Strategic Tip 1", "Strategic Tip 2"]
        }
        `;

        const userPrompt = `
TARGET FIELD: ${targetField}
TIMELINE: ${timeline}
CURRENT LEVEL: ${currentLevel}
WEEKLY COMMITMENT: ${weeklyCommitment || "Not specified"} hours/week

Generate a comprehensive roadmap for mastering ${targetField} that STRICTLY spans the entire ${timeline} duration. 
Ensure the milestones are distributed logically across the whole period.
`;

        const responseData = await chatWithGroq([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], {
            model: MODELS.PRIMARY,
            response_format: { type: "json_object" },
            max_tokens: 4096
        });

        if (!responseData?.choices?.[0]?.message?.content) {
            throw new Error("Invalid response from AI provider");
        }

        const aiOutput = JSON.parse(responseData.choices[0].message.content);

        // Save to Database
        const inserted = await db.insert(roadmapsTable).values({
            userEmail: userEmail,
            targetField: targetField,
            roadmapData: JSON.stringify(aiOutput)
        }).returning();

        return NextResponse.json({
            ...aiOutput,
            id: inserted[0].id
        });

    } catch (error: unknown) {
        console.error("Roadmap Generation Error:", error);
        const err = error as { message?: string; response?: { data?: any } };
        return NextResponse.json({
            error: err.message || "Failed to generate roadmap",
            details: err.response?.data || err.message
        }, { status: 500 });
    }
}
