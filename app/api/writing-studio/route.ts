import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { writingStudioDocsTable } from "@/configs/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser || !clerkUser.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = clerkUser.primaryEmailAddress.emailAddress;
        const body = await req.json();
        const { docType, context, userDetails, tone, length } = body;

        if (!docType || !context || !userDetails) {
            return NextResponse.json({ error: "Document type, context, and user details are required" }, { status: 400 });
        }

        const docTypeNames: Record<string, string> = {
            cover_letter: "Cover Letter",
            sop: "Statement of Purpose (SOP)",
            motivation_letter: "Motivation Letter",
            proposal: "Proposal"
        };

        const systemPrompt = `
You are Saarthi, an expert Career Strategy Specialist.
Your goal is to generate a premium, high-impact ${docTypeNames[docType] || "Professional Document"}.

DOCUMENT TYPE: ${docTypeNames[docType]}
TONE: ${tone || "Professional"}
LENGTH: ${length || "Medium"}

GUIDELINES:
- Use intelligent analysis to bridge the gap between user experience and role requirements.
- Maintain a highly professional, opportunity-winning standard.
- Do not use placeholders (like "[Name]"); instead, write compelling content that the user can refine.
- Focus on quantifiable achievements and measurable impact.

USER CONTEXT:
${context}

USER EXPERIENCE/SKILLS:
${userDetails}

Output only the generated document content. No conversational filler.
`;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Generate the ${docTypeNames[docType]} based on the context provided.` }
                ],
                temperature: 0.7,
                max_tokens: 2048,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const generatedContent = response.data.choices[0].message.content;

        // Auto-save to history
        const [savedDoc] = await db.insert(writingStudioDocsTable).values({
            userEmail: email,
            docType,
            context,
            userDetails,
            generatedContent
        }).returning();

        return NextResponse.json({
            success: true,
            doc: savedDoc
        });

    } catch (error: any) {
        console.error("Writing Studio Error:", error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data?.error?.message || error.message || "Failed to generate document"
        }, { status: 500 });
    }
}
