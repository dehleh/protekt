import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, View } from 'react-native';
import { appTasks, catalog, categories } from '../core/catalog';
import { selectApp, toggle } from '../core/state';
import { discoverApps, discoveryAvailable } from '../services/discovery';
import { useStore } from '../services/store';
import { Button, Card, Chips, Copy, Notice, Tick, Title, c, s } from '../ui';

export function Apps({ setup = false }: { setup?: boolean }) {
  const { state, update } = useStore();
  const [category, setCategory] = useState('All');
  const [detected, setDetected] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function scan() {
    setBusy(true); setError('');
    try { setDetected(await discoverApps(true)); }
    catch (e) { setError(e instanceof Error ? e.message : 'App discovery could not finish. You can choose apps below.'); }
    finally { setBusy(false); }
  }
  function consent() {
    Alert.alert('Find supported apps?', 'SHOMAR will check for a short list of supported apps installed on this Android phone. This happens on your device. It does not read accounts or messages. You decide which results to save.', [
      { text: 'Cancel', style: 'cancel' }, { text: 'Find apps', onPress: () => void scan() },
    ]);
  }
  return <View style={s.stack}>
    <Title>{setup ? 'What matters to you?' : 'Your apps & accounts'}</Title>
    <Copy muted>Choose the accounts you want in your safety plan. You can change this list at any time.</Copy>
    <Card>
      <Text style={s.h2}>{Platform.OS === 'android' ? 'Find apps on this phone' : 'Choose your important accounts'}</Text>
      <Copy muted>{Platform.OS === 'android' ? 'Check for supported social, messaging and email apps, then choose what to add.' : 'iPhone uses manual selection in this build. Add the apps and accounts you use from the list below.'}</Copy>
      {Platform.OS === 'android' && <Button title={busy ? 'Finding supported apps…' : 'Find supported apps'} icon="scan-outline" onPress={consent} disabled={busy || !discoveryAvailable}/>}
      {Platform.OS === 'android' && !discoveryAvailable && <Copy muted>Automatic discovery needs the SHOMAR Android development build. You can select apps manually in Expo Go.</Copy>}
      {busy && <ActivityIndicator color={c.blue}/>}
      {detected && <Copy>{detected.length ? `${detected.length} supported apps found. Select the ones you want below.` : 'No supported apps found. You can still choose accounts manually.'}</Copy>}
      {!!error && <Notice>{error}</Notice>}
    </Card>
    <Notice>Adding an app saves a checklist. Account access and automatic monitoring are not connected yet.</Notice>
    <Text style={s.label}>{state.selectedApps.length} selected</Text>
    <Chips values={categories} value={category} onChange={setCategory}/>
    {catalog.filter(app => category === 'All' || app.category === category).map(app => <Card key={app.id}>
      <View style={s.row}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: `${app.color}15`, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: app.color, fontWeight: '800', fontSize: 18 }}>{app.mark}</Text></View>
        <View style={{ flex: 1 }}><Text style={s.h2}>{app.name}</Text><Text style={s.small}>{app.category}{detected?.includes(app.id) ? ' · Found on this phone' : ''}</Text></View>
      </View>
      <Tick title={`Include ${app.name}`} checked={state.selectedApps.includes(app.id)} onPress={() => update(v => selectApp(v, app.id))}/>
      {!setup && state.selectedApps.includes(app.id) && <View>
        <Text style={s.small}>Your checklist · mark only steps you have completed in the official app</Text>
        {appTasks.map(task => <Tick key={task.id} title={task.title} description={task.body} checked={state.appProgress[app.id]?.includes(task.id) ?? false} onPress={() => update(v => ({ ...v, appProgress: { ...v.appProgress, [app.id]: toggle(v.appProgress[app.id] ?? [], task.id) } }))}/>)}
      </View>}
    </Card>)}
  </View>;
}
