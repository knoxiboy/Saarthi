import {
    BedrockRuntimeClient,
    ConverseCommand,
    Message
} from "@aws-sdk/client-bedrock-runtime";
import Groq from "groq-sdk";

// Initialize Amazon Bedrock client for all Generation/Chat capabilities
export const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

// Initialize Groq client purely for Speech-to-Text (Whisper) support
// since AWS Transcribe stream configuration is out of scope for immediate migration.
export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Helper function to generate a completion using Amazon Bedrock.
 * Renamed internally from generateGroqCompletion to maintain API compatibility
 * while swapping the backend to AWS.
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
        const systemMessages = messages.filter(m => m.role === "system").map(m => ({ text: m.content }));
        let conversationMessages: Message[] = messages
            .filter(m => m.role !== "system")
            .map(m => ({
                role: m.role as "user" | "assistant",
                content: [{ text: m.content }]
            }));

        // AWS Bedrock Converse API strictly requires at least one message in the conversation array, 
        // and it typically must start with a user message.
        if (conversationMessages.length === 0) {
            conversationMessages.push({
                role: "user",
                content: [{ text: "Please process the request according to the system instructions." }]
            });
        } else if (conversationMessages[0].role !== "user") {
            // Unshift a dummy user message if it starts with an assistant message
            conversationMessages.unshift({
                role: "user",
                content: [{ text: "Start" }]
            });
        }

        const command = new ConverseCommand({
            modelId: options?.model || "amazon.nova-lite-v1:0",
            system: systemMessages.length > 0 ? systemMessages : undefined,
            messages: conversationMessages,
            inferenceConfig: {
                temperature: options?.temperature ?? 0.7,
                maxTokens: options?.max_tokens ?? 1024,
            }
            // Note: Converse API doesn't natively support JSON mode exactly like Groq for all models.
            // But Haiku & Llama 3 usually respect "Return JSON" in the prompt.
        });

        const response = await bedrockClient.send(command);
        let textResult = response.output?.message?.content?.[0]?.text || "";

        // Llama 3 & Bedrock Converse API sometimes wrap JSON in markdown blocks
        // This strips it seamlessly to prevent JSON.parse crashes
        if (options?.response_format?.type === "json_object" || textResult.trim().startsWith("```json")) {
            textResult = textResult.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
        }

        return textResult;
    } catch (error: any) {
        console.error("AWS Bedrock API Error Details:", error);
        throw new Error(`Failed to generate response from AWS Bedrock: ${error.message || JSON.stringify(error)}`);
    }
}

/**
 * Migration shim: keeps the old 'chatWithGroq' signature but routes to Bedrock.
 */
export async function chatWithGroq(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options: any = {}
) {
    try {
        const textResponse = await generateGroqCompletion(messages, options);

        // Mock the Groq response format so we don't need to rewrite 100 API routes immediately
        return {
            choices: [
                {
                    message: {
                        content: textResponse
                    }
                }
            ]
        };
    } catch (error: any) {
        console.error("AWS Bedrock Error:", error);
        throw error;
    }
}
