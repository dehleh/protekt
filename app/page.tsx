'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clipboard, Clock3, FileImage, Grid2X2, History, LifeBuoy, Link2, LockKeyhole, MessageSquareText, PhoneCall, ScanLine, Shield, ShieldCheck, ShoppingBag, Sparkles, UsersRound } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { assess, detectCheckMode, validateInput, type Assessment, type CheckMode, type Verdict } from '@/lib/scam-engine';
import { examples, protectionTasks } from '@/lib/safety-content';
import { BANK_PANIC_DIRECTORY, getBanksByCountry, SUPPORTED_COUNTRIES } from '@/lib/ussd-directory';
import { CheckResult } from '@/components/CheckResult';
import { RecoveryView } from '@/components/RecoveryView';
import { ProtectionView } from '@/components/ProtectionView';
import { FamilyView } from '@/components/FamilyView';
import { AppOverviewView } from '@/components/AppOverviewView';
import { HistoryView } from '@/components/HistoryView';
import { ImageInput } from '@/components/ImageInput';
import { SafetyPulse } from '@/components/SafetyPulse';
import { VendorTrustModal } from '@/components/VendorTrustModal';
import { UssdSimulator } from '@/components/UssdSimulator';
import { PocketCyberDrill } from '@/components/PocketCyberDrill';
import { PreTransferRadar } from '@/components/PreTransferRadar';
import { ScamBusterCardModal } from '@/components/ScamBusterCardModal';
import { BankFreezeModal } from '@/components/BankFreezeModal';
import { SocialVaultModal } from '@/components/SocialVaultModal';
import { MerchantDealModal } from '@/components/MerchantDealModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { STORAGE_KEY, emptyState, parseLocalState, historyEntry, toggleItem, type LocalState, type CountryCode } from '@/lib/local-state';
import { useWebTools } from '@/hooks/use-web-tools';
import { useBrowserNotifications } from '@/hooks/use-browser-notifications';
import { LANGUAGES, type SupportedLanguage } from '@/lib/vernacular';
import { FeatureFlagsProvider, useFeatureFlags } from '@/hooks/use-feature-flags';

type View = 'check' | 'sos' | 'protection' | 'family' | 'apps' | 'history';
const viewLabels: Record<View, string> = { check: 'ScamCheck', sos: 'Cyber SOS', protection: 'My protection', family: 'Family security', apps: 'App overview', history: 'Recent checks' };
const titles: Record<View, string> = { check: 'A second opinion. Before your next click.', sos: 'Let’s take the next step together.', protection: 'A safer digital life starts with you.', family: 'Protect the people who share your digital life.', apps: 'Choose what SHOMAR should watch over.', history: 'Your checks, in one place.' };
const subtitles: Record<View, string> = { check: 'Something feels off? Let’s take a closer look together.', sos: 'Practical guidance for when something has gone wrong.', protection: 'Small, practical steps for your accounts and your phone.', family: 'A calm, privacy-first way to build family security habits.', apps: 'Build a consent-first overview of your important accounts.', history: 'A private record of your recent check summaries, on this device.' };

function HomeContent() {
  const { flags } = useFeatureFlags();
  const [mode, setMode] = useState<CheckMode>('message');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Assessment | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('check');
  const [guideId, setGuideId] = useState<string | null>(null);
  const [local, setLocal] = useState<LocalState>(emptyState);
  const localRef = useRef<LocalState>(emptyState);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState<'all' | 'history' | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const resultAnchor = useRef<HTMLDivElement>(null);
  const headingAnchor = useRef<HTMLHeadingElement>(null);
  const notifiedAssessment = useRef<string | null>(null);
  const { supported: notificationsSupported, permission: notificationPermission, enable: enableNotifications, notify } = useBrowserNotifications();
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [ussdSimOpen, setUssdSimOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);
  const [scamBusterOpen, setScamBusterOpen] = useState(false);
  const [scamBusterData, setScamBusterData] = useState({ account: '', bank: '', modus: '' });
  const [bankFreezeOpen, setBankFreezeOpen] = useState(false);
  const [socialVaultOpen, setSocialVaultOpen] = useState(false);
  const [merchantDealOpen, setMerchantDealOpen] = useState(false);
  const completed = protectionTasks.filter(task => local.checklist.includes(task.id)).length;
  const nextTask = protectionTasks.find(task => !local.checklist.includes(task.id));
  const pulseVerdict: Verdict | null = result?.verdict ?? local.history[0]?.verdict ?? null;
  const activeCountry = local.country || 'NG';
  const countryBanks = getBanksByCountry(activeCountry);
  const userBank = countryBanks.find(b => b.id === local.primaryBank) || countryBanks[0] || BANK_PANIC_DIRECTORY[0];

  const handleCountryChange = (nextCountry: CountryCode) => {
    const banks = getBanksByCountry(nextCountry);
    updateLocal(prev => ({
      ...prev,
      country: nextCountry,
      primaryBank: banks[0]?.id || prev.primaryBank,
    }));
  };

  useEffect(() => {
    try { const restored = parseLocalState(localStorage.getItem(STORAGE_KEY)); localRef.current = restored; setLocal(restored); }
    catch { setStorageWarning('This browser cannot save progress. You can still use SHOMAR, but changes will last only for this session.'); }
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      } else {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (const reg of regs) {
            void reg.unregister();
          }
        }).catch(() => {});
      }
    }
    setReady(true);
  }, []);
  const updateLocal = useCallback((change: (previous: LocalState) => LocalState) => {
    const next = change(localRef.current); localRef.current = next; setLocal(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setStorageWarning('Your browser could not save this change. Progress is available for this session only.'); }
  }, []);
  const navigate = useCallback((next: View) => {
    setView(next);
    requestAnimationFrame(() => { headingAnchor.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); });
  }, []);
  useEffect(() => { if (result && view === 'check') requestAnimationFrame(() => { resultAnchor.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); resultAnchor.current?.focus({ preventScroll: true }); }); }, [result, view]);
  useEffect(() => {
    if (!result || !['likely-scam', 'suspicious'].includes(result.verdict) || notificationPermission !== 'granted') return;
    const id = `${result.checkedAt}:${result.verdict}`;
    if (notifiedAssessment.current === id) return;
    notifiedAssessment.current = id;
    notify(result.verdict === 'likely-scam' ? 'SHOMAR: high-risk signs found' : 'SHOMAR: pause and verify', result.summary);
  }, [result, notificationPermission, notify]);
  function performCheck(content: string, selectedMode: CheckMode) {
    const issue = validateInput(content, selectedMode); if (issue) throw new Error(issue);
    const assessment = assess(content, selectedMode);
    setError(''); setInput(content); setMode(selectedMode); setView('check'); setResult(assessment);
    updateLocal(previous => ({ ...previous, history: [historyEntry(assessment, crypto.randomUUID()), ...previous.history].slice(0, 30) }));
    return assessment;
  }
  function runCheck() { try { performCheck(input, mode); } catch (e) { setError(e instanceof Error ? e.message : 'We could not complete this check. Please try again.'); } }
  async function handlePasteAndCheck() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setError('Clipboard access not supported in this browser. Please paste directly into the box.');
        return;
      }
      const clip = await navigator.clipboard.readText();
      if (!clip || !clip.trim()) {
        setError('Your clipboard is empty. Copy a message, link, or vendor post first!');
        return;
      }
      const autoMode = detectCheckMode(clip);
      performCheck(clip, autoMode);
    } catch {
      setError('Please paste your message or link directly in the box below.');
    }
  }
  function clearSavedData() {
    if (confirmClear === 'all') {
      updateLocal(() => ({ checklist: [], recovery: [], history: [], familyChecklist: [], familyProfiles: [], appOverview: [], language: 'English', primaryBank: 'opay', country: 'NG' })); setInput(''); setResult(null); setError(''); setMode('message'); setOcrBusy(false); setGuideId(null);
    } else updateLocal(previous => ({ ...previous, history: [] }));
    setConfirmClear(null);
  }
  useWebTools({ check: performCheck, openGuide: id => { setGuideId(id); navigate('sos'); }, getProgress: () => ({ completed: localRef.current.checklist.filter(id => protectionTasks.some(task => task.id === id)), total: protectionTasks.length }) });
  return <SidebarProvider style={{ '--sidebar-width': '15.5rem' } as CSSProperties}>
    <a className="skip-link" href="#main">Skip to content</a>
    <Sidebar className="app-sidebar">
      <SidebarHeader><a className="brand" href="/"><span className="brand-icon"><ShieldCheck size={27}/></span><span>SHOMAR<small>PROTECT</small></span></a></SidebarHeader>
      <SidebarContent><div className="nav-label">YOUR DIGITAL SAFETY</div><SidebarMenu>
        {([{ id: 'check', label: 'ScamCheck', icon: ScanLine }, { id: 'sos', label: 'Cyber SOS', icon: LifeBuoy }, { id: 'protection', label: 'My protection', icon: ShieldCheck }, { id: 'family', label: 'Family security', icon: UsersRound }, { id: 'apps', label: 'App overview', icon: Grid2X2 }, { id: 'history', label: 'Recent checks', icon: History }] as const).map(item => <NavigationItem key={item.id} active={view === item.id} onNavigate={() => navigate(item.id)} label={item.label} icon={item.icon}/> )}
      </SidebarMenu></SidebarContent>
      <SidebarFooter><div className="sidebar-note"><span className="small-icon"><LockKeyhole size={17}/></span><strong>Your privacy comes first.</strong><p>Your messages stay on this device during pattern checks.</p><button className="text-button privacy-trigger" onClick={() => setPrivacyOpen(true)}>Privacy &amp; data<ArrowUpRight size={13}/></button>{notificationsSupported && <button className="text-button privacy-trigger" onClick={() => { void enableNotifications(); }}>{notificationPermission === 'granted' ? 'Warning alerts are on' : notificationPermission === 'denied' ? 'Warning alerts blocked' : 'Enable warning alerts'}<ArrowUpRight size={13}/></button>}</div><div className="sidebar-bottom"><span className="local-avatar"><Shield size={17}/></span><div>Your personal space<small>Early access</small></div><span className="status-dot"/></div></SidebarFooter>
    </Sidebar>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><SidebarTrigger className="mobile-menu"/><span>Your protection</span><ChevronRight size={14}/><strong>{viewLabels[view]}</strong></div><div className="topbar-right">{flags.offlineZeroDataBadge && <span style={{ fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>⚡ 0.00 MB Offline Protected</span>}<select aria-label="Select region" value={local.country || 'NG'} onChange={e => handleCountryChange(e.target.value as CountryCode)} style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', cursor: 'pointer' }}>{SUPPORTED_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select><select aria-label="Select guidance language" value={local.language} onChange={e => updateLocal(previous => ({ ...previous, language: e.target.value as SupportedLanguage }))} style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', cursor: 'pointer' }}>{LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.nativeName}</option>)}</select>{flags.vendorTrustSeal && <button type="button" onClick={() => setVendorModalOpen(true)} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #10B981', background: '#ECFDF5', color: '#047857', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>✓ Trust Seal</button>}{flags.ussdSimulator && <button type="button" onClick={() => setUssdSimOpen(true)} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #6366F1', background: '#EEF2FF', color: '#4338CA', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>📱 *384*746#</button>}<SafetyPulse verdict={pulseVerdict} permission={notificationPermission} supported={notificationsSupported} onEnableAlerts={() => { void enableNotifications(); }}/><span className="beta-tag">EARLY ACCESS</span><span className="device-status"><span className="status-dot"/> On this device</span></div></header>
    <main id="main" className="main-content">
      {/* 1-Click Primary Bank / Wallet Emergency Quick Freeze Bar */}
      {flags.bankFreezeAndPnd && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚨</span>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#991B1B' }}>Emergency Panic Freeze ({activeCountry}): </strong>
              <span style={{ fontSize: '0.85rem', color: '#7F1D1D', fontWeight: 600 }}>{userBank.name} ({userBank.ussdCode || userBank.phoneHotline})</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {userBank.dialUri && (
              <a href={userBank.dialUri} style={{ background: '#DC2626', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <PhoneCall size={13}/>1-Tap Dial {userBank.ussdCode || 'Freeze'}
              </a>
            )}
            <select
              aria-label="Select your primary bank or mobile wallet"
              value={local.primaryBank}
              onChange={e => updateLocal(prev => ({ ...prev, primaryBank: e.target.value }))}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#fff', color: '#991B1B', fontWeight: 600, cursor: 'pointer' }}
            >
              {countryBanks.map(b => (
                <option key={b.id} value={b.id}>My Institution: {b.shortName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* African Indispensable High-Impact Growth Tray */}
      {(flags.preTransferRadar || flags.creatorVault || flags.bankFreezeAndPnd || flags.merchantSafeDeal) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {flags.preTransferRadar && (
            <button
              type="button"
              onClick={() => setRadarOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.2rem', padding: '0.3rem', background: 'rgba(245,158,11,0.15)', borderRadius: '8px' }}>📡</span>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: '#f8fafc' }}>Pre-Transfer Radar</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Check NUBAN / MoMo before paying</span>
              </div>
            </button>
          )}

          {flags.creatorVault && (
            <button
              type="button"
              onClick={() => setSocialVaultOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.2rem', padding: '0.3rem', background: 'rgba(168,85,247,0.15)', borderRadius: '8px' }}>🎬</span>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: '#f8fafc' }}>Creator &amp; VIP Vault</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sponsorship infostealer &amp; ##002# lock</span>
              </div>
            </button>
          )}

          {flags.bankFreezeAndPnd && (
            <button
              type="button"
              onClick={() => setBankFreezeOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.2rem', padding: '0.3rem', background: 'rgba(239,68,68,0.15)', borderRadius: '8px' }}>⚡</span>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: '#f8fafc' }}>15-Min PND Recall</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Demand freeze on scammer bank</span>
              </div>
            </button>
          )}

          {flags.merchantSafeDeal && (
            <button
              type="button"
              onClick={() => setMerchantDealOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.2rem', padding: '0.3rem', background: 'rgba(16,185,129,0.15)', borderRadius: '8px' }}>🛍️</span>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: '#f8fafc' }}>Safe Deal Link</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Boost sales with verified bio seal</span>
              </div>
            </button>
          )}
        </div>
      )}

      <div className={view === 'check' ? 'page-heading' : 'page-heading view-heading'}><div><div className="eyebrow"><span/> A SAFER DIGITAL EVERYDAY</div><h1 ref={headingAnchor} tabIndex={-1}>{view === 'check' ? <>A second opinion.<br className="mobile-break"/> Before your next click.</> : titles[view]}</h1><p>{subtitles[view]}</p></div><span className="heading-mark"><ShieldCheck size={36} strokeWidth={1.3}/></span></div>
    {storageWarning && <p className="storage-warning" role="status">{storageWarning}</p>}{view === 'check' && <><div className="main-grid"><section className="check-panel panel">
      {/* 2-Click Scenario Decision Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => { setMode('vendor'); setInput(''); setError(''); setResult(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '12px', border: mode === 'vendor' ? '2px solid #365FE9' : '1px solid #E2E8F0', background: mode === 'vendor' ? '#EEF2FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '1.3rem' }}>🛒</span>
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0F172A' }}>Buying from Vendor?</strong>
            <small style={{ color: '#64748B', fontSize: '0.72rem' }}>Check IG/TikTok sellers</small>
          </div>
        </button>
        {flags.vendorTrustSeal && (
          <button
            type="button"
            onClick={() => setVendorModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid #10B981', background: '#ECFDF5', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '1.3rem' }}>🛡️</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', color: '#047857' }}>Verify Trust Seal</strong>
              <small style={{ color: '#059669', fontSize: '0.72rem' }}>CAC/KRA registered shop</small>
            </div>
          </button>
        )}
        <button
          type="button"
          onClick={() => { setMode('message'); setInput(''); setError(''); setResult(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '12px', border: mode === 'message' ? '2px solid #365FE9' : '1px solid #E2E8F0', background: mode === 'message' ? '#EEF2FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '1.3rem' }}>💬</span>
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0F172A' }}>Suspicious Message?</strong>
            <small style={{ color: '#64748B', fontSize: '0.72rem' }}>Bank SMS or WhatsApp</small>
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setMode('link'); setInput(''); setError(''); setResult(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '12px', border: mode === 'link' ? '2px solid #365FE9' : '1px solid #E2E8F0', background: mode === 'link' ? '#EEF2FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '1.3rem' }}>🔗</span>
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0F172A' }}>Check a Link?</strong>
            <small style={{ color: '#64748B', fontSize: '0.72rem' }}>Phishing or fake login</small>
          </div>
        </button>
      </div>

      <div className="panel-heading"><span className="icon-tile blue"><ScanLine size={22}/></span><div><h2>Check something suspicious</h2><p>A message, a website, or a screenshot.</p></div><span className="free-tag">FREE</span></div>
      <Tabs value={mode} onValueChange={value => { setMode(value as CheckMode); setInput(''); setError(''); setResult(null); setOcrBusy(false); }}><TabsList className="check-tabs"><TabsTrigger value="message"><MessageSquareText/>Message</TabsTrigger><TabsTrigger value="link"><Link2/>Link</TabsTrigger><TabsTrigger value="screenshot"><FileImage/>Screenshot</TabsTrigger><TabsTrigger value="vendor"><ShoppingBag/>Vendor</TabsTrigger></TabsList>
        {(['message', 'link', 'screenshot', 'vendor'] as const).map(tab => <TabsContent key={tab} value={tab}>{tab === 'screenshot' && <ImageInput onText={text => { setInput(text); setResult(null); }} onBusy={setOcrBusy}/>}<label className="input-label" htmlFor={`check-${tab}`}>{tab === 'link' ? 'Paste a website link' : tab === 'screenshot' ? 'Review the screenshot text, or paste it here' : tab === 'vendor' ? 'Paste social media vendor post, bio, or chat' : 'Paste the message you received'}</label><textarea id={`check-${tab}`} className="check-input" value={input} onChange={event => { setInput(event.target.value); setError(''); setResult(null); }} maxLength={12000} placeholder={tab === 'link' ? 'https://…' : tab === 'vendor' ? 'e.g. Flash sale 70% off! DM to order, strictly payment before delivery, no pay on delivery, send funds to 8012345678...' : '“Congratulations! You have been selected…”'} aria-describedby="check-privacy"/><div className="input-footer"><span><LockKeyhole size={13}/> Leave out passwords, PINs, and OTPs.</span><span>{input.length.toLocaleString()} / 12,000</span></div></TabsContent>)}
      </Tabs>
      {error && <p className="form-error" role="alert">{error}</p>}
      
      {/* 1-Tap Action Buttons Row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <button
          className="primary-button"
          style={{ flex: 1, minWidth: '220px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', fontSize: '0.95rem', fontWeight: 700 }}
          onClick={() => void handlePasteAndCheck()}
          disabled={ocrBusy || !ready}
        >
          <Clipboard size={18}/>📋 1-Tap Paste &amp; Check
        </button>
        <button className="light-button check-button" onClick={runCheck} disabled={ocrBusy || !ready || !input.trim()}>
          <ScanLine size={18}/>Check Text Below<ArrowRight size={18}/>
        </button>
      </div>
      <p id="check-privacy" className="check-scope"><ShieldCheck size={14}/> Pattern checks only. No live website or account verification.</p>
      {!result && <div className="examples"><span>Just looking? Try an example</span><div>{examples.map(example => <button key={example.label} onClick={() => { setMode(example.mode); setInput(example.text); setError(''); setResult(null); setOcrBusy(false); }}>{example.label}<ArrowUpRight size={13}/></button>)}</div></div>}
      {result && <div ref={resultAnchor} tabIndex={-1}><CheckResult result={result} language={local.language} onSOS={() => navigate('sos')} onClear={() => setResult(null)}/></div>}
      {flags.pocketCyberDrill && <PocketCyberDrill language={local.language} />}
    </section>
    <aside className="right-column"><section className="readiness-card"><div className="card-kicker"><ShieldCheck size={17}/> YOUR PROTECTION</div><h2>Small steps.<br/>Stronger protection.</h2><p>A few simple changes can make a real difference to your digital life.</p><div className="readiness-stat"><strong>{completed}<span> / {protectionTasks.length}</span></strong><span>security steps completed</span></div><Progress value={completed / protectionTasks.length * 100} aria-label={`${completed} of ${protectionTasks.length} security steps completed`}/><div className="next-task"><span><LockKeyhole size={18}/></span><div><small>{completed === 0 ? 'START HERE' : nextTask ? 'YOUR NEXT STEP' : 'CHECKLIST COMPLETE'}</small><strong>{nextTask?.title ?? 'Keep your recovery options current'}</strong></div><ChevronRight size={18}/></div><button className="light-button" onClick={() => navigate('protection')}>Build my protection<ArrowRight size={17}/></button><div className="self-reported"><Check size={12}/> Your checklist. Updated by you.</div></section>
    <section className="tip-card"><div className="card-kicker"><Sparkles size={16}/> A LITTLE KNOW-HOW</div><h3>A familiar logo isn’t proof.</h3><p>Scammers can copy a bank’s name and design. Open your bank app directly to verify a request.</p><span className="tip-rule"/></section></aside></div>
    <div className="support-grid"><button className="support-card" onClick={() => { setGuideId(null); navigate('sos'); }}><span className="icon-tile coral"><LifeBuoy size={24}/></span><div><span className="card-kicker">CYBER SOS</span><h3>Something already happened?</h3><p>Take the next step, one at a time.</p></div><ArrowUpRight size={20}/></button><button className="support-card" onClick={() => navigate('protection')}><span className="icon-tile mint"><ShieldCheck size={24}/></span><div><span className="card-kicker">MY PROTECTION</span><h3>Make your accounts harder to lose.</h3><p>Simple checklists for your digital life.</p></div><ArrowUpRight size={20}/></button></div>
    <HistoryView compact history={local.history} onNew={() => navigate('check')} onClear={() => setConfirmClear('history')}/></>}
    {view === 'sos' && <RecoveryView key={guideId ?? 'guides'} guideId={guideId} onGuide={setGuideId} done={local.recovery} onToggle={(id, checked) => updateLocal(previous => ({ ...previous, recovery: toggleItem(previous.recovery, id, checked) }))}/>}
    {view === 'protection' && <ProtectionView done={local.checklist} onToggle={(id, checked) => updateLocal(previous => ({ ...previous, checklist: toggleItem(previous.checklist, id, checked) }))}/>}
    {view === 'family' && <FamilyView profiles={local.familyProfiles} done={local.familyChecklist} onToggle={(id, checked) => updateLocal(previous => ({ ...previous, familyChecklist: toggleItem(previous.familyChecklist, id, checked) }))} onAddProfile={profile => updateLocal(previous => ({ ...previous, familyProfiles: [...previous.familyProfiles, profile].slice(0, 20) }))} onRemoveProfile={id => updateLocal(previous => ({ ...previous, familyProfiles: previous.familyProfiles.filter(profile => profile.id !== id) }))}/>}
    {view === 'apps' && <AppOverviewView selected={local.appOverview} onToggle={(id, checked) => updateLocal(previous => ({ ...previous, appOverview: toggleItem(previous.appOverview, id, checked) }))}/>}
    {view === 'history' && <HistoryView history={local.history} onNew={() => navigate('check')} onClear={() => setConfirmClear('history')}/>}
    <footer className="page-footer"><span><ShieldCheck size={14}/> SHOMAR Protect <span className="footer-divider">/</span> By CyberCapSec</span><span>Built for your everyday digital life.</span></footer>
    </main></div>
    <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}><DialogContent className="privacy-dialog"><DialogHeader><DialogTitle>Your privacy, in plain language.</DialogTitle><DialogDescription>ScamCheck processes messages, links, and screenshot text in this browser. It does not upload your submitted content.</DialogDescription></DialogHeader><h3>What stays on this device</h3><p>Your checklist progress, family names, selected app overview, recovery steps, and up to 30 check summaries. Summaries contain the check type, date, verdict, and number of warning signs. They exclude the original content and website names.</p><h3>What these checks cover</h3><p>Limited, explainable scam patterns and English screenshot text. SHOMAR does not check live threat databases, scan apps, confirm payments, monitor accounts, read family messages, or inspect installed apps in this release.</p><h3>You’re in control</h3><p>Clearing browser data also removes your progress, family plan, and selected app overview. Anyone using this browser profile may see your saved summaries, family names, and selections. No account sync or human support service is connected.</p><button className="outline-button" onClick={() => { setPrivacyOpen(false); setConfirmClear('all'); }}>Clear all saved SHOMAR data</button></DialogContent></Dialog>
    <AlertDialog open={confirmClear !== null} onOpenChange={open => { if (!open) setConfirmClear(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmClear === 'all' ? 'Clear your saved SHOMAR data?' : 'Clear your recent checks?'}</AlertDialogTitle><AlertDialogDescription>{confirmClear === 'all' ? 'This removes your protection checklist, family plan, app overview, recovery progress, and check history from this browser. You can start again at any time.' : 'This removes the saved check summaries from this browser. Your protection, family, app overview, and recovery checklists will stay.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep my data</AlertDialogCancel><AlertDialogAction onClick={clearSavedData}>Clear data</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <VendorTrustModal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)}/>
    <UssdSimulator isOpen={ussdSimOpen} onClose={() => setUssdSimOpen(false)}/>
    <PreTransferRadar
      isOpen={radarOpen}
      onClose={() => setRadarOpen(false)}
      onOpenScamBuster={(account, bank, modus) => {
        setScamBusterData({ account, bank, modus });
        setScamBusterOpen(true);
      }}
      onOpenDealModal={() => setMerchantDealOpen(true)}
    />
    <ScamBusterCardModal
      isOpen={scamBusterOpen}
      onClose={() => setScamBusterOpen(false)}
      account={scamBusterData.account}
      bankName={scamBusterData.bank}
      modus={scamBusterData.modus}
    />
    <BankFreezeModal
      isOpen={bankFreezeOpen}
      onClose={() => setBankFreezeOpen(false)}
      country={activeCountry}
    />
    <SocialVaultModal
      isOpen={socialVaultOpen}
      onClose={() => setSocialVaultOpen(false)}
    />
    <MerchantDealModal
      isOpen={merchantDealOpen}
      onClose={() => setMerchantDealOpen(false)}
    />
  </SidebarProvider>;
}

export default function Home() {
  return (
    <FeatureFlagsProvider>
      <HomeContent />
    </FeatureFlagsProvider>
  );
}

function NavigationItem({ active, label, icon: Icon, onNavigate }: { active: boolean; label: string; icon: typeof ScanLine; onNavigate: () => void }) {
  const { setOpenMobile } = useSidebar();
  return <SidebarMenuItem><SidebarMenuButton isActive={active} className="nav-button" aria-current={active ? 'page' : undefined} onClick={() => { onNavigate(); setOpenMobile(false); }}><Icon/><span>{label}</span>{active && <span className="nav-dot"/>}</SidebarMenuButton></SidebarMenuItem>;
}
