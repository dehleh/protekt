import { catalog, appTaskIds } from './catalog.ts';
import type { Assessment, Verdict } from '../../../lib/scam-engine';

export const STORAGE_KEY = 'shomar-mobile-v1';
export type Summary = { id: string; verdict: Verdict; mode: 'message' | 'link' | 'vendor'; checkedAt: string; signals: number };
export type Member = { id: string; name: string; role: 'Child' | 'Parent' | 'Caregiver'; age: 'Under 10' | '10–12' | '13–15' | '16–17' | 'Adult' };
export type Language = 'English' | 'Pidgin assist' | 'Hausa' | 'Yoruba' | 'Igbo';
export type ReminderCadence = 'off' | 'weekly' | 'monthly';
export type SupportedCountry = 'NG' | 'KE' | 'GH' | 'ZA';
export type MobileState = { version: 2; onboarded: boolean; selectedApps: string[]; appProgress: Record<string, string[]>; family: Member[]; familyDone: string[]; protectionDone: string[]; recoveryDone: string[]; history: Summary[]; alerts: boolean; statusCard: boolean; appLock: boolean; lowData: boolean; language: Language; reminders: ReminderCadence; primaryBank: string; ambientShield: boolean; country: SupportedCountry };
export function initialState(): MobileState { return { version: 2, onboarded: false, selectedApps: [], appProgress: {}, family: [], familyDone: [], protectionDone: [], recoveryDone: [], history: [], alerts: false, statusCard: false, appLock: false, lowData: false, language: 'English', reminders: 'off', primaryBank: 'opay', ambientShield: true, country: 'NG' }; }
const ids = new Set(catalog.map(app => app.id));
const verdicts = new Set(['likely-scam', 'suspicious', 'uncertain', 'no-signals']);
const languages = new Set<Language>(['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo']);
const countries = new Set<SupportedCountry>(['NG', 'KE', 'GH', 'ZA']);
const strings = (value: unknown): string[] => Array.isArray(value) ? [...new Set(value.filter((x): x is string => typeof x === 'string' && x.length < 80))].slice(0, 60) : [];
export function restoreState(raw: string | null): MobileState {
  const fallback = initialState();
  try {
    const v = JSON.parse(raw ?? 'null');
    if (!v || typeof v !== 'object' || ![1, 2].includes(v.version)) return fallback;
    const selectedApps = strings(v.selectedApps).filter(id => ids.has(id));
    const appProgress: Record<string, string[]> = {};
    for (const id of selectedApps) appProgress[id] = strings(v.appProgress?.[id]).filter(x => (appTaskIds as readonly string[]).includes(x));
    const history = (Array.isArray(v.history) ? v.history : []).filter((h: any) => h && typeof h.id === 'string' && h.id.length < 80 && verdicts.has(h.verdict) && ['message', 'link', 'vendor'].includes(h.mode) && typeof h.checkedAt === 'string' && Number.isFinite(Date.parse(h.checkedAt)) && Number.isInteger(h.signals) && h.signals >= 0 && h.signals <= 30).slice(0, 30).map((h: Summary) => ({ id: h.id, verdict: h.verdict, mode: h.mode, checkedAt: h.checkedAt, signals: h.signals }));
    const family: Member[] = (Array.isArray(v.family) ? v.family : []).filter((m: any) => m && typeof m.id === 'string' && m.id.length < 80 && typeof m.name === 'string' && m.name.trim() && m.name.length <= 40 && ['Child', 'Parent', 'Caregiver'].includes(m.role) && ['Under 10', '10–12', '13–15', '16–17', 'Adult'].includes(m.age)).slice(0, 12).map((m: Member) => ({ id: m.id, name: m.name.trim(), role: m.role, age: m.age }));
    const primaryBank = typeof v.primaryBank === 'string' && v.primaryBank.length < 40 ? v.primaryBank : 'opay';
    const country: SupportedCountry = countries.has(v.country) ? v.country : 'NG';
    const ambientShield = typeof v.ambientShield === 'boolean' ? v.ambientShield : true;
    return { ...fallback, onboarded: v.onboarded === true, selectedApps, appProgress, history, family, familyDone: strings(v.familyDone), protectionDone: strings(v.protectionDone), recoveryDone: strings(v.recoveryDone), alerts: v.alerts === true, statusCard: v.statusCard === true, appLock: v.appLock === true, lowData: v.lowData === true, language: languages.has(v.language) ? v.language : 'English', reminders: ['weekly', 'monthly'].includes(v.reminders) ? v.reminders : 'off', primaryBank, ambientShield, country };
  } catch { return fallback; }
}
export function toggle(items: string[], id: string) { return items.includes(id) ? items.filter(x => x !== id) : [...items, id]; }
export function selectApp(state: MobileState, id: string): MobileState {
  if (!ids.has(id)) return state;
  const appProgress = { ...state.appProgress };
  if (state.selectedApps.includes(id)) delete appProgress[id];
  return { ...state, selectedApps: toggle(state.selectedApps, id), appProgress };
}
export function summarize(result: Assessment, id: string): Summary {
  return { id, verdict: result.verdict, checkedAt: result.checkedAt, mode: result.mode === 'link' ? 'link' : result.mode === 'vendor' ? 'vendor' : 'message', signals: result.signals.length };
}
export function pulse(summary?: Summary, now = Date.now()) {
  if (!summary) return { tone: 'neutral', title: 'Ready for your first check', detail: 'Account monitoring is not connected.' } as const;
  const time = Date.parse(summary.checkedAt);
  if (!Number.isFinite(time) || time > now + 60_000 || now - time > 86_400_000) return { tone: 'neutral', title: 'Last check is out of date', detail: 'Run a new check. No live monitoring.' } as const;
  if (summary.verdict === 'likely-scam') return { tone: 'danger', title: 'Last check: strong warning', detail: 'Pause before paying or sharing details.' } as const;
  if (summary.verdict !== 'no-signals') return { tone: 'caution', title: 'Last check: verify first', detail: 'The submitted content needs a closer look.' } as const;
  return { tone: 'good', title: 'Last check: no warning found', detail: 'Limited pattern checks. Safety is not guaranteed.' } as const;
}
