require('dotenv').config({ path: '.env' });
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function testModel(modelId) {
    try {
        const command = new ConverseCommand({
            modelId,
            messages: [{ role: 'user', content: [{ text: 'Hello!' }] }],
        });
        await client.send(command);
        console.log(`✅ SUCCESS: ${modelId}`);
        return true;
    } catch (err) {
        if (err.name === 'ValidationException' && err.message.includes('on-demand throughput isn’t supported')) {
            console.log(`❌ FAILED (No On-Demand Access): ${modelId}`);
        } else if (err.message.includes('INVALID_PAYMENT_INSTRUMENT') || err.message.includes('Marketplace')) {
            console.log(`❌ FAILED (Payment Issue): ${modelId}`);
        } else {
            console.log(`❌ FAILED (${err.name}): ${modelId} - ${err.message}`);
        }
        return false;
    }
}

async function main() {
    await testModel('amazon.titan-text-lite-v1');
    await testModel('amazon.titan-text-express-v1');
    await testModel('amazon.nova-lite-v1:0');
    await testModel('amazon.nova-micro-v1:0');
    await testModel('meta.llama3-8b-instruct-v1:0');
    await testModel('meta.llama3-1-8b-instruct-v1:0');
}

main();
