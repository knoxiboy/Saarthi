import axios from "axios";
import fs from "fs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function testGroqVision() {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.2-90b-vision-preview",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "What is this?" },
                            { type: "image_url", image_url: { url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=" } }
                        ]
                    }
                ],
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Success:", response.data);
    } catch (e: any) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", JSON.stringify(e.response?.data, null, 2));
    }
}

testGroqVision();
