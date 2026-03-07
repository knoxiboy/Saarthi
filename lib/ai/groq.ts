import Groq from "groq-sdk";

// Initialize Groq client
// It automatically uses the GROQ_API_KEY environment variable if not passed
export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Helper function to generate a completion using Groq's fast models
 * We use `llama-3.3-70b-versatile` or `llama3-8b-8192` as defaults, as they are very fast and capable
 */
export async function generateGroqCompletion(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: "json_object" };
    }
) {
    try {
        const response = await groq.chat.completions.create({
            messages,
            model: options?.model || "llama-3.3-70b-versatile", // Fast and powerful default
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 1024,
            response_format: options?.response_format,
        });

        return response.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("Groq API Error Details:", error);
        throw new Error(`Failed to generate response from Groq: ${error.message || JSON.stringify(error)}`);
    }
}

// Re-add chatWithGroq which was accidentally removed
export async function chatWithGroq(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options: any = {}
) {
    try {
        const response = await groq.chat.completions.create({
            messages: messages as any,
            model: options.model || "llama-3.3-70b-versatile",
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens ?? 1024,
            ...options,
        });
        return response;
    } catch (error: any) {
        console.error("chatWithGroq Error:", error);
        throw error;
    }
}
