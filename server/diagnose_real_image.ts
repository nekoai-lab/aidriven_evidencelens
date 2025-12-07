import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Path to the user's latest uploaded image
const IMAGE_PATH = "C:/Users/nkusa/.gemini/antigravity/brain/04aa8e47-36a4-427c-8af9-b6889153e38a/uploaded_image_1765028082199.png";

async function run() {
    try {
        console.log("Reading image...");
        const buffer = fs.readFileSync(IMAGE_PATH);
        const base64 = "data:image/png;base64," + buffer.toString('base64');

        console.log(`Sending request to localhost:3002 with ${buffer.length} bytes...`);
        const response = await axios.post('http://localhost:3002/api/detect', {
            imageBase64: base64
        }, {
            validateStatus: () => true // Accept all status codes
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error("Diagnosis Script Error:", error.message);
    }
}

run();
