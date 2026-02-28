import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/configs/db";
import { coursesTable } from "@/configs/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, milestoneData, roadmapId, milestoneIndex } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `
You are an expert Educator and Technical Writer. 
Your task is to generate a comprehensive, personalized course module for a specific topic.

Output Format:
You MUST respond with a valid JSON object ONLY. No conversational text.
{
  "title": "Course Module Title",
  "description": "Deep dive into the topic.",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Detailed text content/explanation for this section. Use markdown for formatting.",
      "keyTakeaways": ["Point 1", "Point 2"],
      "videoSearchQuery": "Specific YouTube search query for this section"
    }
  ],
  "studyResources": [
    {
      "name": "Resource Name",
      "type": "Article/Documentation/Book",
      "link": "https://..."
    }
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}
`;

    const userPrompt = `
TOPIC: ${topic}
${milestoneData ? `CONTEXT FROM ROADMAP: ${JSON.stringify(milestoneData)}` : ""}

Generate a detailed course module for "${topic}". 
Ensure the content is actionable, in-depth, and specifically tailored to the context provided.
For each section, provide a "videoSearchQuery" that would yield the best high-quality educational videos on YouTube.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiOutput = JSON.parse(response.data.choices[0].message.content);

    // Save to Database
    const inserted = await db.insert(coursesTable).values({
      userEmail: userEmail,
      roadmapId: roadmapId || null,
      milestoneId: milestoneIndex !== undefined ? milestoneIndex : null,
      title: aiOutput.title,
      content: JSON.stringify(aiOutput)
    }).returning();

    return NextResponse.json({
      ...aiOutput,
      courseId: inserted[0].id
    });

  } catch (error: any) {
    console.error("Course Generation Error:", error);
    return NextResponse.json({
      error: error.message || "Failed to generate course",
      details: error.response?.data || error.message
    }, { status: 500 });
  }
}
