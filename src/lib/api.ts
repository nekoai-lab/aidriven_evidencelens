import type { AnalysisResult } from './types';
import { fileToDataUrl } from './image';

// MVP: Hardcoded local endpoint. 
// In prod, use environment variable: import.meta.env.VITE_API_URL
const API_ENDPOINT = 'http://localhost:3003/api/detect';

export async function detectImage(file: File): Promise<AnalysisResult> {
    const imageBase64 = await fileToDataUrl(file);

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    return response.json();
}
