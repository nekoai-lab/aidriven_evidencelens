import React, { useCallback, useState } from 'react';
import { validateImageFile } from '../lib/image';

interface InputPanelProps {
    onImageSelect: (file: File) => void;
}

export default function InputPanel({ onImageSelect }: InputPanelProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'エラーだぞ');
            return;
        }
        onImageSelect(file);
    }, [onImageSelect]);

    const onPaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) handleFile(file);
                return;
            }
        }
    }, [handleFile]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    return (
        <div
            className={`relative w-full max-w-2xl mx-auto p-10 rounded-3xl transition-all duration-500 font-sans group
        ${isDragOver
                    ? 'bg-gray-800/80 border-secondary shadow-[0_0_50px_rgba(34,211,238,0.4)] scale-[1.02]'
                    : 'bg-gray-900/60 border-primary/30 hover:border-primary hover:shadow-[0_0_30px_rgba(216,180,254,0.2)] hover:bg-gray-800/80'}
        border-2 backdrop-blur-md flex flex-col items-center justify-center text-center outline-none`}
            onPaste={onPaste}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            tabIndex={0}
        >
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                    src="/assets/moon_cat_detective.png"
                    alt="Moon Cat Detective"
                    className="w-40 h-40 object-contain drop-shadow-xl relative z-10 animate-bounce-slow"
                />
            </div>

            <p className="text-xl font-bold mb-3 text-white tracking-wide">
                画像を貼り付けるか、<br className="hidden sm:block" />
                アップロードして解析開始だぞ
            </p>

            <p className="text-sm text-gray-400 mb-8 font-medium">
                コピペ歓迎 / JPG・PNG・WEBP対応 (Max 10MB)
            </p>

            <label className="cursor-pointer bg-gradient-to-r from-gray-700 to-gray-800 hover:from-primary/80 hover:to-secondary/80 text-white font-bold py-3 px-8 rounded-xl transition-all border border-gray-600 hover:border-white/50 shadow-lg hover:shadow-primary/50 relative overflow-hidden group/btn">
                <span className="relative z-10">ファイルを選択するぞ</span>
                <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                />
            </label>

            {error && (
                <div className="absolute bottom-4 left-0 right-0 text-red-400 text-sm animate-pulse font-bold bg-red-900/20 py-2">
                    ⚠️ {error.replace('だにゃ', 'だぞ')}
                </div>
            )}

            <div className="absolute top-4 right-4 text-[10px] text-gray-600 font-mono border border-gray-700 rounded px-2 py-1">
                CTRL+V READY
            </div>
        </div>
    );
}
