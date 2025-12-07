import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MODEL = "Ateeqq/ai-vs-human-image-detector";
const TEST_IMAGE_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQAY3Y2wAAAAAElFTkSuQmCC";
const BUFFER = Buffer.from(TEST_IMAGE_B64, 'base64');

async function testHFRaw() {
    console.log(`\nTesting Raw Buffer to ${MODEL}...`);
    try {
        const url = `https://router.huggingface.co/hf-inference/models/${MODEL}`;
        const response = await axios.post(
            url,
            BUFFER,
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'image/png' // Explicitly set content type
                }
            }
        );
        console.log("✅ HF Success!", JSON.stringify(response.data));
    } catch (error: any) {
        console.log("❌ HF Failed:", error.response?.status, JSON.stringify(error.response?.data));
    }
}

async function testGeminiList() {
    console.log(`\nTesting Gemini ListModels...`);
    // Debug available models
    // ... Actually just try gemini-1.5-flash again, maybe it was a fluke?
    // Or try gemini-1.5-pro-latest
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" }); // Version pinned
        const result = await model.generateContent("Hi");
        console.log("✅ Gemini Success:", (await result.response).text());
    } catch (e: any) {
        console.log("❌ Gemini 1.5 Flash Failed:", e.message);
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            // Note: gemini-pro is often legacy mapped to 1.0
            const result2 = await model2.generateContent("Hi");
            console.log("✅ Gemini Pro Success:", (await result2.response).text());
        } catch (e2: any) {
            console.log("❌ Gemini Pro Failed:", e2.message);
        }
    }
}

async function run() {
    await testHFRaw();
    await testGeminiList();
}
run();
