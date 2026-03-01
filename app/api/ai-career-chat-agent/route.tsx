import { NextResponse } from "next/server";
// Use pdf-parse-fork which is more stable in Next.js environments
import pdf from "pdf-parse-fork";
import { chatWithGroq } from "@/lib/groq";

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

        if (fileBase64 && fileType) {
            if (fileType === "application/pdf") {
                try {
                    const buffer = Buffer.from(fileBase64, "base64");
                    // Safety check for pdfParse
                    const pdfParse = typeof pdf === 'function' ? pdf : (pdf as any).default || pdf;
                    const data = await pdfParse(buffer);
                    appendedText = `\n\n--- [Attached PDF Document: ${fileName || "Document.pdf"}] ---\n${data.text}\n---`;
                } catch (pdfError: any) {
                    console.error("PDF Parsing Error:", pdfError.message);
                    return NextResponse.json({ error: "Failed to parse PDF document. Please ensure it's not password protected." }, { status: 422 });
                }
            } else if (fileType.startsWith("text/")) {
                const text = Buffer.from(fileBase64, "base64").toString("utf-8");
                appendedText = `\n\n--- [Attached Text Document: ${fileName || "Document.txt"}] ---\n${text}\n---`;
            } else {
                return NextResponse.json({ error: "Unsupported file format. Please upload a PDF or TXT file." }, { status: 400 });
            }
        }

        const userText = (userInput || "Please analyze the attached file.") + appendedText;

        // Append past history to the finalMessages array before adding the latest message
        // [TPM OPTIMIZATION]: Limit history to last 10 messages (approx 5 conversational rounds)
        if (conversationHistory && Array.isArray(conversationHistory)) {
            const historicalWindow = conversationHistory.slice(-10);

            // Take all but the last message (which is the current user input handled below)
            const priorMessages = historicalWindow.slice(0, -1).map((msg: any) => {
                let textContent = "";
                if (typeof msg.content === "string") {
                    textContent = msg.content;
                } else if (Array.isArray(msg.content)) {
                    // Extract text parts from multi-modal content for history stability
                    textContent = msg.content
                        .filter((part: any) => part.type === "text")
                        .map((part: any) => part.text)
                        .join("\n");
                } else {
                    textContent = String(msg.content || "");
                }

                return {
                    role: msg.role === "user" ? "user" : "assistant",
                    content: textContent || " " // Ensure non-empty string
                };
            });
            finalMessages.push(...priorMessages);
        }

        finalMessages.push({
            role: "user",
            content: userText
        });

        // Using robust Groq handler with built-in retries and model failover
        const data = await chatWithGroq(finalMessages, {
            model: activeModel,
            temperature: 0.7,
            max_tokens: 1024,
        });

        if (!data?.choices?.[0]?.message?.content) {
            throw new Error("Invalid response structure from AI provider");
        }

        const aiResponse = data.choices[0].message.content;
        return NextResponse.json({ output: aiResponse });

    } catch (error: any) {
        // chatWithGroq already logs errors, but we catch them for the HTTP response
        const status = error.response?.status || 500;
        const groqError = error.response?.data?.error?.message;

        return NextResponse.json({
            error: groqError || error.message || "Internal Server Error"
        }, { status });
    }
}
