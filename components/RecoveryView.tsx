'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, ExternalLink, LifeBuoy, Mail, MessageSquareText, Phone, ShieldCheck, Wallet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { guides } from '@/lib/safety-content';
import { BANK_PANIC_DIRECTORY } from '@/lib/ussd-directory.ts';

const icons = { message: MessageSquareText, mail: Mail, phone: Phone, wallet: Wallet, link: LifeBuoy };

export function RecoveryView({ guideId, onGuide, done, onToggle }: { guideId: string | null; onGuide: (id: string | null) => void; done: string[]; onToggle: (id: string, value: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [briefOpen, setBriefOpen] = useState(false);
  const [incident, setIncident] = useState('Account access');
  const [impact, setImpact] = useState('Not sure');
  const [notes, setNotes] = useState('');
  const [briefCopied, setBriefCopied] = useState(false);

  function copyIncidentBrief() {
    const safeNotes = notes.trim().slice(0, 800);
    const brief = [
      'SHOMAR CYBER INCIDENT BRIEF',
      '',
      `Situation: ${incident}`,
      `Money lost: ${impact}`,
      `Notes: ${safeNotes || 'No additional notes'}`,
      `Prepared: ${new Date().toLocaleString()}`,
      '',
      'Never add passwords, PINs, OTPs, recovery codes, full card numbers, BVN or NIN.',
      'This brief was prepared locally on this device for sharing with a bank, provider, or law enforcement.',
    ].join('\n');

    void navigator.clipboard.writeText(brief).then(() => {
      setBriefCopied(true);
      setTimeout(() => setBriefCopied(false), 3000);
    });
  }

  const guide = guides.find(g => g.id === guideId);
  if (!guide) {
    return (
      <section className="sos-view">
        <div className="notice-banner">
          <LifeBuoy size={22} />
          <div>
            <strong>You don’t have to figure it out all at once.</strong>
            <p>Choose what happened. We’ll help you work through the next steps.</p>
          </div>
        </div>

        <div className="guide-grid">
          {guides.map(g => {
            const Icon = icons[g.icon];
            return (
              <button className="guide-card panel" key={g.id} onClick={() => { setStep(0); onGuide(g.id); }}>
                <span className="icon-tile coral"><Icon size={24} /></span>
                <h2>{g.title}</h2>
                <p>{g.description}</p>
                <span className="guide-start">Start recovery guide <ArrowRight size={17} /></span>
              </button>
            );
          })}
        </div>

        {/* Incident Support Brief Generator */}
        <div className="panel" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="icon-tile blue" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Prepare an Incident Support Brief</h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                Create a safe, redacted summary to copy and share with your bank, telecom provider, or trusted responder.
              </p>
            </div>
          </div>

          {!briefOpen ? (
            <button className="outline-button" onClick={() => setBriefOpen(true)} style={{ marginTop: '0.5rem' }}>
              Create support brief <ChevronRight size={15} />
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  What happened?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Account access', 'Money sent', 'Lost phone', 'Threat or impersonation'].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIncident(item)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: '20px',
                        border: incident === item ? '2px solid #365FE9' : '1px solid #cbd5e1',
                        background: incident === item ? '#eff6ff' : '#f8fafc',
                        color: incident === item ? '#1e40af' : '#475569',
                        cursor: 'pointer',
                        fontWeight: incident === item ? 600 : 400,
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Was money lost?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['No', 'Yes', 'Not sure'].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setImpact(item)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: '20px',
                        border: impact === item ? '2px solid #365FE9' : '1px solid #cbd5e1',
                        background: impact === item ? '#eff6ff' : '#f8fafc',
                        color: impact === item ? '#1e40af' : '#475569',
                        cursor: 'pointer',
                        fontWeight: impact === item ? 600 : 400,
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="brief-notes" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Incident timeline & details (Redacted)
                </label>
                <textarea
                  id="brief-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  maxLength={800}
                  placeholder="What happened and when? Example: Received fake transfer SMS at 2:15 PM, told me to send refund..."
                  style={{ width: '100%', minHeight: '90px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }}
                />
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>
                  ⚠️ Never include passwords, PINs, OTPs, recovery codes, full card numbers, BVN or NIN.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="primary-button" onClick={copyIncidentBrief} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={16} />
                  {briefCopied ? 'Brief Copied!' : 'Copy Support Brief'}
                </button>
                <button className="outline-button" onClick={() => { setNotes(''); setBriefOpen(false); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency USSD Account Freeze Directory */}
        <div className="panel" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="icon-tile coral" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <Phone size={20} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#9a3412' }}>Emergency USSD Account Freeze Directory</h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                If your phone or account is compromised, dial these official panic codes from ANY phone to immediately halt debit transactions.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
            {BANK_PANIC_DIRECTORY.map(bank => (
              <div
                key={bank.id}
                style={{
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #fed7aa',
                  background: '#fffaf5',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{bank.shortName}</strong>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#ffedd5', color: '#c2410c', fontWeight: 600 }}>
                      {bank.category}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                    {bank.instructions}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  {bank.ussdCode ? (
                    <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c2410c', background: '#ffedd5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {bank.ussdCode}
                    </code>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>In-App Lock</span>
                  )}
                  {bank.dialUri && (
                    <a
                      href={bank.dialUri}
                      className="primary-button"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '6px' }}
                    >
                      <Phone size={13} style={{ marginRight: '0.3rem', display: 'inline' }} />
                      Dial Code
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sos-footnote">
          <ShieldCheck size={20} />
          <p>
            These are self-guided steps with official support links and verified bank panic codes. SHOMAR cannot access your accounts, reverse payments, or guarantee recovery. No live agent is connected.
          </p>
        </div>
      </section>
    );
  }

  const current = guide.steps[Math.min(step, guide.steps.length - 1)];
  const count = guide.steps.filter((_, i) => done.includes(`${guide.id}-${i}`)).length;
  return <section className="recovery-layout"><div><button className="text-button back-button" onClick={() => onGuide(null)}><ArrowLeft size={16}/>All recovery guides</button><div className="notice-banner urgent"><LifeBuoy size={22}/><p>{guide.urgent}</p></div><div className="panel step-panel"><div className="section-heading"><span className="eyebrow">STEP {step + 1} OF {guide.steps.length}</span><span className="secondary-label">{count} completed</span></div><Progress value={count / guide.steps.length * 100} aria-label={`${count} of ${guide.steps.length} steps marked complete`}/><h2>{current.title}</h2><p>{current.body}</p><div className="official-actions">{[current.action, current.secondary].filter(Boolean).map(a => a && <a key={a.href} className="outline-button" href={a.href} target="_blank" rel="noopener noreferrer">{a.label}<ExternalLink size={15}/></a>)}</div><label className="step-completion"><Checkbox checked={done.includes(`${guide.id}-${step}`)} onCheckedChange={checked => onToggle(`${guide.id}-${step}`, checked === true)}/><span>I’ve completed this step</span></label><div className="step-controls"><button className="outline-button" disabled={step === 0} onClick={() => setStep(n => Math.max(0, n - 1))}><ArrowLeft size={16}/>Back</button>{step < guide.steps.length - 1 ? <button className="primary-button" onClick={() => setStep(n => n + 1)}>Next step<ArrowRight size={16}/></button> : <button className="primary-button" onClick={() => onGuide(null)}>Back to guides<Check size={16}/></button>}</div>{count === guide.steps.length && <p className="completion-note"><Check size={16}/>You’ve marked every step complete. Continue following up with the relevant provider; this does not confirm the incident is resolved.</p>}</div><a className="source-link" href={guide.source.href} target="_blank" rel="noopener noreferrer">Based on {guide.source.label}<ExternalLink size={13}/></a></div><aside className="panel step-index"><span className="card-kicker">YOUR RECOVERY PLAN</span><h3>{guide.title}</h3><ol>{guide.steps.map((s, i) => <li key={s.title}><button className={step === i ? 'selected' : ''} aria-current={step === i ? 'step' : undefined} onClick={() => setStep(i)}><span className={done.includes(`${guide.id}-${i}`) ? 'done' : ''}>{done.includes(`${guide.id}-${i}`) ? <Check size={14}/> : i + 1}</span><span>{s.title}</span><ChevronRight size={15}/></button></li>)}</ol><p><LockNote/>Progress is saved on this device. You can return to any step.</p></aside></section>;
}
function LockNote(){return <ShieldCheck size={15}/>;}
