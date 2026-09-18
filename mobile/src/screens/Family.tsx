import { useState } from 'react';
import { Alert, Share, Text, TextInput, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { familyAgeBands, familyControlLinks, familyRules, familyTasks } from '../../../lib/family-content';
import { type Member, toggle } from '../core/state';
import { useStore } from '../services/store';
import { openGuide } from '../services/links';
import { Button, Card, Chips, Copy, Notice, Tick, Title, c, s } from '../ui';

export function Family() {
  const { state, update } = useStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Member['role']>('Child');
  const [age, setAge] = useState<Member['age']>('10–12');
  const [adding, setAdding] = useState(false);
  function add() {
    if (!name.trim() || state.family.length >= 12) return;
    const member: Member = { id: randomUUID(), name: name.trim(), role, age };
    update(v => ({ ...v, family: [...v.family, member].slice(0, 12) }));
    setName(''); setAdding(false);
  }
  function remove(member: Member) {
    Alert.alert(`Remove ${member.name}?`, 'This removes the profile from this phone’s family plan.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => update(v => ({ ...v, family: v.family.filter(m => m.id !== member.id) })) }]);
  }
  async function sharePact() {
    const rules = familyRules.map((rule, index) => `${index + 1}. ${rule.title}: ${rule.body}`).join('\n\n');
    await Share.share({ title: 'Our SHOMAR family safety pact', message: `Can we agree on this digital safety pact together?\n\n${rules}\n\nSent from SHOMAR Protect. No family profile or private check was included.` });
  }
  return <View style={s.stack}>
    <Title>Safer, together.</Title><Copy muted>Make a simple safety plan for the people you look after.</Copy>
    <Notice>Family profiles stay on this phone. Device linking, remote alerts, app blocking and screen-time enforcement are not connected.</Notice>
    <Card><Text style={s.h2}>Your family · {state.family.length}</Text>
      {!state.family.length && <Copy muted>Add a nickname to start. You do not need a child’s full name, birthday or contact details.</Copy>}
      {state.family.map(member => <View key={member.id} style={{ gap: 10 }}><Text style={s.label}>{member.name}</Text><Text style={s.small}>{member.role} · {member.age}</Text><Button secondary title={`Remove ${member.name}`} onPress={() => remove(member)}/></View>)}
      {!adding && <Button title="Add family member" icon="person-add-outline" onPress={() => setAdding(true)} disabled={state.family.length >= 12}/>}
      {adding && <View style={s.stack}>
        <TextInput accessibilityLabel="Family member nickname" value={name} onChangeText={setName} maxLength={40} placeholder="Nickname" placeholderTextColor={c.muted} style={s.input}/>
        <Text style={s.label}>Family role</Text><Chips values={['Child', 'Parent', 'Caregiver']} value={role} onChange={v => { setRole(v as Member['role']); setAge(v === 'Child' ? '10–12' : 'Adult'); }}/>
        <Text style={s.label}>Age group</Text><Chips values={familyAgeBands} value={age} onChange={v => setAge(v as Member['age'])}/>
        <Button title="Save member" onPress={add} disabled={!name.trim()}/><Button title="Cancel" secondary onPress={() => { setAdding(false); setName(''); }}/>
      </View>}
    </Card>
    <Card><Text style={s.h2}>Set up parental controls</Text><Copy muted>Use the phone’s official tools for app limits and purchase approvals. SHOMAR helps you plan the setup.</Copy>{familyControlLinks.map(link => <View key={link.href} style={{ gap: 8 }}><Copy muted>{link.description}</Copy><Button secondary title={link.label} icon="open-outline" onPress={() => void openGuide(link.href)}/></View>)}</Card>
    <Card><Text style={s.h2}>Household safety checklist</Text><Text style={s.small}>{familyTasks.filter(t => state.familyDone.includes(t.id)).length} of {familyTasks.length} marked complete · self-reported</Text>{familyTasks.map(task => <Tick key={task.id} title={task.title} description={task.description} checked={state.familyDone.includes(task.id)} onPress={() => update(v => ({ ...v, familyDone: toggle(v.familyDone, task.id) }))}/>)}</Card>
    <Card><Text style={s.h2}>Agree on a few family rules</Text>{familyRules.map(rule => <View key={rule.title} style={{ gap: 5 }}><Text style={s.label}>{rule.title}</Text><Copy muted>{rule.body}</Copy></View>)}<Button title="Share this safety pact" secondary icon="share-social-outline" onPress={() => void sharePact()}/><Copy muted>The shared pact contains the rules only. It does not include names, age groups, progress or check history.</Copy></Card>
  </View>;
}
