'use client';

import { useState } from 'react';
import { Baby, Check, Clock3, ExternalLink, Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { familyAgeBands, familyControlLinks, familyRules, familyTasks, type FamilyRole } from '@/lib/family-content';
import type { FamilyProfile } from '@/lib/local-state';

type Draft = { name: string; role: FamilyRole; ageBand: string };

export function FamilyView({ profiles, done, onToggle, onAddProfile, onRemoveProfile }: { profiles: FamilyProfile[]; done: string[]; onToggle: (id: string, value: boolean) => void; onAddProfile: (profile: FamilyProfile) => void; onRemoveProfile: (id: string) => void }) {
  const [draft, setDraft] = useState<Draft>({ name: '', role: 'Child', ageBand: familyAgeBands[0] });
  const count = familyTasks.filter(task => done.includes(task.id)).length;
  function addProfile() {
    const name = draft.name.trim();
    if (!name) return;
    onAddProfile({ id: crypto.randomUUID(), name, role: draft.role, ageBand: draft.ageBand });
    setDraft(previous => ({ ...previous, name: '' }));
  }
  return <section className="family-layout">
    <div className="family-main">
      <section className="panel family-profile-panel">
        <div className="section-heading"><div><h2>Build your family safety plan</h2><p className="section-description">Keep a simple, shared view of who needs protection and what to set up next.</p></div><span className="count-badge"><UsersRound size={14}/> {profiles.length} {profiles.length === 1 ? 'person' : 'people'}</span></div>
        <div className="family-privacy-note"><ShieldCheck size={18}/><div><strong>Private by design</strong><p>Names and progress are saved only in this browser. SHOMAR does not read a child’s messages, location, or device activity.</p></div></div>
        <div className="family-form" aria-label="Add a family member">
          <label><span>Name or nickname</span><input value={draft.name} onChange={event => setDraft(previous => ({ ...previous, name: event.target.value }))} placeholder="e.g. Amara" maxLength={50}/></label>
          <label><span>Role</span><select value={draft.role} onChange={event => setDraft(previous => ({ ...previous, role: event.target.value as FamilyRole }))}><option>Child</option><option>Parent</option><option>Caregiver</option></select></label>
          <label><span>Age group</span><select value={draft.ageBand} onChange={event => setDraft(previous => ({ ...previous, ageBand: event.target.value }))}>{familyAgeBands.map(age => <option key={age}>{age}</option>)}</select></label>
          <button className="primary-button family-add-button" type="button" onClick={addProfile} disabled={!draft.name.trim()}><Plus size={17}/>Add person</button>
        </div>
        {profiles.length === 0 ? <div className="family-empty"><Baby size={24}/><div><strong>Start with the people you want to protect.</strong><p>Add a child, parent, or trusted caregiver. You can use a nickname.</p></div></div> : <div className="family-people">{profiles.map(profile => <div className="family-person" key={profile.id}><span className={`family-avatar ${profile.role.toLowerCase()}`}><Baby size={18}/></span><div><strong>{profile.name}</strong><p>{profile.role} · {profile.ageBand}</p></div><button className="icon-button family-remove" type="button" onClick={() => onRemoveProfile(profile.id)} aria-label={`Remove ${profile.name}`}><Trash2 size={15}/></button></div>)}</div>}
      </section>

      <section className="panel family-checklist-panel"><div className="section-heading"><div><h2>Family security checklist</h2><p className="section-description">Set these up together, then mark what you have covered.</p></div><span className="count-badge">{count} / {familyTasks.length}</span></div><Progress value={count / familyTasks.length * 100} aria-label={`${count} of ${familyTasks.length} family security steps complete`}/><div className="checklist">{familyTasks.map(task => <div key={task.id} className={`checklist-row ${done.includes(task.id) ? 'is-done' : ''}`}><Checkbox id={`family-task-${task.id}`} checked={done.includes(task.id)} onCheckedChange={value => onToggle(task.id, value === true)} aria-label={`Mark ${task.title} as complete`}/><div><div className="task-meta"><span>{task.category}</span><span><Clock3 size={12}/>{task.minutes} min</span></div><label htmlFor={`family-task-${task.id}`} className="task-title">{task.title}</label><p>{task.description}</p></div></div>)}</div></section>
    </div>
    <aside className="family-side">
      <section className="readiness-card"><div className="card-kicker"><UsersRound size={17}/> FAMILY SECURITY</div><h2>{count === familyTasks.length ? 'A strong family baseline.' : 'Make safety a family habit.'}</h2><p>{count === familyTasks.length ? 'Revisit these steps when someone gets a new device, account, or number.' : 'A few calm conversations and settings checks can prevent a stressful incident later.'}</p><div className="readiness-stat"><strong>{count}<span> / {familyTasks.length}</span></strong><span>steps marked complete</span></div><Progress value={count / familyTasks.length * 100} aria-label="Family checklist progress"/><div className="self-reported"><Check size={12}/> Progress saved on this device</div></section>
      <section className="panel family-rules"><div className="card-kicker"><ShieldCheck size={16}/> FAMILY AGREEMENT</div><h3>Four rules worth repeating</h3>{familyRules.map(rule => <div className="family-rule" key={rule.title}><strong>{rule.title}</strong><p>{rule.body}</p></div>)}</section>
      <section className="panel family-controls"><div className="card-kicker"><Baby size={16}/> DEVICE CONTROLS</div><h3>Official parental-control setup</h3><p className="section-description">These services apply controls on supported devices. Review the settings with the child and keep a recovery route for the parent.</p>{familyControlLinks.map(link => <a className="family-control-link" key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"><span><strong>{link.label}</strong><small>{link.description}</small></span><ExternalLink size={14}/></a>)}</section>
      <div className="tip-card family-note"><h3>What SHOMAR does here</h3><p>It gives your family a plan and a place to keep progress. It does not block apps, read private conversations, locate a device, or replace the controls built into Android and iPhone.</p></div>
    </aside>
  </section>;
}
