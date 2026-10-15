'use client';

import { useMemo, useState } from 'react';
import { Banknote, Check, ExternalLink, Grid2X2, KeyRound, Mail, MessageCircle, ShieldCheck, Smartphone, UsersRound } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { appCategories, protectedApps, type AppCategory } from '@/lib/app-catalog';

function CategoryIcon({ category }: { category: AppCategory }) {
  if (category === 'Social') return <UsersRound size={18}/>;
  if (category === 'Identity') return <KeyRound size={18}/>;
  if (category === 'Email') return <Mail size={18}/>;
  if (category === 'Messaging') return <MessageCircle size={18}/>;
  return <Banknote size={18}/>;
}

export function AppOverviewView({ selected, onToggle }: { selected: string[]; onToggle: (id: string, value: boolean) => void }) {
  const [category, setCategory] = useState<AppCategory | 'All'>('All');
  const visibleApps = useMemo(() => category === 'All' ? protectedApps : protectedApps.filter(app => app.category === category), [category]);
  const selectedApps = protectedApps.filter(app => selected.includes(app.id));
  const categoryCount = new Set(selectedApps.map(app => app.category)).size;
  return <section className="app-overview-layout">
    <div className="app-overview-main">
      <section className="panel app-overview-panel">
        <div className="section-heading"><div><h2>Choose the apps in your protection overview</h2><p className="section-description">Select the accounts you want SHOMAR to help you organise and secure.</p></div><span className="count-badge"><Smartphone size={14}/> {selectedApps.length} selected</span></div>
        <div className="app-discovery-note"><Smartphone size={19}/><div><strong>Consent before discovery</strong><p>A native SHOMAR app can ask for supported device and account permissions. This web preview never scans your phone or reads installed-app data.</p></div></div>
        <div className="app-filter-bar" role="tablist" aria-label="Filter apps by category">{appCategories.map(item => <button key={item} type="button" className={`app-filter ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>)}</div>
        <div className="app-catalog">{visibleApps.map(app => { const isSelected = selected.includes(app.id); return <div className={`app-catalog-row ${isSelected ? 'selected' : ''}`} key={app.id}><span className={`app-category-icon ${app.category.toLowerCase()}`}><CategoryIcon category={app.category}/></span><div className="app-catalog-copy"><label htmlFor={`app-${app.id}`}><strong>{app.name}</strong><span>{app.description}</span></label><div className="app-catalog-meta"><span>{app.category}</span>{app.setupHref && <a href={app.setupHref} target="_blank" rel="noopener noreferrer">Official security setup <ExternalLink size={12}/></a>}</div></div><Checkbox id={`app-${app.id}`} checked={isSelected} onCheckedChange={value => onToggle(app.id, value === true)} aria-label={`${isSelected ? 'Remove' : 'Add'} ${app.name} ${isSelected ? 'from' : 'to'} your protection overview`}/></div>; })}</div>
      </section>
    </div>
    <aside className="app-overview-side">
      <section className="readiness-card"><div className="card-kicker"><ShieldCheck size={17}/> YOUR APP OVERVIEW</div><h2>{selectedApps.length === 0 ? 'Start with the accounts that matter most.' : 'Your key accounts, in one plan.'}</h2><p>{selectedApps.length === 0 ? 'Choose the apps you want to keep visible in your security plan.' : 'You choose what belongs here. SHOMAR will use this list to shape future setup and monitoring journeys.'}</p><div className="readiness-stat"><strong>{selectedApps.length}<span> / {protectedApps.length}</span></strong><span>apps selected</span></div><Progress value={selectedApps.length / protectedApps.length * 100} aria-label={`${selectedApps.length} of ${protectedApps.length} apps selected`}/><div className="app-overview-summary"><span><Grid2X2 size={15}/> {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}</span><span><Check size={14}/> Selection saved on this device</span></div></section>
      <section className="panel app-scope-card"><div className="card-kicker"><ShieldCheck size={16}/> MONITORING ROADMAP</div><h3>Overview first. Connection only with consent.</h3><ol><li><span>1</span><p>Choose the accounts you care about.</p></li><li><span>2</span><p>Review what SHOMAR would need access to.</p></li><li><span>3</span><p>Connect only supported providers and turn on alerts.</p></li></ol><div className="app-scope-status"><span className="pulse-light"/> Current mode: local overview only</div></section>
      {selectedApps.length > 0 && <section className="panel selected-apps-card"><div className="card-kicker"><Grid2X2 size={16}/> SELECTED APPS</div><div className="selected-app-list">{selectedApps.map(app => <span key={app.id}>{app.name}<small>{app.category}</small></span>)}</div></section>}
      <div className="tip-card app-overview-note"><h3>What native monitoring would mean</h3><p>On Android, supported package visibility and notification features would still need consent. On iPhone, apps cannot freely inspect other installed apps. Account monitoring also needs each provider’s approved connection.</p></div>
    </aside>
  </section>;
}
