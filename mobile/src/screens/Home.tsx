import { Text, View } from 'react-native';
import { protectionTasks } from '../../../lib/safety-content';
import { pulse, toggle } from '../core/state';
import { useStore } from '../services/store';
import { openGuide } from '../services/links';
import { Button, Card, Copy, Icon, Tick, Title, c, s } from '../ui';

export type Destination = 'Home' | 'Check' | 'Apps' | 'Family' | 'SOS' | 'Settings';
export function Home({ navigate, now }: { navigate: (screen: Destination) => void; now: number }) {
  const { state, update } = useStore();
  const status = pulse(state.history[0], now);
  return <View style={s.stack}>
    <Text style={[s.small, { letterSpacing: 2, color: c.blue, fontWeight: '700' }]}>YOUR DIGITAL SAFETY COMPANION</Text>
    <Title>A little more peace of mind.</Title>
    <Card style={{ backgroundColor: c.navy, borderColor: c.navy }}>
      <View style={s.row}><View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF16' }}><Icon name="shield-checkmark-outline" color={c.white} size={26}/></View><Text style={[s.label, { color: '#DCE6FA', flex: 1 }]}>Safety pulse</Text><View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: status.tone === 'neutral' ? '#A0AEC1' : status.tone === 'good' ? '#57D5A0' : status.tone === 'danger' ? '#FF928C' : '#F9CF75' }}/></View>
      <Text style={[s.title, { color: c.white }]}>{status.title}</Text><Text style={[s.body, { color: '#CFDAED' }]}>{status.detail}</Text>
      {state.history[0] && <Text style={[s.small, { color: '#CFDAED' }]}>{new Date(state.history[0].checkedAt).toLocaleString()} · Last submitted check only</Text>}
      <Button title="Check a message or link" icon="scan-outline" onPress={() => navigate('Check')}/>
    </Card>
    <View style={{ gap: 12 }}><Button secondary title={`My apps & accounts · ${state.selectedApps.length}`} icon="apps-outline" onPress={() => navigate('Apps')}/><Button secondary title={`Family safety · ${state.family.length} members`} icon="people-outline" onPress={() => navigate('Family')}/><Button secondary title="Something happened. I need help." icon="medkit-outline" onPress={() => navigate('SOS')}/></View>
    <Card><Text style={s.h2}>Build stronger habits</Text><Copy muted>{protectionTasks.filter(t => state.protectionDone.includes(t.id)).length} of {protectionTasks.length} steps marked complete. These are your confirmations, not verified account settings.</Copy>
      {protectionTasks.map(task => <View key={task.id}><Tick title={task.title} description={task.description} checked={state.protectionDone.includes(task.id)} onPress={() => update(v => ({ ...v, protectionDone: toggle(v.protectionDone, task.id) }))}/>{'href' in task && <Button secondary title={task.action} icon="open-outline" onPress={() => void openGuide(task.href)}/>}{'alternate' in task && <View style={{ marginTop: 8 }}><Button secondary title={task.alternate.label} icon="open-outline" onPress={() => void openGuide(task.alternate.href)}/></View>}</View>)}
    </Card>
    <Card><Text style={s.h2}>Recent checks</Text>{state.history.length ? state.history.slice(0, 5).map(item => <View key={item.id} style={{ gap: 4 }}><Text style={[s.label, { color: c[pulse(item, now).tone] }]}>{pulse(item, now).title}</Text><Text style={s.small}>{new Date(item.checkedAt).toLocaleString()} · {item.mode} · {item.signals} patterns</Text></View>) : <Copy muted>Your check summaries will appear here. The original content is never saved.</Copy>}</Card>
    <Button title="Notifications & privacy" secondary icon="settings-outline" onPress={() => navigate('Settings')}/>
  </View>;
}
