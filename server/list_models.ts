import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

async function listModels() {
    if (!GEMINI_API_KEY) {
        console.log("No API Key");
        return;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    try {
        // Did you know? You can list models via the API if the SDK supports it, or just try a known valid one.
        // The Node SDK doesn't expose listModels directly on genAI instance easily in older versions,
        // but let's try to infer or just test multiple common names.

        const modelsToTest = [
            "gemini-3-pro-preview",
            "gemini-3.0-pro-preview",
            "gemini-3-pro-preview-11-2025",
            "gemini-3.0-pro",
            "gemini-exp-1206",
            "gemini-2.0-flash-exp"
        ];

        console.log("Testing Model Availability...");

        for (const m of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Test");
                console.log(`[SUCCESS] ${m} is available.`);
            } catch (e: any) {
                console.log(`[FAILED] ${m}: ${e.message.split('[')[0]}`); // Log only first part of error
            }
        }

    } catch (e: any) {
        console.error("Fatal:", e);
    }
}

listModels();
