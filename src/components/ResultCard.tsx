import type { AnalysisResult } from '../lib/types';
import EvidenceMini from './EvidenceMini';

interface ResultCardProps {
    result: AnalysisResult;
    onReset: () => void;
}

export default function ResultCard({ result, onReset }: ResultCardProps) {
    const { label, confidence, reasoning, highlight_area, evidence } = result;

    // Determine which character to show
    const isAi = label === "AI濃厚";


    // Default to AI image if unsure, or specific logic


    const getLabelStyle = (lbl: string) => {
        switch (lbl) {
            case "AI濃厚": return "text-primary drop-shadow-[0_0_10px_rgba(216,180,254,0.5)]";
            case "HUMAN寄り": return "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]";
            default: return "text-gray-300";
        }
    };

    const handleShare = () => {
        const text = `月ねこAI解析結果：この画像は【${label}】\n` +
            `根拠：C2PA ${evidence.c2pa.present ? 'あり' : 'なし/不明'} / ` +
            `Detector ${evidence.ensembleScore}%\n` +
            `#月ねこAI判定局`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(216,180,254,0.2)] animate-fade-in relative overflow-visible mt-0 font-sans">



            {/* Top Banner with Share */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-xs text-secondary font-mono tracking-widest mb-1">MOON CAT DIAGNOSTIC</span>
                    <h2 className={`text-3xl font-black tracking-tight ${getLabelStyle(label)}`}>
                        {label}
                    </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Confidence</span>
                        <span className={`text-2xl font-black font-mono ${isAi ? 'text-primary' : 'text-green-400'}`}>{confidence}%</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-4 relative z-10">
                {/* Reasoning from Gemini */}
                {/* Reasoning from Gemini */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 min-h-[120px] flex items-center">
                    <p className="text-sm text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {reasoning || "解析データを統合中..."}
                    </p>
                </div>

                {/* Highlight Area */}
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded-lg w-fit">
                    <span className="text-secondary font-bold whitespace-nowrap px-1">Attention:</span>
                    <span className="text-white">{highlight_area || "全体"}</span>
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <EvidenceMini evidence={evidence} />
            </div>

            <div className="text-center relative z-10 space-y-3">
                <button
                    onClick={handleShare}
                    className="w-full py-2 bg-black/40 hover:bg-black/60 text-white rounded-lg border border-gray-600 transition flex items-center justify-center gap-2 text-sm"
                >
                    <span>𝕏</span> 結果をシェアする
                </button>

                <p className="text-[10px] text-gray-500">
                    本結果は推定です。再圧縮や加工により精度が低下する場合があります。
                </p>

                <button
                    onClick={onReset}
                    className="w-full py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-xl font-bold transition-all shadow-lg hover:shadow-secondary/20"
                >
                    別の画像を解析する
                </button>
            </div>
        </div>
    );
}
