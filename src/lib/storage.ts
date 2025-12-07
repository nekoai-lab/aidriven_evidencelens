import type { AnalysisResult, HistoryItem } from './types';

const STORAGE_KEY = 'tsukineko_ai_history';
const MAX_HISTORY_ITEMS = 10;

export function getHistory(): HistoryItem[] {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return [];
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to load history', e);
        return [];
    }
}

export function saveHistoryResult(
    result: AnalysisResult,
    imageMeta: HistoryItem['imageMeta'],
    source: HistoryItem['source']
): HistoryItem {
    const history = getHistory();

    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source,
        imageMeta,
        result
    };

    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
        console.error('Failed to save history', e);
    }

    return newItem;
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}
