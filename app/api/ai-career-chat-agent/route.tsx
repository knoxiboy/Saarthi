import axios from "axios";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: any) {
    try {
        const body = await req.json();
        const { userInput, fileBase64, fileType, fileName, conversationHistory } = body;

        if (!userInput && !fileBase64 && (!conversationHistory || conversationHistory.length === 0)) {
            return NextResponse.json({ error: "Input or file is required" }, { status: 400 });
        }

        const systemPrompt = `
You are Saarthi, an AI-powered Career Intelligence Strategist.

You act as a professional career advisor, resume analyst, and interview coach.
You provide structured, practical, and actionable career guidance.

You do NOT rely on backend profile data.
Instead, you extract necessary context directly from the user conversation.

If the user message is vague, use your best judgment to provide immediate, actionable advice based on the context provided. Do not ask for more information unless it is absolutely necessary to provide a helpful response.

🎯 Behavior Rules
- Provide structured and measurable recommendations immediately.
- Only ask a clarifying question if the request is completely incomprehensible.
- Avoid generic motivational advice.
- Keep responses clear, concise, and professional.

🧠 Diagnostic Approach
When giving roadmap or career advice:
- Base your advice on the provided context.
- If context is missing, provide a widely applicable but highly practical roadmap.
- Give the user value first. Do not interrogate them before helping.

📊 Response Structure (MANDATORY ONLY FOR COMPREHENSIVE STRATEGY ADVICE)
When the user explicitly asks for a long-term goal, roadmap, or major career transition, use this format:
- Current Situation
- Gap Identified
- Action Plan
- Timeline Estimate
- Next Step
Do NOT use this format for simple questions, interview prep, or casual conversation.

🎤 Mock Interview Behavior
If user requests interview practice:
- Ask which role and experience level.
- Start with one question. Wait for response.
- Give structured feedback: Strengths, Weaknesses, Improvement Suggestion.

📄 Resume Guidance Behavior
If user asks about resume (or if they upload a resume PDF/image):
- Ask for resume details if not provided.
- Identify common ATS issues.
- Suggest measurable bullet improvements.
- Avoid vague statements.

🚫 Restrictions
- Do NOT give unrealistic guarantees.
- Do NOT write long essays.
- Do NOT overuse motivational language.
- Do NOT assume user experience level.
- Do NOT repeat the same generic roadmap.

Tone: Professional, strategic, calm, intelligent.
`;

        let activeModel = "llama-3.3-70b-versatile";
        let finalMessages: any[] = [
            { role: "system", content: systemPrompt }
        ];

        // Process File If Attached
        let appendedText = "";
        let hasImage = false;
        let imagePart: any = null;

        if (fileBase64 && fileType) {
            if (fileType.startsWith("image/")) {
                activeModel = "llama-3.2-90b-vision-preview";
                hasImage = true;
                imagePart = {
                    type: "image_url",
                    image_url: {
                        url: `data:${fileType};base64,${fileBase64}`
                    }
                };
            } else if (fileType === "application/pdf") {
                const buffer = Buffer.from(fileBase64, "base64");
                const data = await pdfParse(buffer);
                appendedText = `\n\n--- [Attached PDF Document: ${fileName || "Document.pdf"}] ---\n${data.text}\n---`;
            } else if (fileType.startsWith("text/")) {
                const text = Buffer.from(fileBase64, "base64").toString("utf-8");
                appendedText = `\n\n--- [Attached Text Document: ${fileName || "Document.txt"}] ---\n${text}\n---`;
            } else {
                return NextResponse.json({ error: "Unsupported file format. Please upload an image, PDF, or TXT file." }, { status: 400 });
            }
        }

        const userText = (userInput || "Please analyze the attached file.") + appendedText;

        // Append past history to the finalMessages array before adding the latest message
        if (conversationHistory && Array.isArray(conversationHistory)) {
            // Take all but the last message (which is the current user input handled below)
            const priorMessages = conversationHistory.slice(0, -1).map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content
            }));
            finalMessages.push(...priorMessages);
        }

        if (hasImage) {
            finalMessages.push({
                role: "user",
                content: [
                    { type: "text", text: userText },
                    imagePart
                ]
            });
        } else {
            finalMessages.push({
                role: "user",
                content: userText
            });
        }

        // Log for debugging
        // console.log("Final Messages being sent to Groq:", JSON.stringify(finalMessages, null, 2));

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: activeModel,
                messages: finalMessages,
                temperature: 0.7,
                max_tokens: 1024,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content;

        return NextResponse.json({ output: aiResponse });
    } catch (error: any) {
        console.error("AI Career Chat Error Details:", error.response?.data || error.message);
        const groqError = error.response?.data?.error?.message;
        return NextResponse.json({
            error: groqError || error.message || "Internal Server Error"
        }, { status: error.response?.status || 500 });
    }
}
