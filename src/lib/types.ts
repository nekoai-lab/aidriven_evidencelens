export interface DetectorResult {
    name: string;
    score: number; // 0-100
}

export interface VerificationResult {
    checked: boolean;
    present: boolean | null; // true=detect/present, false=not found, null=unknown/unchecked
    note?: string;
}

export interface Evidence {
    synthid: VerificationResult;
    c2pa: VerificationResult;
    detectors: DetectorResult[];
    ensembleScore: number;
}

export type DiagnosisLabel = "AI濃厚" | "グレー（参考）" | "HUMAN寄り" | "判定不能";

export interface AnalysisResult {
    isAi: boolean;
    label: DiagnosisLabel;
    confidence: number; // 0-100
    reasoning: string;
    highlight_area: string; // MVP: plain text description
    evidence: Evidence;
}

export interface HistoryItem {
    id: string;
    createdAt: number;
    source: 'paste' | 'upload' | 'drop';
    imageMeta: {
        name?: string;
        type: string;
        size: number;
        previewUrl?: string; // For local history display
    };
    result: AnalysisResult;
}
