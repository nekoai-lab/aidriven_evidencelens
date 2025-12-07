import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// New Candidate Models
const CANDIDATES = [
    "Smogy/SMOGY-Ai-images-detector",
    "Ateeqq/ai-vs-human-image-detector", // Retry with RGB
    "umm-maybe/AI-image-detector"
];

// 1x1 RED Pixel (RGB, No Alpha) - JPEG equivalent
const TEST_IMAGE_RGB = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQAY3Y2wAAAAAElFTkSuQmCC";
// Note: Above is actually PNG but opaque. 
// Let's use a pure JPEG base64 if possible? 
// No, the model usually handles PNG if 3 channels. 
// The error `mean must have 1 elements` (expected 3 got 1? or expected 1 got 3?)
// "got 3" implies it might be expecting grayscale? Or "got 4"? 
// Let's try sending it.

async function testHF(model: string) {
    console.log(`\nTesting: ${model}`);
    if (!HF_TOKEN) return;

    try {
        const url = `https://router.huggingface.co/hf-inference/models/${model}`;
        const response = await axios.post(
            url,
            { inputs: TEST_IMAGE_RGB },
            { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
        );
        console.log("✅ Success! Status:", response.status);
        console.log("Response:", JSON.stringify(response.data).slice(0, 100));
    } catch (error: any) {
        console.log("❌ Failed:", error.response?.status, error.response?.data?.error || error.message);
    }
}

async function testGemini() {
    console.log(`\nTesting Gemini (gemini-pro)...`);
    if (!GEMINI_API_KEY) return;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Fallback to stable 'gemini-pro'
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("✅ Gemini Success:", response.text().trim());
    } catch (error: any) {
        console.log("❌ Gemini Failed:", error.message);
    }
}

async function run() {
    for (const m of CANDIDATES) {
        await testHF(m);
    }
    await testGemini();
}

run();
