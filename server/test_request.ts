import axios from 'axios';

const API_ENDPOINT = 'http://localhost:3001/api/detect';

// 1x1 transparent pixel
const TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testServer() {
    console.log(`Sending POST request to ${API_ENDPOINT}...`);
    try {
        const response = await axios.post(API_ENDPOINT, {
            imageBase64: TEST_IMAGE
        });
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.error("Server responded with error:");
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else if (error.request) {
            console.error("No response received (Network Error). is server running?");
            console.error(error.message);
        } else {
            console.error("Error setting up request:", error.message);
        }
    }
}

testServer();
