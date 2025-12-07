import { useEffect, useState } from 'react';
import { fileToObjectUrl } from '../lib/image';

interface PreviewPaneProps {
    file: File;
    onReset: () => void;
}

export default function PreviewPane({ file, onReset }: PreviewPaneProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = fileToObjectUrl(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!previewUrl) return null;

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-in w-full max-w-2xl">
            <div className="relative group w-full flex justify-center">
                <img
                    src={previewUrl}
                    alt="Target"
                    className="max-h-[50vh] object-contain rounded-lg border border-secondary/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                />
                <button
                    onClick={onReset}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
                >
                    ×
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-secondary font-mono pointer-events-none">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </div>
            </div>
        </div>
    );
}
