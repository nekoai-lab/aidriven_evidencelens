import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env from one level up (since this is in server/)
dotenv.config({ path: path.join(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_A = "Ateeqq/ai-vs-human-image-detector";
const MODEL_B = "prithivMLmods/OpenSDI-Flux.1-SigLIP2";

// 1x1 transparent pixel
const TEST_IMAGE_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function queryHF(model: string, token: string | undefined) {
    if (!token) return { error: "No Token" };
    console.log(`Querying ${model}...`);
    try {
        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            { inputs: TEST_IMAGE_B64 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`[SUCCESS] ${model}:`, JSON.stringify(response.data).slice(0, 100));
        return response.data;
    } catch (error: any) {
        console.log(`[ERROR] ${model}: Status ${error.response?.status}`);
        console.log("Details:", JSON.stringify(error.response?.data || error.message));
        return null;
    }
}

async function run() {
    console.log("=== LOCAL DEBUG START ===");
    console.log("HF_TOKEN present:", !!HF_TOKEN);

    await queryHF(MODEL_A, HF_TOKEN);
    await queryHF(MODEL_B, HF_TOKEN);
    console.log("=== LOCAL DEBUG END ===");
}

run();
