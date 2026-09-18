'use client';
import { ArrowRight, CircleAlert, CircleHelp, Copy, Download, FileText, ShieldCheck, Users, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Assessment } from '@/lib/scam-engine';
import { VERNACULAR_GUIDANCE, type SupportedLanguage } from '@/lib/vernacular';
import { EvidenceSlipModal } from './EvidenceSlipModal';
import { FamilyBroadcastModal } from './FamilyBroadcastModal';
import { ScamBusterCardModal } from './ScamBusterCardModal';
import { useFeatureFlags } from '@/hooks/use-feature-flags';

export function CheckResult({ result, language = 'English', onSOS, onClear }: { result: Assessment; language?: SupportedLanguage; onSOS: () => void; onClear: () => void }) {
  const { flags } = useFeatureFlags();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [scamBusterOpen, setScamBusterOpen] = useState(false);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const localized = VERNACULAR_GUIDANCE[language]?.[result.verdict] ?? VERNACULAR_GUIDANCE['English'][result.verdict];
  const Icon = result.verdict === 'likely-scam' || result.verdict === 'suspicious' ? CircleAlert : result.verdict === 'uncertain' ? CircleHelp : ShieldCheck;

  function toggleSpeech() {
    if (!speechSupported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(localized.speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  const report = [
    'SHOMAR Protect — Pattern check',
    result.title,
    result.summary,
    '',
    `LOCALIZED GUIDANCE (${language}):`,
    localized.advice,
    '',
    ...result.signals.map(s => `${s.title}: ${s.detail}`),
    '',
    'NEXT STEPS',
    ...result.actions.map((a, i) => `${i + 1}. ${a}`),
    '',
    'This is a limited pattern check, not live verification. No malware scan, reputation lookup, payment verification, or account access was performed.',
    `Checked: ${new Date(result.checkedAt).toLocaleString()}`,
  ].join('\n');

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  function downloadReport() {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'shomar-check.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const trafficLight = {
    'likely-scam': {
      emoji: '🛑',
      headline: 'STOP. DO NOT SEND MONEY OR CODES.',
      badgeColor: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5',
      primaryActionText: '🚨 Emergency: Freeze Bank Account (Cyber SOS)',
      primaryActionClass: 'emergency-action-btn',
    },
    suspicious: {
      emoji: '⚠️',
      headline: 'WAIT. PAUSE & VERIFY BEFORE PAYING.',
      badgeColor: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fcd34d',
      primaryActionText: '🛡️ Verify Before Sending (Cyber SOS)',
      primaryActionClass: 'warning-action-btn',
    },
    uncertain: {
      emoji: '🔍',
      headline: 'MORE INFORMATION NEEDED.',
      badgeColor: '#4f46e5',
      bgColor: '#f5f3ff',
      borderColor: '#c7d2fe',
      primaryActionText: '🛡️ How to Verify in Cyber SOS',
      primaryActionClass: 'neutral-action-btn',
    },
    'no-signals': {
      emoji: '🟢',
      headline: 'LOOKS CLEAR SO FAR.',
      badgeColor: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#86efac',
      primaryActionText: '🛡️ Review Protection Habits',
      primaryActionClass: 'safe-action-btn',
    },
  }[result.verdict];

  return (
    <section className={`assessment ${result.verdict}`} aria-live="polite">
      {/* Street-Level Traffic Light Banner */}
      <div style={{ padding: '0.875rem 1rem', borderRadius: '12px', background: trafficLight.bgColor, border: `2px solid ${trafficLight.borderColor}`, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{trafficLight.emoji}</span>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: trafficLight.badgeColor }}>
              TRAFFIC LIGHT VERDICT
            </span>
            <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {trafficLight.headline}
            </h3>
          </div>
        </div>
        <button className="icon-button" aria-label="Close result" onClick={onClear}><X size={18} /></button>
      </div>

      <div className="result-heading" style={{ marginTop: '0.5rem' }}>
        <span className="result-icon"><Icon size={24} /></span>
        <div style={{ flex: 1 }}>
          <span className="card-kicker">ANALYSIS SUMMARY</span>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{result.title}</h4>
        </div>
        {speechSupported && flags.voiceGuidance && (
          <button
            className="text-button"
            onClick={toggleSpeech}
            style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: speaking ? '#fee2e2' : '#e0e7ff', color: speaking ? '#dc2626' : '#365fe9', borderRadius: '8px', border: '1px solid rgba(54,95,233,0.2)' }}
            aria-label={speaking ? 'Stop listening' : 'Listen to voice narration in ' + language}
          >
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{speaking ? 'Stop Voice' : `Listen (${language})`}</span>
          </button>
        )}
      </div>

      <p className="result-summary">{result.summary}</p>

      {/* Vernacular Guidance Box */}
      <div className="vernacular-callout" style={{ margin: '0.75rem 0', padding: '0.875rem 1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#365FE9', display: 'block', marginBottom: '0.25rem' }}>
          {language} Guidance · {localized.badge}
        </span>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.5', color: '#1e293b', fontWeight: 600 }}>
          {localized.advice}
        </p>
      </div>

      {/* 1-Click Giant Action Button */}
      <div style={{ margin: '1rem 0' }}>
        <button
          onClick={onSOS}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: result.verdict === 'likely-scam' ? '#dc2626' : result.verdict === 'suspicious' ? '#d97706' : '#365fe9',
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <span>{trafficLight.primaryActionText}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* What To Do Next Steps */}
      <div className="result-next" style={{ marginTop: '1rem' }}>
        <h4>Key Actions</h4>
        <ol>
          {result.actions.map(action => <li key={action}>{action}</li>)}
        </ol>
      </div>

      {/* Collapsed Technical Details for Simplicity */}
      {result.signals.length > 0 && (
        <details style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
            🔍 Why was this flagged? ({result.signals.length} technical {result.signals.length === 1 ? 'sign' : 'signs'} detected)
          </summary>
          <div className="result-evidence" style={{ marginTop: '0.75rem' }}>
            {result.signals.map(signal => (
              <div key={signal.id} className="signal" style={{ marginBottom: '0.5rem' }}>
                <span />
                <div>
                  <strong>{signal.title}</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{signal.detail}</p>
                </div>
              </div>
            ))}
            {result.domains.length > 0 && (
              <div className="domain-list" style={{ marginTop: '0.5rem' }}>
                <span>Destinations found:</span>
                {result.domains.map(domain => <code key={domain}>{domain}</code>)}
              </div>
            )}
          </div>
        </details>
      )}

      <div className="result-tools" style={{ marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="text-button" onClick={copyReport}><Copy size={14} />{copied ? 'Copied' : 'Copy guidance'}</button>
        <button className="text-button" onClick={downloadReport}><Download size={14} />Save guidance</button>
        {flags.evidenceSlip && (
          <button className="text-button" onClick={() => setEvidenceOpen(true)} style={{ color: '#2563EB', fontWeight: 600 }}>
            <FileText size={14} />📄 Bank Evidence Slip
          </button>
        )}
        {flags.familyBroadcast && (
          <button className="text-button" onClick={() => setBroadcastOpen(true)} style={{ color: '#DC2626', fontWeight: 600 }}>
            <Users size={14} />🚨 Alert Family &amp; Circle
          </button>
        )}
        {flags.scamBusterCard && (result.verdict === 'likely-scam' || result.verdict === 'suspicious') && (
          <button
            className="text-button"
            onClick={() => setScamBusterOpen(true)}
            style={{ color: '#EA580C', fontWeight: 700 }}
          >
            📲 Share WhatsApp Scam Card
          </button>
        )}
      </div>
      {copyError && <p role="status">Copying isn’t available here. Use Save guidance instead.</p>}
      <p className="result-limit">Pattern checks only. No account access, phone scanning, or live website visit is performed.</p>

      {/* 1-Tap Incident Slip, Family Broadcast & WhatsApp Scam Buster Modals */}
      <EvidenceSlipModal
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        result={result}
      />
      <FamilyBroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        threatDetail={result.summary}
      />
      <ScamBusterCardModal
        isOpen={scamBusterOpen}
        onClose={() => setScamBusterOpen(false)}
        account={result.summary.match(/\b\d{10}\b/)?.[0] || 'Flagged Entity'}
        bankName="Verified Bank/Fintech"
        modus={result.title}
      />
    </section>
  );
}

