import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PDFParse } from "pdf-parse";
import { db } from "@/configs/db";
import { resumeAnalysisTable } from "@/configs/schema";
import { currentUser } from "@clerk/nextjs/server";

// Forced Refresh: 2026-02-09T06:05:00Z
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;
        const jobDescription = formData.get("jobDescription") as string || "";
        const fieldOfInterest = formData.get("fieldOfInterest") as string || "";
        const targetRole = formData.get("targetRole") as string || "";

        if (!file) {
            return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
        }

        // 1. Extract text from PDF using pdf-parse (Robust, no worker issues)
        const buffer = Buffer.from(await file.arrayBuffer());
        let resumeText = "";

        try {
            const parser = new PDFParse({ data: buffer });
            const data = await parser.getText();
            resumeText = data.text;
        } catch (parseError: any) {
            console.error("PDF Parsing Error:", parseError);
            throw new Error(`PDF Extraction failed: ${parseError.message}`);
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return NextResponse.json({ error: "Failed to extract text from the PDF" }, { status: 400 });
        }

        // 3. AI Analysis using Groq
        const hasJD = !!jobDescription.trim();
        const hasIntent = !!(fieldOfInterest.trim() || targetRole.trim());

        let mode = "general";
        if (hasJD) mode = "strict_jd";
        else if (hasIntent) mode = "career_intent";

        const systemPrompt = `
You are an elite AI Career Coach and former FAANG Senior Technical Recruiter.
Your goal is to deeply evaluate a candidate's resume and generate a "Job Readiness Intelligence Report."

Evaluation Mode: ${mode === "strict_jd" ? "Strict Job Description Matching" : mode === "career_intent" ? "Career Intent Target Benchmarking" : "General Readiness Evaluation"}

You must execute a multi-dimensional analysis based on the following Master Formula:
1. Skills Match Score (30%) - Evaluate core, supporting, and advanced technical skills gap.
2. Project Strength Score (20%) - Evaluate project complexity (e.g., full-stack, deployed, structured, real users).
3. Experience Depth Score (15%) - Evaluate internships, leadership, open-source, or equivalent practical depth.
4. ATS Optimization Score (15%) - Evaluate keyword density, action verbs, active formatting.
5. Impact & Metrics Score (10%) - Evaluate quantifiable achievements (e.g., "$X saved", "Y% improved").
6. Industry Benchmark Fit (10%) - Evaluate against standard industry expectations for the target role.

Output Format:
You MUST respond with a valid, perfectly formatted JSON object ONLY. No conversational text. Do not wrap in markdown \`\`\`json blocks.
{
  "score": (number 0-100 representing the weighted Job Readiness Score),
  "summary": "A highly detailed, multi-sentence executive summary covering specific strengths and the exact critical gaps limiting the score.",
  "scoreBreakdown": {
    "skills": (number 0-100),
    "projects": (number 0-100),
    "experience": (number 0-100),
    "ats": (number 0-100),
    "impact": (number 0-100),
    "industryFit": (number 0-100)
  },
  "strengths": [
    "Detailed Strength 1 with context and 'why it matters'.",
    "Detailed Strength 2 discussing impact and level of mastery."
  ],
  "criticalGaps": [
    "Specific Critical Gap 1 indicating exactly what is missing and why it holds the candidate back.",
    "Specific Critical Gap 2 indicating exact skills or structural problems."
  ],
  "improvementPoints": [
    "Highly actionable, step-by-step strategy to resolve Gap 1.",
    "Highly actionable, step-by-step strategy to resolve Gap 2."
  ],
  "missingKeywords": [${mode === "strict_jd" ? "List of critical keywords from JD missing" : mode === "career_intent" ? "Industry-standard skills missing for this intent" : "List of typical keywords missing for general SWE role"}],
  "sectionwiseAnalysis": {
    "education": "Deep analytical feedback on education section. E.g., 'Solid foundation but missing major coursework context. Add relevant subjects...'",
    "experience": "Deep analytical feedback on experience section. Evaluate bullets, metrics, and leadership. Suggest exact rewrites.",
    "projects": "Deep analytical feedback on projects. Are they too academic? Do they list technologies or actual impact? Suggest features to add.",
    "skills": "Deep analytical feedback on skills section. E.g., 'Strong React experience, but missing state management or testing frameworks...'"
  }
}
`;

        const userPrompt = `
${mode === "strict_jd" ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ""}
${mode === "career_intent" ? `CAREER INTENT:\nField: ${fieldOfInterest}\nTarget: ${targetRole}` : ""}
${mode === "general" ? "MODE: General Job Readiness Benchmarking" : ""}

RESUME TEXT:
${resumeText}
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

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        const aiOutput = JSON.parse(response.data.choices[0].message.content);

        // Save to Database if user is authenticated
        if (userEmail) {
            // Use field/role as title if job description is empty
            const displayTitle = jobDescription.trim()
                ? jobDescription
                : (fieldOfInterest || targetRole)
                    ? `${fieldOfInterest}${fieldOfInterest && targetRole ? ' - ' : ''}${targetRole}`.trim()
                    : "Job Readiness Baseline";

            await db.insert(resumeAnalysisTable).values({
                userEmail,
                resumeText,
                resumeName: file.name,
                jobDescription: displayTitle,
                analysisData: JSON.stringify(aiOutput)
            });
        }

        return NextResponse.json(aiOutput);

    } catch (error: any) {
        console.error("Resume Analysis Error Detail:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        return NextResponse.json({
            error: error.message || "Failed to analyze resume",
            detail: error.response?.data || error.stack
        }, { status: 500 });
    }
}
