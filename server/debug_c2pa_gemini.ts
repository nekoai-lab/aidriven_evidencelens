import { createC2pa } from 'c2pa-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
console.log("GEMINI_KEY Present:", !!GEMINI_API_KEY);

async function testGemini() {
    console.log("--- Testing Gemini 3.0 Pro ---");
    if (!GEMINI_API_KEY) {
        console.log("Skipping Gemini (No Key)");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Test with the EXACT model string used in server
        const modelName = "gemini-3.0-pro-preview";
        console.log(`Requesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you Gemini 3.0?");
        const response = await result.response;
        console.log("Gemini Success:", response.text());
    } catch (e: any) {
        console.error("Gemini Failed:", e.message);
        console.error("Full Error:", JSON.stringify(e, null, 2));
    }
}

async function testC2PA() {
    console.log("\n--- Testing C2PA ---");
    // Create a dummy image or use an existing one to test C2PA read
    // We will look for a png in the current directory or create a 1x1 one.
    const testFile = path.join(process.cwd(), 'test_c2pa_image.png');

    // Create a simple dummy file if not exists (just to verify read doesn't crash on invalid file, 
    // or better, try to read the server's temp file logic)
    if (!fs.existsSync(testFile)) {
        // Create a 1x1 pixel PNG
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwAEQAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(testFile, buffer);
    }

    try {
        console.log("Initializing c2pa...");
        // @ts-ignore
        const c2pa = await createC2pa({});
        console.log("Reading file:", testFile);
        // @ts-ignore
        const result = await c2pa.read(testFile);

        console.log("Result Type:", typeof result);
        console.log("Result Keys:", Object.keys(result || {}));

        const activeManifest = result?.manifestStore?.activeManifest || result?.activeManifest;
        console.log("Active Manifest:", activeManifest ? "Found" : "Not Found");

    } catch (e: any) {
        console.error("C2PA Failed:", e.message);
        console.error("Stack:", e.stack);
    }
}

async function run() {
    await testC2PA();
    await testGemini();
}

run();
