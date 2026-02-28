import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string | string[];
    response_format?: { type: "json_object" | "text" };
}

const DEFAULT_OPTIONS: GroqOptions = {
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1024,
};

const FALLBACK_MODEL = "llama-3.1-8b-instant";

/**
 * Executes a chat completion request to Groq with built-in retry logic and model failover.
 * "Solves it all for once" by handling rate limits (429) and server errors (500/503) gracefully.
 */
export async function chatWithGroq(messages: any[], options: GroqOptions = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const maxRetries = 3;
    let attempt = 0;

    // Track if we should try a lighter model on the next attempt
    let useFallbackModel = false;

    while (attempt <= maxRetries) {
        try {
            const currentModel = useFallbackModel ? FALLBACK_MODEL : config.model;

            const response = await axios.post(
                GROQ_API_URL,
                {
                    ...config,
                    model: currentModel,
                    messages: messages,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            const isRateLimit = status === 429;
            const isServerError = status >= 500 && status <= 504;

            // If it's not a retryable error, or we've exhausted retries, throw it
            if (!(isRateLimit || isServerError) || attempt === maxRetries) {
                console.error(`Groq API Error (${status}):`, error.response?.data || error.message);
                throw error;
            }

            attempt++;

            // On second attempt or after a 429, signal to use a lighter model
            if (isRateLimit || attempt >= 1) {
                useFallbackModel = true;
            }

            // Exponential backoff: 1.5s, 3s, 6s
            const delay = Math.pow(2, attempt) * 750;
            console.warn(`Groq API ${status} - Retrying in ${delay}ms (Attempt ${attempt}/${maxRetries}). Fallback: ${useFallbackModel}`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
