const axios = require("axios");
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroq() {
    console.log("Testing Groq Integration...");
    console.log("API Key:", GROQ_API_KEY ? "PRESENT" : "MISSING");

    if (!GROQ_API_KEY) {
        console.error("ERROR: GROQ_API_KEY is missing in .env");
        return;
    }

    const topic = "Basic React Hooks";
    const prompt = `Generate a mini course outline for: "${topic}". Output valid JSON only.`;

    try {
        console.log("Sending request to Groq (llama-3.3-70b-versatile)...");
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are an expert curriculum designer. Always output valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Response Status:", response.status);
        console.log("Response Preview:", response.data.choices[0].message.content.substring(0, 200) + "...");
        console.log("SUCCESS: Groq is working for course generation.");

        // Test Quiz
        console.log("\nTesting Quiz Generation (llama-3.1-8b-instant)...");
        const quizResponse = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are an expert educator. Always output a valid JSON array of quiz questions." },
                    { role: "user", content: "Generate 1 question about React useEffect. Output JSON." }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Quiz Response Preview:", quizResponse.data.choices[0].message.content);
        console.log("SUCCESS: Groq is working for quiz generation.");

    } catch (error) {
        console.error("Groq Test Error:");
        console.error(error.response?.data || error.message);
    }
}

testGroq();
