import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Models we are currently trying to use
const MODEL_A = "Nahrawy/AI-or-Human";
const MODEL_B = "umm-maybe/AI-image-detector";

// 1x1 transparent pixel (Base64)
const TEST_IMAGE_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testHF(model: string) {
    console.log(`\nTesting HF Model: ${model}`);
    if (!HF_TOKEN) {
        console.log("❌ HF_TOKEN missing");
        return;
    }

    try {
        // Try the Router Endpoint
        const url = `https://router.huggingface.co/hf-inference/models/${model}`;
        console.log(`Sending to: ${url}`);

        const response = await axios.post(
            url,
            { inputs: TEST_IMAGE_B64 },
            { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
        );
        console.log("✅ Success! Status:", response.status);
        console.log("Response:", JSON.stringify(response.data).slice(0, 150));
    } catch (error: any) {
        console.log("❌ Failed. Status:", error.response?.status);
        console.log("Error:", JSON.stringify(error.response?.data || error.message));

        // Retry with Legacy Endpoint if Router fails
        try {
            console.log("   Retrying with Legacy Endpoint...");
            const legacyUrl = `https://api-inference.huggingface.co/models/${model}`;
            const response = await axios.post(
                legacyUrl,
                { inputs: TEST_IMAGE_B64 },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
            );
            console.log("   ✅ Legacy Success! Status:", response.status);
            console.log("   Response:", JSON.stringify(response.data).slice(0, 150));
        } catch (legacyError: any) {
            console.log("   ❌ Legacy Failed too.");
        }
    }
}

async function testGemini() {
    console.log(`\nTesting Gemini API...`);
    if (!GEMINI_API_KEY) {
        console.log("❌ GEMINI_API_KEY missing");
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("✅ Gemini Success! Response:", response.text().trim());
    } catch (error: any) {
        console.log("❌ Gemini Failed:", error.message);
    }
}

async function run() {
    console.log("=== STEP-BY-STEP DIAGNOSIS ===");
    await testHF(MODEL_A);
    await testHF(MODEL_B);
    await testGemini();
    console.log("=== END ===");
}

run();
