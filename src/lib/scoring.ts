import type { DetectorResult, DiagnosisLabel, Evidence } from './types';

export function calcEnsemble(scores: DetectorResult[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / scores.length);
}

export function labelFromScores(scoreA: number, scoreB: number): DiagnosisLabel {
    // scoreA: Ateeqq, scoreB: OpenSDI -> Order doesn't matter for logic but good to track
    if (scoreA >= 70 && scoreB >= 70) return "AI濃厚";
    if (scoreA >= 70 || scoreB >= 70) return "グレー（参考）";
    if (scoreA < 40 && scoreB < 40) return "HUMAN寄り";

    // Fallback for middle ranges (e.g., 60 and 50)
    // Consistently return Grey or specific label? MVP says 'One >= 70' is Grey.
    // If both are 50, it falls through. Let's call it Gray as well or Human-leaning?
    // Conservative approach: If not definitively AI and not definitively Human -> Gray.
    return "グレー（参考）";
}

export function createDefaultEvidence(): Evidence {
    return {
        synthid: { checked: false, present: null },
        c2pa: { checked: false, present: null },
        detectors: [],
        ensembleScore: 0
    };
}

// Temporary MVP Confidence Logic
// In full version, this comes from Gemini or more complex weighting.
export function deriveConfidence(label: DiagnosisLabel, ensembleScore: number): number {
    if (label === "AI濃厚") return Math.max(80, ensembleScore);
    if (label === "HUMAN寄り") return Math.max(80, 100 - ensembleScore);
    return 60; // Grey is low confidence
}
