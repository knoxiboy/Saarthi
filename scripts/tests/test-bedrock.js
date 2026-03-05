const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require("dotenv").config();

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

async function testBedrock() {
    console.log("Testing Bedrock with Region:", process.env.AWS_REGION);
    console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? "PRESENT" : "MISSING");
    
    const prompt = "Say hello in JSON format: {\"message\": \"hello\"}";
    
    const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 100,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    try {
        console.log("Sending request to Bedrock...");
        const response = await client.send(command);
        const responseBody = new TextDecoder().decode(response.body);
        console.log("Response received!");
        console.log("Response Body:", responseBody);
    } catch (error) {
        console.error("Bedrock Test Error Details:");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Metadata:", error.$metadata);
        if (error.message.includes("AccessDeniedException")) {
            console.error("HINT: Access Denied. Check IAM permissions or if the model is enabled in your AWS account.");
        }
    }
}

testBedrock();
