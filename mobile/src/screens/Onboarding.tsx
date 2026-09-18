import { useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../services/store';
import { requestAlerts } from '../services/notifications';
import { Apps } from './Apps';
import { Button, Card, Copy, Icon, Notice, Title, c, s } from '../ui';

export function Onboarding({ scrollToTop }: { scrollToTop: () => void }) {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function go(next: number) { setStep(next); scrollToTop(); }
  function finish(alerts: boolean) { update(v => ({ ...v, onboarded: true, alerts })); }
  async function enable() {
    setBusy(true);
    try { finish(await requestAlerts()); }
    catch { setError('Notifications could not be enabled. You can continue and try again in Settings.'); }
    finally { setBusy(false); }
  }
  return <View style={s.stack}>
    <Text style={[s.small, { letterSpacing: 2, color: c.blue, fontWeight: '700' }]}>GETTING STARTED · {step + 1} / 3</Text>
    {step === 0 ? <>
      <View style={{ alignSelf: 'flex-start', padding: 22, backgroundColor: '#E4ECFF', borderRadius: 28 }}><Icon name="shield-checkmark-outline" size={58} color={c.blue}/></View>
      <Title>Your digital life deserves a little backup.</Title><Copy muted>Meet SHOMAR Protect. Everyday tools for suspicious messages, important accounts and a safer family.</Copy>
      <Card>{[{ icon: 'scan-outline' as const, title: 'Check before you click', body: 'Understand warning signs in messages and links.' }, { icon: 'apps-outline' as const, title: 'Keep important accounts in view', body: 'Build a security checklist for the apps you care about.' }, { icon: 'people-outline' as const, title: 'Look after your people', body: 'Create a family plan and set up official parental controls.' }].map(item => <View key={item.title} style={s.row}><Icon name={item.icon} color={c.blue}/><View style={{ flex: 1 }}><Text style={s.label}>{item.title}</Text><Copy muted>{item.body}</Copy></View></View>)}</Card>
      <Notice>This first release provides local checks and guided setup. Live account monitoring is not connected.</Notice>
      <Button title="Let’s get started" icon="arrow-forward-outline" onPress={() => go(1)}/>
      <Button secondary title="Set up later" onPress={() => finish(false)}/>
    </> : step === 1 ? <><Button title="Continue to notifications" onPress={() => go(2)}/><Apps setup/><Button title="Continue to notifications" onPress={() => go(2)}/><Button title="Back" secondary onPress={() => go(0)}/></> : <>
      <Title>A warning when it matters.</Title><Copy muted>Allow SHOMAR to notify you when a message or link you check contains warning signs.</Copy>
      <Card><Icon name="notifications-outline" color={c.blue} size={44}/><Text style={s.h2}>You stay in control</Text><Copy>Notifications are optional. You can switch them off at any time in Settings.</Copy><Copy muted>Alerts cover checks you run here. Background account monitoring and remote family alerts will require future integrations.</Copy></Card>
      {!!error && <Notice>{error}</Notice>}
      <Button title={busy ? 'Opening permissions…' : 'Enable warning notifications'} disabled={busy} onPress={() => void enable()}/><Button secondary title="Maybe later" disabled={busy} onPress={() => finish(false)}/><Button secondary title="Back" disabled={busy} onPress={() => go(1)}/>
    </>}
  </View>;
}
