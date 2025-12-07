import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function runTests() {
    console.log("--- START DIAGNOSTICS ---");

    // 1. Env Vars
    console.log(`[ENV] HF_TOKEN: ${HF_TOKEN ? "PRESENT (" + HF_TOKEN.length + " chars)" : "MISSING"}`);
    console.log(`[ENV] GEMINI_API_KEY: ${GEMINI_API_KEY ? "PRESENT (" + GEMINI_API_KEY.length + " chars)" : "MISSING"}`);

    // 2. Hugging Face
    if (HF_TOKEN) {
        try {
            console.log("[TEST] Hugging Face: Sending request...");
            // Using the actual inference endpoint with a small payload. 
            // It might error due to invalid image, but we want to see if we reach the server (Auth check).
            // A 1x1 transparent pixel base64
            const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            const model = "Ateeqq/ai-vs-human-image-detector";
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${model}`,
                { inputs: b64 },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
            );
            console.log(`[PASS] Hugging Face: Status ${response.status}`);
            console.log(`       Data preview: ${JSON.stringify(response.data).slice(0, 50)}...`);
        } catch (error: any) {
            const status = error.response?.status;
            console.log(`[FAIL] Hugging Face: Status ${status || "Network Error"}`);
            if (error.response?.data) {
                console.log(`       Error Data: ${JSON.stringify(error.response.data).slice(0, 100)}`);
            } else {
                console.log(`       Error Message: ${error.message}`);
            }
        }
    } else {
        console.log("[SKIP] Hugging Face: No token");
    }

    // 3. Gemini
    if (GEMINI_API_KEY) {
        try {
            console.log("[TEST] Gemini: Sending request...");
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say 'OK'");
            const response = await result.response;
            const text = response.text();
            console.log(`[PASS] Gemini: Response received: "${text.trim()}"`);
        } catch (error: any) {
            console.log(`[FAIL] Gemini: Error: ${error.message}`);
        }
    } else {
        console.log("[SKIP] Gemini: No key");
    }

    console.log("--- END DIAGNOSTICS ---");
}

runTests();
