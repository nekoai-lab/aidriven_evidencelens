import type { HistoryItem } from '../lib/types';
import { getHistory, clearHistory } from '../lib/storage';
import { useEffect, useState } from 'react';

interface HistoryPanelProps {
    onSelect: (item: HistoryItem) => void;
    refreshTrigger?: number; // Prop to force refresh when diagnosis finishes
}

export default function HistoryPanel({ onSelect, refreshTrigger }: HistoryPanelProps) {
    const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(getHistory());
    }, [refreshTrigger]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('履歴をすべて削除しますか？')) {
            clearHistory();
            setHistory([]);
        }
    };

    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-8 backdrop-blur-sm bg-black/20 rounded-xl p-6 animate-fade-in border border-gray-800/30">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-gray-400 text-[10px] font-mono tracking-widest uppercase">
                        Past Scans / 履歴
                    </h3>
                    <span className="text-[10px] text-gray-600 border-l border-gray-700 pl-2">Max 10</span>
                </div>
                <button
                    onClick={handleClear}
                    className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/20 transition-all font-mono"
                >
                    CLEAR ALL
                </button>
            </div>

            <div className="space-y-2">
                {history.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="bg-gray-800/50 border border-gray-700/50 rounded flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/50 hover:border-primary transition group"
                    >
                        {/* Left: Info */}
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-gray-500 font-mono">
                                {new Date(item.createdAt).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-300 font-medium truncate max-w-[200px]">
                                {item.imageMeta.name || 'Untitled'}
                            </span>
                        </div>

                        {/* Right: Label */}
                        <div className={`
              text-[10px] px-2 py-0.5 rounded-full font-bold
              ${item.result.label === 'AI濃厚' ? 'bg-primary/20 text-primary' :
                                item.result.label === 'HUMAN寄り' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/50 text-gray-300'}
            `}>
                            {item.result.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
