'use client';

import { Bell, BellRing, CheckCircle2, ShieldAlert, TriangleAlert } from 'lucide-react';
import type { Verdict } from '@/lib/scam-engine';
import type { BrowserNotificationPermission } from '@/hooks/use-browser-notifications';

export function SafetyPulse({ verdict, permission, supported, onEnableAlerts }: { verdict: Verdict | null; permission: BrowserNotificationPermission; supported: boolean; onEnableAlerts: () => void }) {
  const tone = verdict === 'likely-scam' ? 'danger' : verdict === 'suspicious' || verdict === 'uncertain' ? 'caution' : 'safe';
  const Icon = tone === 'danger' ? ShieldAlert : tone === 'caution' ? TriangleAlert : CheckCircle2;
  const title = tone === 'danger' ? 'High-risk signs found' : tone === 'caution' ? 'Pause and verify' : 'No active warning';
  const detail = tone === 'danger' ? 'Do not send money or secrets.' : tone === 'caution' ? 'A second check is needed.' : 'Pattern checks are not proof of safety.';
  const alertsLabel = permission === 'granted' ? 'Warning alerts are on' : permission === 'denied' ? 'Warning alerts are blocked' : 'Enable warning alerts';
  return <div className={`safety-pulse ${tone}`} aria-live="polite"><span className="pulse-light" aria-hidden="true"/><Icon size={15} aria-hidden="true"/><span className="safety-pulse-copy"><strong>{title}</strong><small>{detail}</small></span>{supported && <button className="pulse-alert-button" type="button" onClick={onEnableAlerts} disabled={permission === 'granted' || permission === 'denied'} aria-label={alertsLabel} title={alertsLabel}>{permission === 'granted' ? <BellRing size={15}/> : <Bell size={15}/>}</button>}</div>;
}
