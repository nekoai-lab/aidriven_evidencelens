import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Candidate Models to test
const HF_CANDIDATES = [
    "Falconsai/nsfw_image_detection", // Control (known to work usually)
    "Organika/sdxl-detector",
    "Ojimi/anime-kawai-diffusion-detection",
    "saltacc/anime-ai-detect",
    "umm-maybe/AI-image-detector",
    "Ateeqq/ai-vs-human-image-detector"
];

// Gemini Variants to test
const GEMINI_VARIANTS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-pro",
    "gemini-1.0-pro"
];

// Test Image (Base64 JPEG)
const TEST_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQAY3Y2wAAAAAElFTkSuQmCC";
const BUFFER = Buffer.from(TEST_IMAGE, 'base64');

async function testHF(model: string) {
    try {
        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            BUFFER,
            { headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'image/png' } }
        );
        console.log(`[HF] ✅ ${model}: OK (${response.status})`);
        // console.log(JSON.stringify(response.data).slice(0,50));
        return true;
    } catch (e: any) {
        console.log(`[HF] ❌ ${model}: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
        return false;
    }
}

async function testGemini(modelName: string) {
    if (!GEMINI_API_KEY) return false;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`[GEMINI] ✅ ${modelName}: OK`);
        return true;
    } catch (e: any) {
        console.log(`[GEMINI] ❌ ${modelName}: ${e.message.slice(0, 100)}...`);
        return false;
    }
}

async function run() {
    console.log("=== MODEL PROBE START ===");
    console.log(`HF_TOKEN: ${HF_TOKEN ? 'OK' : 'MISSING'}`);
    console.log(`GEMINI_API_KEY: ${GEMINI_API_KEY ? 'OK' : 'MISSING'}`);

    console.log("\n--- Hugging Face ---");
    for (const m of HF_CANDIDATES) {
        await testHF(m);
    }

    console.log("\n--- Gemini ---");
    for (const g of GEMINI_VARIANTS) {
        await testGemini(g);
    }
    console.log("=== MODEL PROBE END ===");
}

run();
