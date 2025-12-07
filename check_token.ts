
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function checkConfig() {
    console.log("=== API Configuration Check ===");

    // 1. Check HF Token
    const hfToken = process.env.HF_TOKEN;
    console.log(`\n[Hugging Face]`);
    if (!hfToken || hfToken.includes('your_')) {
        console.error("❌ Token invalid or missing in .env");
    } else {
        console.log("✅ Token found:", hfToken.slice(0, 5) + "...");
        try {
            console.log("   Testing connection to 'Ateeqq/ai-vs-human-image-detector'...");
            const response = await axios.get(
                "https://api-inference.huggingface.co/models/Ateeqq/ai-vs-human-image-detector",
                { headers: { Authorization: `Bearer ${hfToken}` } }
            );
            console.log("✅ Connection Successful! (Status: " + response.status + ")");
        } catch (error: unknown) {
            const err = error as { message: string, response?: { status: number, data: unknown } };
            console.error("❌ Connection Failed:", err.message);
            if (err.response) {
                console.error("   Details:", err.response.status, err.response.data);
            }
        }
    }

    // 2. Check Gemini Key
    const geminiKey = process.env.GEMINI_API_KEY;
    console.log(`\n[Gemini]`);
    if (!geminiKey || geminiKey.includes('your_')) {
        console.error("❌ Key invalid or missing in .env");
    } else {
        console.log("✅ Key found:", geminiKey.slice(0, 5) + "...");
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("   Testing generation...");
            const result = await model.generateContent("Hello");
            await result.response;
            console.log("✅ Generation Successful! Response received.");
        } catch (error: unknown) {
            const err = error as Error;
            console.error("❌ Connection Failed:", err.message);
        }
    }
}

checkConfig();
