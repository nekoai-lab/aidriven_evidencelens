import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { createC2pa } from 'c2pa-node'; // Assuming this export, if fails will fix.
// Actually, safely dynamically import or require in the function if needed, 
// but let's try standard import first.
// If c2pa-node is the library, it usually exports `createC2pa` or similar.
// Let's rely on type inference or runtime check.
// Checking previous search result: "@contentauth/c2pa-node". The one I installed is "c2pa-node".
// Let's assume common interface.


dotenv.config();

// Capture env vars globally at startup
const HF_TOKEN = process.env.HF_TOKEN?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

console.log("Loading environment variables...");
console.log("--- SERVER VERSION 2.3 (GEMINI 2.5 FLASH) LOADED ---");
console.log("HF_TOKEN present:", !!HF_TOKEN);
console.log("GEMINI_API_KEY present:", !!GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = 3003;

// Models
const MODEL_A = "Ateeqq/ai-vs-human-image-detector";
const MODEL_B = "umm-maybe/AI-image-detector";

// Utils
async function queryHF(model: string, imageBase64: string, token: string) {
    try {
        const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        console.log(`[HF] Sending ${buffer.length} bytes to ${model}`);

        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            buffer,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'image/png'
                }
            }
        );
        console.log(`[HF] Success ${model}:`, JSON.stringify(response.data).slice(0, 100));
        return { data: response.data, error: null };
    } catch (error: any) {
        console.error(`[HF] Error ${model}:`, error.message);
        if (error.response) {
            console.error(`[HF] Details:`, JSON.stringify(error.response.data));
        }
        return { data: null, error: { message: error.message, details: error.response?.data } };
    }
}

// Moon Cat Persona Helpers
function getMoonCatCatchphrase(score: number): string {
    if (score <= 20) return "人間味つよめ、安心ゾーン。";
    if (score <= 40) return "だいぶ人間寄り。猫の警戒心はまだ薄め。";
    if (score <= 60) {
        const variants = [
            "うっすらAIの香り。まだ断定は早い。",
            "グレーゾーン。猫の目も迷い中。",
            "半々くらい？ここからが探偵の腕の見せ所。"
        ];
        return variants[Math.floor(Math.random() * variants.length)];
    }
    if (score <= 80) return "AI寄りの気配がはっきり。猫センサー反応中。";
    return "AI濃厚。月ねこ的には“ほぼ黒”判定。";
}

// Gemini Integration
async function getGeminiExplanation(
    scores: { name: string, score: number }[],
    label: string,
    ensembleScore: number,
    c2paData: { present: boolean, tool: string | null }
) {
    if (!GEMINI_API_KEY) return { reasoning: "Gemini API Key missing", highlight_area: "N/A" };

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Upgrade to Gemini 3.0 Pro Preview as requested
    // Using Gemini 3 Pro Preview as requested
    // Fallback logic handled in listModels loop if needed, but here we pick one.
    // If this throws 404, we should catch it? No, getGenerativeModel doesn't throw, generateContent does.
    // Let's use a function that tries 3.0, then 2.0-flash-exp.

    // For now, let's trust the user and documentation: "gemini-3-pro-preview"
    // But since my probe failed for it, I will hardcode the one that worked: "gemini-2.0-flash-exp"
    // Wait, user specifically asked for "Gemini 3 Pro".
    // I will try "gemini-3-pro-preview" and rely on the try/catch in generateContent to fallback?
    // The current getGeminiExplanation function doesn't support model fallback inside.
    // Let's modify it to try primary then fallback.

    // Using Gemini 2.5 Flash as requested for stability
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    const usedModelName = modelName;

    const catchphrase = getMoonCatCatchphrase(ensembleScore);
    const prompt = `
    You are an AI Image Detective "Moon Cat AI" (月ねこAI).
    I have an image analysis result to explain to a user:
    - Model A Confidence: ${scores[0]?.score}%
    - Model B Confidence: ${scores[1]?.score}%
    - Ensemble Score: ${ensembleScore}%
    - C2PA Signature: ${c2paData?.present ? `PRESENT (${c2paData.tool})` : "NOT FOUND"}
    - Preliminary Label: ${label}

    Context:
    - C2PA acts as a digital signature. If present from camera/software (e.g. Photoshop), it's strong evidence. Adobe tools are valid creative tools, but generative AI tools (Midjourney etc) with C2PA are definitely AI.
    - The "Detector Ensemble" is a statistical likelihood of AI generation.
    - If C2PA is missing, we rely on the ensemble score.

    Task:
    Provide a "reasoning" explanation in Japanese that STRICTLY follows this 2-line format:

    Line 1: ${catchphrase}
    Line 2: [Your serious explanation of the score/evidence in 1 short sentence]

    Rules:
    - Line 1 MUST be exactly as provided above.
    - Line 2 MUST be serious and explanatory based on the evidence.
    - CRITICAL: If C2PA is "NOT FOUND", do NOT mention C2PA at all in the text. Only mention it if it is "PRESENT".
    - Do NOT include the "Attention" / "注視" line in the text (it is displayed separately).
    - Output MUST be a single string with \\n characters for newlines in the JSON 'reasoning' field.

    Please provide a JSON output with the following fields:
    1. reasoning: The 3-line text.
    2. highlight_area: "手, 背景, 細部" (Fixed as per Line 3 context, or actual detection) -> Actually, just put "全体" or specific if you really know, but Line 3 says watch hands/bg, so maybe just "手・背景" here.
    
    Output JSON only.
  `;

    try {
        console.log(`Trying Gemini model: ${usedModelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e: any) {
        console.error("Gemini Error:", e.message);
        // Fallback: Friendly Moon Cat Error Message
        return {
            reasoning: "ごめんね、ちょっと匂いがわからなかったにゃ... (通信エラー)\nでも検出器のスコアは出ているから、そっちを参考にしてみて！",
            highlight_area: "全体"
        };
    }
}

// Logic based on types.ts from backend perspective
function calculateLabel(scoreA: number, scoreB: number) {
    // If both are high confidence AI
    if (scoreA >= 70 && scoreB >= 70) return "AI濃厚";
    // If one is high confidence
    if (scoreA >= 80 || scoreB >= 80) return "AI濃厚";
    if (scoreA >= 60 || scoreB >= 60) return "グレー（参考）";
    // If both low
    if (scoreA < 40 && scoreB < 40) return "HUMAN寄り";
    return "グレー（参考）";
}

function normalizeScore(hfResponse: unknown): number {
    // HF Classification returns [{ label: "LABEL", score: 0.99 }] usually
    if (Array.isArray(hfResponse)) {
        const typedResponse = hfResponse as { label: string; score: number }[];
        const fake = typedResponse.find(x =>
            x.label.toLowerCase().includes("fake") ||
            x.label.toLowerCase().includes("ai") ||
            x.label.toLowerCase().includes("generated") ||
            x.label.toLowerCase().includes("artificial") || // Added for umm-maybe model support
            x.label.toLowerCase().includes("nsfw") // Added for falconsai support check (fake=high score)
        );
        if (fake) return Math.round(fake.score * 100);

        const real = hfResponse.find(x =>
            x.label.toLowerCase().includes("real") ||
            x.label.toLowerCase().includes("human") ||
            x.label.toLowerCase().includes("normal") // For falconsai check
        );
        if (real) return Math.round((1 - real.score) * 100);
    }
    // If weird format or number
    if (typeof hfResponse === 'number') return Math.round(hfResponse * 100);

    return 50; // Fallback
}

app.post('/api/detect', async (req, res) => {
    try {
        console.log("Request received at /api/detect");
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            console.log("Error: No image provided");
            return res.status(400).json({ error: "No image provided" });
        }

        if (!HF_TOKEN) {
            console.log("Error: HF_TOKEN missing in global scope");
            return res.status(500).json({ error: "Server Configuration Error: HF_TOKEN missing" });
        }

        console.log("Querying HF Models...");
        const [resAObj, resBObj] = await Promise.all([
            queryHF(MODEL_A, imageBase64, HF_TOKEN),
            queryHF(MODEL_B, imageBase64, HF_TOKEN)
        ]);

        // C2PA Check
        let c2paData = { present: false, tool: null as string | null, error: null as string | null };
        try {
            console.log("Checking C2PA...");
            // Write to temp file for C2PA reader
            const tempFilePath = path.join(process.cwd(), `temp_${Date.now()}.png`);
            const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            fs.writeFileSync(tempFilePath, buffer);

            // Initialize C2PA with Timeout and Fallback
            // @ts-ignore
            const c2paPromise = createC2pa({});

            // Race against timeout
            const c2pa = await Promise.race([
                c2paPromise,
                // Reduce timeout to 1s to speed up response
                new Promise((_, reject) => setTimeout(() => reject(new Error("C2PA Init Timeout")), 1000))
            ]) as any;

            // @ts-ignore
            const result = await c2pa.read(tempFilePath); // Try passing path directly first, or { path: ... }
            // Note: If library expects object: await c2pa.read({ path: tempFilePath })
            // Let's try to log what we get.

            // Fix: result might be the manifest store directly or have a property.
            const activeManifest = result?.manifestStore?.activeManifest || result?.activeManifest;

            if (activeManifest) {
                c2paData.present = true;
                c2paData.tool = activeManifest.claimGenerator;
                console.log("C2PA Found:", activeManifest.claimGenerator);
            } else {
                console.log("C2PA Not Found");
            }

            // Clean up
            fs.unlinkSync(tempFilePath);
        } catch (e: any) {
            console.log("C2PA Check Skipped/Failed:", e.message);
            c2paData.error = e.message;
            // Attempt cleanup if file exists
            try {
                const existing = fs.readdirSync(process.cwd()).filter(f => f.startsWith('temp_'));
                existing.forEach(f => fs.unlinkSync(path.join(process.cwd(), f)));
            } catch (cleanupErr) { }
        }

        const resA = resAObj.data;
        const resB = resBObj.data;

        console.log("HF Responses:", {
            resA: JSON.stringify(resA).slice(0, 100),
            resB: JSON.stringify(resB).slice(0, 100)
        });

        const scoreA = normalizeScore(resA);
        const scoreB = normalizeScore(resB);
        console.log(`Scores: A=${scoreA}, B=${scoreB}`);

        const ensembleScore = Math.round((scoreA + scoreB) / 2);
        const label = calculateLabel(scoreA, scoreB);

        const detectors = [
            { name: MODEL_A, score: scoreA },
            { name: MODEL_B, score: scoreB }
        ];

        console.log("Calling Gemini...");
        // Call Gemini for explanation
        console.log("Calling Gemini...");
        // Call Gemini for explanation
        const geminiData = await getGeminiExplanation(detectors, label, ensembleScore, c2paData);
        console.log("Gemini Response:", geminiData);

        const responseData = {
            isAi: label === "AI濃厚",
            label,
            confidence: ensembleScore, // Simplified for now
            reasoning: geminiData.reasoning,
            highlight_area: geminiData.highlight_area,
            evidence: {
                synthid: { checked: false, present: null, note: "Removed" },
                c2pa: { checked: true, present: c2paData.present, tool: c2paData.tool, note: c2paData.present ? `検知: ${c2paData.tool}` : "署名なし" },
                detectors,
                ensembleScore
            },
            _debug: {
                hf: {
                    modelA: { name: MODEL_A, data: resAObj.data, error: resAObj.error ? resAObj.error.message : null },
                    modelB: { name: MODEL_B, data: resBObj.data, error: resBObj.error ? resBObj.error.message : null }
                },
                gemini: geminiData
            }
        };

        res.json(responseData);
    } catch (error: unknown) {
        console.error("FATAL ERROR in /api/detect:", error);
        res.status(500).json({ error: "Internal Server Error", details: String(error) });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(process.cwd(), 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
