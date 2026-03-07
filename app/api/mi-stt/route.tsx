import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { groq } from "@/lib/ai/groq";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const audioFile = formData.get("file") as File;

        if (!audioFile) {
            return new NextResponse("No audio file provided", { status: 400 });
        }

        // Convert the incoming file blob to a buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write to a temporary file, as most Node SDKs (like OpenAI/Groq) expect a physical file stream for Whisper
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);
        fs.writeFileSync(tempFilePath, buffer);

        try {
            // Groq Whisper-large-v3 model
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-large-v3", // Using their flagship STT model
                language: "en",           // Force english to avoid hallucinations / translation drift
            });

            return NextResponse.json({
                text: transcription.text,
            });

        } finally {
            // Securely clean up the temp file after transcription
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }

    } catch (error) {
        console.error("[MOCK_INTERVIEW_STT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
