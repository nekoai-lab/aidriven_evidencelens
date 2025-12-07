import { useState, useCallback } from 'react';
import InputPanel from '../components/InputPanel';
import PreviewPane from '../components/PreviewPane';
import ScanOverlay from '../components/ScanOverlay';
import ResultCard from '../components/ResultCard';
import HistoryPanel from '../components/HistoryPanel';
import { detectImage } from '../lib/api';
import { saveHistoryResult } from '../lib/storage';
import type { AnalysisResult, HistoryItem } from '../lib/types';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [historyTrigger, setHistoryTrigger] = useState(0);

    const startAnalysis = useCallback(async (targetFile: File) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        // Artificial minimum delay for UX (Cyber scanning effect)
        const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const [apiResult] = await Promise.all([
                detectImage(targetFile),
                minDelay
            ]);

            setResult(apiResult);
            saveHistoryResult(
                apiResult,
                {
                    name: targetFile.name,
                    type: targetFile.type,
                    size: targetFile.size
                },
                'upload'
            );
            setHistoryTrigger(prev => prev + 1);

        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "解析に失敗したぞ...";
            setError(message);
        } finally {
            setIsScanning(false);
        }
    }, []);

    const handleImageSelect = (selectedFile: File) => {
        setFile(selectedFile);
        startAnalysis(selectedFile);
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setFile(null);
        setResult(item.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-background text-white selection:bg-primary/30 font-sans overflow-hidden">

            {/* Cyber Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Base Dark - Slightly lighter for better contrast */}
                <div className="absolute inset-0 bg-[#0F172A]"></div>

                {/* Cyber Grid - Increased opacity and size */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(216,180,254,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

                {/* Neon Glows - Stronger and more vibrant */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/30 blur-[120px] rounded-full mix-blend-screen opacity-80 animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen opacity-60"></div>

                {/* Floating Particles/Stars */}
                <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:100px_100px] opacity-20 animate-pulse-slow"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

                {/* Header Text Only (No Image) */}
                <h1 className="mt-4 text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-secondary mb-1 tracking-tighter drop-shadow-[0_0_20px_rgba(216,180,254,0.3)]">
                    月ねこAI<span className="text-2xl sm:text-4xl ml-2 font-bold text-white/80 tracking-widest">判定局</span>
                </h1>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-secondary"></div>
                    <p className="text-secondary/80 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase">
                        AI-Generated Image Detector v1.0
                    </p>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary"></div>
                </div>

                <div className="w-full transition-all duration-500 min-h-[400px] flex flex-col items-center justify-start relative">

                    {isScanning && (
                        <div className="absolute inset-x-0 top-0 bottom-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl overflow-hidden min-h-[400px]">
                            <ScanOverlay />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-6 animate-pulse backdrop-blur-md">
                            ⚠️ {error}
                            <button onClick={handleReset} className="ml-4 underline text-sm hover:text-white">再試行</button>
                        </div>
                    )}

                    {!file && !result && !isScanning && (
                        <InputPanel onImageSelect={handleImageSelect} />
                    )}

                    {/* Keep content rendered but hidden/dimmed during scan if needed, or just replace */}
                    {file && isScanning && (
                        // Hidden placeholder to maintain height if needed, or just show nothing.
                        // Actually, we can show the preview BEHIND the overlay if we want,
                        // but user said "overlay screen" feels separate.
                        // Let's just keep the structure simpler:
                        <div className="opacity-0">
                            <PreviewPane file={file} onReset={() => { }} />
                        </div>
                    )}

                    {/* Result */}
                    {result && !isScanning && (
                        <ResultCard result={result} onReset={handleReset} />
                    )}
                </div>

                <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={historyTrigger} />
            </div>
        </div>
    );
}
