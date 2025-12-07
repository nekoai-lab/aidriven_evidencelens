import type { Evidence } from '../lib/types';

interface EvidenceMiniProps {
    evidence: Evidence;
}

const StatusIcon = ({ checked, present, label }: { checked: boolean, present: boolean | null, label: string }) => {
    let statusText = "未判定";
    let statusColor = "text-gray-500";

    if (checked) {
        if (present === true) {
            statusText = "検出あり";
            statusColor = "text-red-400";
        } else if (present === false) {
            statusText = "検出なし";
            statusColor = "text-gray-300";
        } else {
            statusText = "未判定";
            statusColor = "text-gray-500";
        }
    }

    return (
        <div className="flex justify-between items-center text-xs py-1 border-b border-gray-700/50 last:border-0">
            <span className="text-gray-400">{label}</span>
            <span className={`font-mono ${statusColor}`}>{statusText}</span>
        </div>
    );
};

export default function EvidenceMini({ evidence }: EvidenceMiniProps) {
    const { synthid, c2pa, ensembleScore } = evidence;

    return (
        <div className="bg-gray-900/50 rounded p-3 text-sm border border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Detection Evidence</h4>


            <StatusIcon checked={c2pa.checked} present={c2pa.present} label="C2PA (Credentials)" />

            <div className="flex justify-between items-center text-xs py-1">
                <span className="text-gray-400">Detector Ensemble</span>
                <span className={`font-mono ${ensembleScore >= 50 ? 'text-primary' : 'text-gray-300'}`}>
                    {ensembleScore}%
                </span>
            </div>
        </div>
    );
}
