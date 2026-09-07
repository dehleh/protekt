'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, FileImage, Grid2X2, History, LifeBuoy, Link2, LockKeyhole, MessageSquareText, ScanLine, Shield, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { assess, validateInput, type Assessment, type CheckMode, type Verdict } from '@/lib/scam-engine';
import { examples, protectionTasks } from '@/lib/safety-content';
import { CheckResult } from '@/components/CheckResult';
import { RecoveryView } from '@/components/RecoveryView';
import { ProtectionView } from '@/components/ProtectionView';
import { FamilyView } from '@/components/FamilyView';
import { AppOverviewView } from '@/components/AppOverviewView';
import { HistoryView } from '@/components/HistoryView';
import { ImageInput } from '@/components/ImageInput';
import { SafetyPulse } from '@/components/SafetyPulse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { STORAGE_KEY, emptyState, parseLocalState, historyEntry, toggleItem, type LocalState } from '@/lib/local-state';
import { useWebTools } from '@/hooks/use-web-tools';
import { useBrowserNotifications } from '@/hooks/use-browser-notifications';

type View = 'check' | 'sos' | 'protection' | 'family' | 'apps' | 'history';
const viewLabels: Record<View, string> = { check: 'ScamCheck', sos: 'Cyber SOS', protection: 'My protection', family: 'Family security', apps: 'App overview', history: 'Recent checks' };
const titles: Record<View, string> = { check: 'A second opinion. Before your next click.', sos: 'Let’s take the next step together.', protection: 'A safer digital life starts with you.', family: 'Protect the people who share your digital life.', apps: 'Choose what SHOMAR should watch over.', history: 'Your checks, in one place.' };
const subtitles: Record<View, string> = { check: 'Something feels off? Let’s take a closer look together.', sos: 'Practical guidance for when something has gone wrong.', protection: 'Small, practical steps for your accounts and your phone.', family: 'A calm, privacy-first way to build family security habits.', apps: 'Build a consent-first overview of your important accounts.', history: 'A private record of your recent check summaries, on this device.' };

export default function Home() {
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
  const completed = protectionTasks.filter(task => local.checklist.includes(task.id)).length;
  const nextTask = protectionTasks.find(task => !local.checklist.includes(task.id));
  const pulseVerdict: Verdict | null = result?.verdict ?? local.history[0]?.verdict ?? null;
  useEffect(() => {
    try { const restored = parseLocalState(localStorage.getItem(STORAGE_KEY)); localRef.current = restored; setLocal(restored); }
    catch { setStorageWarning('This browser cannot save progress. You can still use SHOMAR, but changes will last only for this session.'); }
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
  function clearSavedData() {
    if (confirmClear === 'all') {
      updateLocal(() => ({ checklist: [], recovery: [], history: [], familyChecklist: [], familyProfiles: [], appOverview: [] })); setInput(''); setResult(null); setError(''); setMode('message'); setOcrBusy(false); setGuideId(null);
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
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><SidebarTrigger className="mobile-menu"/><span>Your protection</span><ChevronRight size={14}/><strong>{viewLabels[view]}</strong></div><div className="topbar-right"><SafetyPulse verdict={pulseVerdict} permission={notificationPermission} supported={notificationsSupported} onEnableAlerts={() => { void enableNotifications(); }}/><span className="beta-tag">EARLY ACCESS</span><span className="device-status"><span className="status-dot"/> On this device</span></div></header>
    <main id="main" className="main-content"><div className={view === 'check' ? 'page-heading' : 'page-heading view-heading'}><div><div className="eyebrow"><span/> A SAFER DIGITAL EVERYDAY</div><h1 ref={headingAnchor} tabIndex={-1}>{view === 'check' ? <>A second opinion.<br className="mobile-break"/> Before your next click.</> : titles[view]}</h1><p>{subtitles[view]}</p></div><span className="heading-mark"><ShieldCheck size={36} strokeWidth={1.3}/></span></div>
    {storageWarning && <p className="storage-warning" role="status">{storageWarning}</p>}{view === 'check' && <><div className="main-grid"><section className="check-panel panel"><div className="panel-heading"><span className="icon-tile blue"><ScanLine size={22}/></span><div><h2>Check something suspicious</h2><p>A message, a website, or a screenshot.</p></div><span className="free-tag">FREE</span></div>
      <Tabs value={mode} onValueChange={value => { setMode(value as CheckMode); setInput(''); setError(''); setResult(null); setOcrBusy(false); }}><TabsList className="check-tabs"><TabsTrigger value="message"><MessageSquareText/>Message</TabsTrigger><TabsTrigger value="link"><Link2/>Link</TabsTrigger><TabsTrigger value="screenshot"><FileImage/>Screenshot</TabsTrigger></TabsList>
        {(['message', 'link', 'screenshot'] as const).map(tab => <TabsContent key={tab} value={tab}>{tab === 'screenshot' && <ImageInput onText={text => { setInput(text); setResult(null); }} onBusy={setOcrBusy}/>}<label className="input-label" htmlFor={`check-${tab}`}>{tab === 'link' ? 'Paste a website link' : tab === 'screenshot' ? 'Review the screenshot text, or paste it here' : 'Paste the message you received'}</label><textarea id={`check-${tab}`} className="check-input" value={input} onChange={event => { setInput(event.target.value); setError(''); setResult(null); }} maxLength={12000} placeholder={tab === 'link' ? 'https://…' : '“Congratulations! You have been selected…”'} aria-describedby="check-privacy"/><div className="input-footer"><span><LockKeyhole size={13}/> Leave out passwords, PINs, and OTPs.</span><span>{input.length.toLocaleString()} / 12,000</span></div></TabsContent>)}
      </Tabs>
      {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button check-button" onClick={runCheck} disabled={ocrBusy || !ready}><ScanLine size={18}/>Check it with SHOMAR<ArrowRight size={18}/></button><p id="check-privacy" className="check-scope"><ShieldCheck size={14}/> Pattern checks only. No live website or account verification.</p>
      {!result && <div className="examples"><span>Just looking? Try an example</span><div>{examples.map(example => <button key={example.label} onClick={() => { setMode(example.mode); setInput(example.text); setError(''); setResult(null); setOcrBusy(false); }}>{example.label}<ArrowUpRight size={13}/></button>)}</div></div>}
      {result && <div ref={resultAnchor} tabIndex={-1}><CheckResult result={result} onSOS={() => navigate('sos')} onClear={() => setResult(null)}/></div>}
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
  </SidebarProvider>;
}

function NavigationItem({ active, label, icon: Icon, onNavigate }: { active: boolean; label: string; icon: typeof ScanLine; onNavigate: () => void }) {
  const { setOpenMobile } = useSidebar();
  return <SidebarMenuItem><SidebarMenuButton isActive={active} className="nav-button" aria-current={active ? 'page' : undefined} onClick={() => { onNavigate(); setOpenMobile(false); }}><Icon/><span>{label}</span>{active && <span className="nav-dot"/>}</SidebarMenuButton></SidebarMenuItem>;
}
