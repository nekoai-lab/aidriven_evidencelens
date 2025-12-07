import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;

const IMAGE_PATH = "C:/Users/nkusa/.gemini/antigravity/brain/04aa8e47-36a4-427c-8af9-b6889153e38a/uploaded_image_1765027634869.png";
const TEST_BUF = fs.readFileSync(IMAGE_PATH);

const CANDIDATES = [
    "Ateeqq/ai-vs-human-image-detector",
    "umm-maybe/AI-image-detector",
    "Falconsai/nsfw_image_detection"
];

async function testHF(model: string) {
    if (!HF_TOKEN) return;
    try {
        console.log(`Testing ${model} with real image (${TEST_BUF.length} bytes)...`);
        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            TEST_BUF,
            { headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'image/png' } }
        );
        console.log(`✅ ${model}: OK ${response.status}`);
        console.log(JSON.stringify(response.data));
    } catch (e: any) {
        console.log(`❌ ${model}: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
    }
}

async function run() {
    for (const m of CANDIDATES) {
        await testHF(m);
    }
}
run();
