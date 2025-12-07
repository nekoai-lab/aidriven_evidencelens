
import axios from 'axios';
import fs from 'fs';

async function testServer() {
    console.log("Sending test request to http://localhost:3001/api/detect ...");

    // Tiny 1x1 pixel white dot png base64
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        const response = await axios.post('http://localhost:3001/api/detect', {
            imageBase64: base64Image
        });
        console.log("✅ Success! Server responded:", response.data);
    } catch (error: unknown) {
        console.error("❌ Request Failed!");
        const err = error as { message: string, response?: { status: number, data: unknown } };
        if (err.response) {
            const errorInfo = {
                status: err.response.status,
                data: err.response.data
            };
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
            fs.writeFileSync('last_error.txt', JSON.stringify(errorInfo, null, 2));
        } else {
            console.error("Error:", err.message);
            fs.writeFileSync('last_error.txt', JSON.stringify({ message: err.message }, null, 2));
        }
    }
}

testServer();
