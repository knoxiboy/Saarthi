import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

async function testModel(modelId: string) {
    try {
        const command = new ConverseCommand({
            modelId,
            messages: [{ role: "user", content: [{ text: "Hello!" }] }],
        });
        await client.send(command);
        console.log(`✅ SUCCESS: ${modelId}`);
        return true;
    } catch (err: any) {
        console.log(`❌ FAILED: ${modelId} - ${err.name}: ${err.message}`);
        return false;
    }
}

async function main() {
    await testModel("amazon.nova-lite-v1:0");
    await testModel("amazon.titan-text-express-v1");
    await testModel("meta.llama3-8b-instruct-v1:0");
    await testModel("meta.llama3-1-8b-instruct-v1:0");
}

main();
