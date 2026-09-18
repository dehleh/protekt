import { useState } from 'react';
import { Alert, Linking, Platform, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { clearNotifications, requestAlerts, testAlert, updateSafetyReminder } from '../services/notifications';
import { useStore } from '../services/store';
import { Button, Card, Chips, Copy, Notice, Title, c, s } from '../ui';

export function Settings() {
  const { state, update, reset } = useStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function enableAlerts(enabled: boolean) {
    setBusy(true); setMessage('');
    try {
      if (!enabled) { update(v => ({ ...v, alerts: false, statusCard: false, reminders: 'off' })); await clearNotifications(); return; }
      const granted = await requestAlerts();
      update(v => ({ ...v, alerts: granted, statusCard: granted && v.statusCard }));
      setMessage(granted ? 'Warnings are enabled for checks you run in SHOMAR.' : 'Notifications are blocked. You can change permission in your phone settings.');
    } catch { setMessage('Notification settings could not be updated. Please try again.'); }
    finally { setBusy(false); }
  }
  async function test() {
    setBusy(true);
    try {
      if (!(await requestAlerts())) { update(v => ({ ...v, alerts: false, statusCard: false, reminders: 'off' })); setMessage('Allow notifications in phone settings to test an alert.'); return; }
      await testAlert(); setMessage('Test notification sent to this phone.');
    } catch { setMessage('The test notification could not be sent.'); }
    finally { setBusy(false); }
  }
  async function changeLock(enabled: boolean) {
    setBusy(true); setMessage('');
    try {
      if (!enabled) { update(v => ({ ...v, appLock: false })); return; }
      const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
      if (!hardware || !enrolled) { setMessage('Set up a phone passcode, fingerprint, or Face ID first, then try again.'); return; }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Turn on SHOMAR app lock', fallbackLabel: 'Use phone passcode', disableDeviceFallback: false });
      if (result.success) { update(v => ({ ...v, appLock: true })); setMessage('SHOMAR will lock when it leaves the foreground.'); }
    } catch { setMessage('App lock could not be enabled on this phone.'); }
    finally { setBusy(false); }
  }
  async function changeReminder(value: string) {
    const cadence = value === 'Weekly' ? 'weekly' : value === 'Monthly' ? 'monthly' : 'off';
    setBusy(true); setMessage('');
    try {
      if (cadence !== 'off' && !(await requestAlerts())) { setMessage('Allow notifications before scheduling a safety check-in.'); return; }
      update(v => ({ ...v, reminders: cadence, alerts: cadence === 'off' ? v.alerts : true }));
      await updateSafetyReminder(cadence);
      setMessage(cadence === 'off' ? 'Safety check-in reminders are off.' : `${value} safety check-ins are scheduled on this phone.`);
    } catch { setMessage('The reminder schedule could not be changed.'); }
    finally { setBusy(false); }
  }
  function clear() {
    Alert.alert('Clear all SHOMAR data on this phone?', 'This removes check summaries, app choices, family profiles and checklist progress, and turns off SHOMAR notifications.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear all data', style: 'destructive', onPress: () => {
      setBusy(true);
      void (async () => { try { await clearNotifications(); await reset(); } catch { Alert.alert('Could not finish clearing data', 'Please try again. Some local data or notifications may remain.'); } finally { setBusy(false); } })();
    } }]);
  }
  return <View style={s.stack}>
    <Title>Make it yours.</Title><Copy muted>Your choices, your notifications, your data.</Copy>
    <Card><View style={s.row}><View style={{ flex: 1 }}><Text style={s.h2}>Warning notifications</Text><Copy muted>Notify me when a check I run finds warning signs.</Copy></View><Switch accessibilityLabel="Warning notifications" value={state.alerts} disabled={busy} onValueChange={v => void enableAlerts(v)} trackColor={{ true: c.blue }}/></View>
      <Copy muted>Automatic background account monitoring and remote family alerts are not available in this build.</Copy>
      <Button secondary title="Send a test notification" disabled={!state.alerts || busy} onPress={() => void test()}/>
      <Button secondary title="Open phone notification settings" icon="open-outline" onPress={() => void Linking.openSettings().catch(() => setMessage('Open Settings on your phone, then find SHOMAR Protect.'))}/>
    </Card>
    <Card><Text style={s.h2}>Status at a glance</Text>
      <Copy muted>The app’s safety pulse uses grey before a check, amber for uncertainty, red for strong warnings and green only when the latest content check found no warning patterns.</Copy>
      {Platform.OS === 'android' ? <><View style={s.row}><View style={{ flex: 1 }}><Text style={s.label}>Android notification card</Text><Copy muted>Show the latest check status in the notification panel.</Copy></View><Switch accessibilityLabel="Android status notification card" value={state.statusCard && state.alerts} disabled={!state.alerts || busy} onValueChange={v => update(value => ({ ...value, statusCard: v }))} trackColor={{ true: c.blue }}/></View><Copy muted>The phone controls the small status-bar icon and whether the card stays visible. This is not a live protection light.</Copy></> : <Copy muted>iPhone supports permitted notifications and the in-app pulse. This build cannot add a permanent light to the iPhone status bar.</Copy>}
    </Card>
    <Card><Text style={s.h2}>Regular safety check-ins</Text><Copy muted>A private notification can remind you to review account sessions, family settings and suspicious messages. It does not run a background scan.</Copy><Chips values={['Off', 'Weekly', 'Monthly']} value={state.reminders === 'weekly' ? 'Weekly' : state.reminders === 'monthly' ? 'Monthly' : 'Off'} onChange={value => void changeReminder(value)}/></Card>
    <Card><View style={s.row}><View style={{ flex: 1 }}><Text style={s.h2}>Lock SHOMAR</Text><Copy muted>Require the phone’s secure unlock after SHOMAR leaves the foreground.</Copy></View><Switch accessibilityLabel="Lock SHOMAR with phone security" value={state.appLock} disabled={busy} onValueChange={value => void changeLock(value)} trackColor={{ true: c.blue }}/></View><Copy muted>SHOMAR does not receive or store your fingerprint, face data, or phone passcode.</Copy></Card>
    <Card><Text style={s.h2}>Language & data</Text><Text style={s.label}>Guidance language</Text><Chips values={['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo']} value={state.language} onChange={language => update(v => ({ ...v, language: language as any }))}/><View style={s.row}><View style={{ flex: 1 }}><Text style={s.label}>Low-data mode</Text><Copy muted>Keep optional future reputation lookups off. Current pattern, screenshot and QR checks already run locally.</Copy></View><Switch accessibilityLabel="Low-data mode" value={state.lowData} onValueChange={lowData => update(v => ({ ...v, lowData }))} trackColor={{ true: c.blue }}/></View></Card>
    {!!message && <Notice>{message}</Notice>}
    <Card><Text style={s.h2}>Private by default</Text><Copy>Checks run on this device. Submitted messages and links stay in temporary memory and are discarded when you leave ScamCheck.</Copy><Copy muted>This phone saves your app choices, family nicknames and age groups, checklist progress, notification preferences and up to 30 check summaries. This storage is not a password vault. There is no account sync.</Copy><Button secondary title="Clear all local data" icon="trash-outline" disabled={busy} onPress={clear}/></Card>
    <Text style={s.small}>SHOMAR Protect · Mobile preview 0.2.1</Text>
  </View>;
}
