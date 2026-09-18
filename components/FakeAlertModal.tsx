'use client';
import { AlertOctagon, CheckCircle2, Copy, ExternalLink, HelpCircle, PhoneCall, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { verifyBankAlert, type FakeAlertResult, SUPPORTED_BANKS } from '@/lib/fake-alert';

interface FakeAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_EXAMPLES = [
  {
    label: '🚨 Fake GTBank (Personal Phone #)',
    sender: '+2348039871234',
    text: 'Acct: 0123456789\nTxn: Credit\nAmt: NGN 150,000.00\nDes: TRF/ADEKUNLE/GOODS\nDate: 19-Sep-2026 14:22\nBal: NGN 182,450.00\nTotal Bal: NGN 182,450.00',
  },
  {
    label: '🚨 M-Pesa Fake Reversal Scam',
    sender: '+254712345678',
    text: 'Confirmed. Ksh 25,000 sent to JANE WANJIKU on 19/09/2026. Please reverse the money immediately my mother is in hospital I sent by mistake!!',
  },
  {
    label: '🟢 Authentic Format Template',
    sender: 'ACCESSBANK',
    text: 'Txn: Credit\nAc: 002******19\nAmt: NGN 85,000.00 CR\nDesc: NIP/GTB/CHIDI OKEKE/PURCHASE\nDate: 19-Sep-2026 11:05\nBal: NGN 104,220.50\nSession ID: 000013260919110545000238491823',
  },
];

export function FakeAlertModal({ isOpen, onClose }: FakeAlertModalProps) {
  const [sender, setSender] = useState('');
  const [alertText, setAlertText] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [result, setResult] = useState<FakeAlertResult | null>(null);

  if (!isOpen) return null;

  function handleVerify() {
    if (!alertText.trim()) return;
    const res = verifyBankAlert(alertText, sender);
    setResult(res);
  }

  function applyPreset(preset: typeof PRESET_EXAMPLES[0]) {
    setSender(preset.sender);
    setAlertText(preset.text);
    const res = verifyBankAlert(preset.text, preset.sender);
    setResult(res);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Fake Bank Alert & Reversal Verifier</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Detect spoofed SMS notifications before handing over goods</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          
          {/* Presets */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              Test Common Scam Formats:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_EXAMPLES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                Sender ID / Phone Number Shown on SMS:
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. +2348031234567 or GTBANK"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                Look at the very top of your phone screen where the message came from.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                Paste Received SMS Credit Notification:
              </label>
              <textarea
                rows={4}
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="Paste the credit alert text here (e.g. Txn: Credit, Amt: NGN 50,000, Bal: NGN...)"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={!alertText.trim()}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                background: alertText.trim() ? '#365fe9' : '#94a3b8',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: alertText.trim() ? 'pointer' : 'not-allowed',
                boxShadow: alertText.trim() ? '0 4px 6px -1px rgba(54,95,233,0.3)' : 'none',
              }}
            >
              Verify SMS Integrity
            </button>
          </div>

          {/* Analysis Results Display */}
          {result && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', border: `2px solid ${result.verdict === 'likely-fake' ? '#fca5a5' : result.verdict === 'suspicious' ? '#fcd34d' : '#86efac'}`, background: result.verdict === 'likely-fake' ? '#fef2f2' : result.verdict === 'suspicious' ? '#fffbeb' : '#f0fdf4' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {result.verdict === 'likely-fake' ? (
                  <AlertOctagon size={24} color="#dc2626" />
                ) : result.verdict === 'suspicious' ? (
                  <AlertOctagon size={24} color="#d97706" />
                ) : (
                  <ShieldCheck size={24} color="#16a34a" />
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: result.verdict === 'likely-fake' ? '#991b1b' : result.verdict === 'suspicious' ? '#92400e' : '#166534' }}>
                    {result.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    Identified Bank: {result.detectedBank} · Risk Score: {result.riskScore}/100
                  </span>
                </div>
              </div>

              <p style={{ margin: '0.5rem 0', fontSize: '0.88rem', lineHeight: '1.5', color: '#1e293b' }}>
                {result.summary}
              </p>

              {/* Threat Flags */}
              {result.threatFlags.length > 0 && (
                <div style={{ margin: '0.75rem 0', padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #dc2626' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Flags Detected:
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                    {result.threatFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Field Integrity Breakdown */}
              <div style={{ margin: '0.75rem 0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Integrity Verification Checklist:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {result.fieldChecks.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', minWidth: '130px' }}>{f.field}:</span>
                      <span style={{ color: f.status === 'danger' ? '#dc2626' : f.status === 'warning' ? '#d97706' : '#16a34a', fontWeight: 600 }}>{f.value}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>{f.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct USSD Balance Confirmation CTA */}
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#0f172a', borderRadius: '10px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8', fontWeight: 800, display: 'block' }}>
                    CRITICAL SAFEGUARD
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                    Never release goods based on SMS. Verify live balance:
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Official Code: <strong style={{ color: '#ffffff' }}>{result.ussdVerifyCode}</strong>
                  </span>
                </div>
                <a
                  href={result.ussdVerifyDialer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <PhoneCall size={15} />
                  <span>Dial Balance</span>
                </a>
              </div>

              {/* Localized Advice in Pidgin */}
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong>Pidgin Advice:</strong> {result.recommendationPidgin}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#e2e8f0', border: 'none', color: '#334155', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Close Verifier
          </button>
        </div>

      </div>
    </div>
  );
}
