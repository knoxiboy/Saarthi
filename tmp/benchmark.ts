import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { chatWithGroq } from "../lib/ai/groq";
import { MODELS } from "../lib/ai/models";

async function runner() {
    console.log("=========================================");
    console.log("== SAARTHI AI BENCHMARK & QUALITY TEST ==");
    console.log("=========================================");

    // TEST 1: Resume Analyzer (NOVA PRO)
    const resumePrompt = `
You are an elite AI Career Coach and Talent Analyzer. Extract structured data from the following resume text for a Saarthi Profile and perform a deep "Job Readiness" analysis.

Resume Text:
John Doe
Software Engineer
Skills: React, Node.js, AWS, TypeScript
Experience: 2 years at TechCorp building scalable APIs.
Education: BS Computer Science, State University, 3.8 CGPA

Evaluation Master Formula (Weighted for Role Baseline):
1. Skills Match Score (30%) - Core technical skills vs industry standard.
2. Project Strength Score (20%) - Complexity and deployment status.
3. Experience Depth Score (15%) - Impact and leadership metrics.
4. ATS Optimization Score (15%) - Keywords and formatting effectiveness.
5. Impact & Metrics Score (10%) - Quantifiable achievements.
6. Industry Fit Score (10%) - General readiness for high-growth tech roles.

Respond ONLY with a JSON object in this format:
{
  "profile": { "name": "string", "currentRole": "string" },
  "insights": { 
    "jobReadinessScore": 100, 
    "suggestions": ["suggest 1", "suggest 2"] 
  }
}
`;

    try {
        console.log("\n[1] Testing Resume Parsing (Model: " + MODELS.PRIMARY + ")");
        const t0 = Date.now();
        const res1 = await chatWithGroq(
            [
                { role: "system", content: "You are a professional resume parser." },
                { role: "user", content: resumePrompt }
            ],
            { response_format: { type: "json_object" }, model: MODELS.PRIMARY }
        );
        const t1 = Date.now();
        console.log(`Latency: ${t1 - t0}ms`);
        console.log(`Output: ${res1.choices[0].message.content}`);
        console.log("✅ Success");
    } catch (e: any) {
        console.log("❌ FAILED: " + e.message);
    }

    // TEST 2: Mock Interview Chat (NOVA LITE)
    try {
        console.log("\n[2] Testing Mock Interview Reply (Model: " + MODELS.FAST_REASONING + ")");
        const t0 = Date.now();
        const res2 = await chatWithGroq(
            [
                { role: "system", content: "You are an expert technical interviewer. Ask a follow-up question." },
                { role: "user", content: "I built my backend using Node.js and Express to handle RESTful routing." }
            ],
            { model: MODELS.FAST_REASONING, temperature: 0.7 }
        );
        const t1 = Date.now();
        console.log(`Latency: ${t1 - t0}ms`);
        console.log(`Output: ${res2.choices[0].message.content}`);
        console.log("✅ Success");
    } catch (e: any) {
        console.log("❌ FAILED: " + e.message);
    }

    // TEST 3: Quiz Generation (LLAMA 3 8B)
    try {
        console.log("\n[3] Testing Quiz Gen (Model: " + MODELS.QUIZ + ")");
        const t0 = Date.now();
        const res3 = await chatWithGroq(
            [
                { role: "system", content: "Create a 1 question multiple choice quiz." },
                { role: "user", content: "Topic: React useState hook. Return JSON format with question, options array, and answer." }
            ],
            { response_format: { type: "json_object" }, model: MODELS.QUIZ }
        );
        const t1 = Date.now();
        console.log(`Latency: ${t1 - t0}ms`);
        console.log(`Output: ${res3.choices[0].message.content}`);
        console.log("✅ Success");
    } catch (e: any) {
        console.log("❌ FAILED: " + e.message);
    }
}

runner();
