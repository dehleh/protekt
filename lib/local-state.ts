import type { Assessment, CheckMode, Verdict } from './scam-engine';

export const STORAGE_KEY = 'shomar-protect-v1';
export type HistoryItem = { id: string; mode: CheckMode; verdict: Verdict; checkedAt: string; signals: number };
export type LocalState = { checklist: string[]; recovery: string[]; history: HistoryItem[] };
export const emptyState: LocalState = { checklist: [], recovery: [], history: [] };
const modes = new Set(['message', 'link', 'screenshot']);
const verdicts = new Set(['likely-scam', 'suspicious', 'uncertain', 'no-signals']);
export function parseLocalState(raw: string | null): LocalState {
  if (!raw) return { ...emptyState };
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return { ...emptyState };
    const strings = (values: unknown) => Array.isArray(values) ? [...new Set(values.filter(v => typeof v === 'string' && v.length < 80))].slice(0, 60) : [];
    const history: HistoryItem[] = Array.isArray(value.history) ? value.history.filter((item: unknown): item is HistoryItem => !!item && typeof item === 'object' && 'id' in item && typeof item.id === 'string' && item.id.length < 80 && 'mode' in item && modes.has(String(item.mode)) && 'verdict' in item && verdicts.has(String(item.verdict)) && 'checkedAt' in item && typeof item.checkedAt === 'string' && Number.isFinite(Date.parse(item.checkedAt)) && 'signals' in item && typeof item.signals === 'number' && Number.isInteger(item.signals) && item.signals >= 0 && item.signals <= 30).slice(0, 30).map(({ id, mode, verdict, checkedAt, signals }: HistoryItem) => ({ id, mode, verdict, checkedAt, signals })) : [];
    return { checklist: strings(value.checklist), recovery: strings(value.recovery), history };
  } catch { return { ...emptyState }; }
}
export function historyEntry(result: Assessment, id: string): HistoryItem {
  return { id, mode: result.mode, verdict: result.verdict, checkedAt: result.checkedAt, signals: result.signals.length };
}
export function toggleItem(items: string[], id: string, checked: boolean) {
  return checked ? [...new Set([...items, id])] : items.filter(item => item !== id);
}
