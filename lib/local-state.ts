import type { Assessment, CheckMode, Verdict } from './scam-engine';
import type { SupportedLanguage } from './vernacular';

export const STORAGE_KEY = 'shomar-protect-v1';
export type HistoryItem = { id: string; mode: CheckMode; verdict: Verdict; checkedAt: string; signals: number };
export type FamilyProfile = { id: string; name: string; role: 'Parent' | 'Child' | 'Caregiver'; ageBand: string };
export type CountryCode = 'NG' | 'KE' | 'GH' | 'ZA';
export type LocalState = { checklist: string[]; recovery: string[]; history: HistoryItem[]; familyChecklist: string[]; familyProfiles: FamilyProfile[]; appOverview: string[]; language: SupportedLanguage; primaryBank: string; country: CountryCode };
export const emptyState: LocalState = { checklist: [], recovery: [], history: [], familyChecklist: [], familyProfiles: [], appOverview: [], language: 'English', primaryBank: 'opay', country: 'NG' };
const modes = new Set(['message', 'link', 'screenshot', 'vendor']);
const verdicts = new Set(['likely-scam', 'suspicious', 'uncertain', 'no-signals']);
const languages = new Set<SupportedLanguage>(['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo']);
const validCountries = new Set<CountryCode>(['NG', 'KE', 'GH', 'ZA']);
export function parseLocalState(raw: string | null): LocalState {
  if (!raw) return { ...emptyState };
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return { ...emptyState };
    const strings = (values: unknown) => Array.isArray(values) ? [...new Set(values.filter(v => typeof v === 'string' && v.length < 80))].slice(0, 60) : [];
    const history: HistoryItem[] = Array.isArray(value.history) ? value.history.filter((item: unknown): item is HistoryItem => !!item && typeof item === 'object' && 'id' in item && typeof item.id === 'string' && item.id.length < 80 && 'mode' in item && modes.has(String(item.mode)) && 'verdict' in item && verdicts.has(String(item.verdict)) && 'checkedAt' in item && typeof item.checkedAt === 'string' && Number.isFinite(Date.parse(item.checkedAt)) && 'signals' in item && typeof item.signals === 'number' && Number.isInteger(item.signals) && item.signals >= 0 && item.signals <= 30).slice(0, 30).map(({ id, mode, verdict, checkedAt, signals }: HistoryItem) => ({ id, mode, verdict, checkedAt, signals })) : [];
    const familyChecklist = strings(value.familyChecklist);
    const familyProfiles: FamilyProfile[] = Array.isArray(value.familyProfiles) ? value.familyProfiles.filter((profile: unknown): profile is FamilyProfile => {
      if (!profile || typeof profile !== 'object') return false;
      const item = profile as Record<string, unknown>;
      return typeof item.id === 'string' && item.id.length < 80 && typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length < 60 && ['Parent', 'Child', 'Caregiver'].includes(String(item.role)) && typeof item.ageBand === 'string' && item.ageBand.length < 40;
    }).slice(0, 20).map((profile: FamilyProfile) => ({ id: profile.id, name: profile.name.trim(), role: profile.role, ageBand: profile.ageBand })) : [];
    const appOverview = strings(value.appOverview);
    const language: SupportedLanguage = languages.has(value.language) ? value.language : 'English';
    const primaryBank: string = typeof value.primaryBank === 'string' && value.primaryBank.length < 40 ? value.primaryBank : 'opay';
    const country: CountryCode = validCountries.has(value.country) ? value.country : 'NG';
    return { checklist: strings(value.checklist), recovery: strings(value.recovery), history, familyChecklist, familyProfiles, appOverview, language, primaryBank, country };
  } catch { return { ...emptyState }; }
}
export function historyEntry(result: Assessment, id: string): HistoryItem {
  return { id, mode: result.mode, verdict: result.verdict, checkedAt: result.checkedAt, signals: result.signals.length };
}
export function toggleItem(items: string[], id: string, checked: boolean) {
  return checked ? [...new Set([...items, id])] : items.filter(item => item !== id);
}
