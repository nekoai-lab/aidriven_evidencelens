export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type ImageValidationResult = {
    valid: boolean;
    error?: string;
};

export function validateImageFile(file: File): ImageValidationResult {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'JPG, PNG, WEBPのみ対応だぞ' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: 'ファイルサイズは10MB以下にしてくれ' };
    }
    return { valid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function fileToObjectUrl(file: File): string {
    return URL.createObjectURL(file);
}
