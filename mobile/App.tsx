import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { StoreProvider, useStore } from './src/services/store';
import { updateStatusCard } from './src/services/notifications';
import { pulse } from './src/core/state';
import { Home, type Destination } from './src/screens/Home';
import { Check } from './src/screens/Check';
import type { IncomingCheck } from './src/screens/Check';
import { Apps } from './src/screens/Apps';
import { Family } from './src/screens/Family';
import { SOS } from './src/screens/SOS';
import { Settings } from './src/screens/Settings';
import { Onboarding } from './src/screens/Onboarding';
import { Icon, Notice, c, s } from './src/ui';
import type { IconName } from './src/ui';
import { ErrorBoundary } from './src/ErrorBoundary';

const tabs: { name: Destination; label: string; icon: IconName }[] = [{ name: 'Home', label: 'Home', icon: 'home-outline' }, { name: 'Check', label: 'Check', icon: 'scan-outline' }, { name: 'Apps', label: 'My apps', icon: 'apps-outline' }, { name: 'Family', label: 'Family', icon: 'people-outline' }, { name: 'SOS', label: 'SOS', icon: 'medkit-outline' }];
function Shell() {
  const { state, ready, warning, update } = useStore();
  const [screen, setScreen] = useState<Destination>('Home');
  const [now, setNow] = useState(Date.now());
  const [notificationError, setNotificationError] = useState('');
  const [incoming, setIncoming] = useState<IncomingCheck | null>(null);
  // Start closed so restored lock state cannot expose one frame before effects run.
  const [locked, setLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [lockError, setLockError] = useState('');
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const scroll = useRef<ScrollView>(null);
  const status = pulse(state.history[0], now);
  function navigate(next: Destination) {
    if (next !== 'Check') setIncoming(null);
    setScreen(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    const subscription = AppState.addEventListener('change', value => { setForeground(value === 'active'); if (value === 'active') setNow(Date.now()); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void ScreenCapture.enableAppSwitcherProtectionAsync(1).catch(() => {});
    return () => { void ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {}); };
  }, []);
  useEffect(() => {
    if (!ready || !state.onboarded) return;
    function receive(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      navigate(response.notification.request.content.data?.screen === 'Check' ? 'Check' : 'Home');
      void Notifications.clearLastNotificationResponseAsync().catch(() => {});
    }
    void Notifications.getLastNotificationResponseAsync().then(receive).catch(() => {});
    const subscription = Notifications.addNotificationResponseReceivedListener(receive);
    return () => subscription.remove();
  }, [ready, state.onboarded]);
  useEffect(() => {
    if (!ready) return;
    function readSharedContent() {
      const item = Sharing.getSharedPayloads()[0];
      if (!item?.value) return;
      if (item.shareType === 'text' || item.shareType === 'url') setIncoming({ token: `${Date.now()}-${item.value}`, text: item.value });
      else if (item.shareType === 'image') setIncoming({ token: `${Date.now()}-${item.value}`, imageUri: item.value });
      else return;
      navigate('Check'); Sharing.clearSharedPayloads();
    }
    readSharedContent();
    const link = Linking.addEventListener('url', readSharedContent);
    const active = AppState.addEventListener('change', value => { if (value === 'active') readSharedContent(); });
    return () => { link.remove(); active.remove(); };
  }, [ready]);
  useEffect(() => { if (ready && state.appLock) setLocked(true); else setLocked(false); }, [ready, state.appLock]);
  useEffect(() => {
    if (!state.appLock) return;
    const sub = AppState.addEventListener('change', value => { if (value !== 'active') setLocked(true); });
    return () => sub.remove();
  }, [state.appLock]);
  async function unlock() {
    setUnlocking(true); setLockError('');
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock SHOMAR Protect', cancelLabel: 'Cancel', fallbackLabel: 'Use phone passcode', disableDeviceFallback: false });
      if (result.success) setLocked(false); else setLockError('SHOMAR remains locked. Try again when you are ready.');
    } catch { setLockError('The phone could not open its secure unlock screen.'); }
    finally { setUnlocking(false); }
  }
  useEffect(() => {
    if (!ready) return;
    void updateStatusCard(state.onboarded && state.alerts && state.statusCard, state.history[0]).then(() => setNotificationError('')).catch(() => setNotificationError('The status notification could not be updated. Open Settings to review notification permission.'));
  }, [ready, state.onboarded, state.alerts, state.statusCard, state.history[0]?.id, status.tone]);
  useEffect(() => {
    if (!ready || !state.alerts) return;
    function refreshPermission() { void Notifications.getPermissionsAsync().then(permission => { if (!permission.granted) update(v => ({ ...v, alerts: false, statusCard: false, reminders: 'off' })); }).catch(() => {}); }
    refreshPermission();
    const sub = AppState.addEventListener('change', value => { if (value === 'active') refreshPermission(); });
    return () => sub.remove();
  }, [ready, state.alerts, update]);
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => { if (screen !== 'Home') { navigate('Home'); return true; } return false; });
    return () => back.remove();
  }, [screen]);
  useEffect(() => { if (!state.onboarded) navigate('Home'); }, [state.onboarded]);
  if (ready && state.appLock && locked) return <SafeAreaView style={layout.safe} edges={['top', 'bottom', 'left', 'right']}><StatusBar style="light"/><View style={layout.lock}><View style={{ padding: 24, borderRadius: 28, backgroundColor: '#FFFFFF14' }}><Icon name="lock-closed-outline" color="#95B3FF" size={52}/></View><Text style={[s.title, { color: c.white }]}>SHOMAR is locked</Text><Text style={[s.body, { color: '#CFDAED', textAlign: 'center' }]}>Unlock to view locally saved family profiles, account choices and check summaries.</Text>{!!lockError && <Text accessibilityRole="alert" style={[s.body, { color: '#FFB5AF', textAlign: 'center' }]}>{lockError}</Text>}<View style={{ width: '100%', maxWidth: 360 }}><Pressable accessibilityRole="button" disabled={unlocking} onPress={() => void unlock()} style={layout.unlockButton}><Text style={layout.unlockText}>{unlocking ? 'Opening secure unlock…' : 'Unlock SHOMAR'}</Text></Pressable></View></View></SafeAreaView>;
  return <SafeAreaView style={layout.safe} edges={['top', 'bottom', 'left', 'right']}>
    <StatusBar style="light"/>
    <View style={layout.header}><Icon name="shield-checkmark" color="#95B3FF" size={27}/><Text style={layout.brand}>SHOMAR <Text style={{ fontWeight: '400', color: '#CBD7EB' }}>Protect</Text></Text>{ready && state.onboarded && <Pressable accessibilityLabel={screen === 'Settings' ? 'Back to home' : 'Open notifications and privacy settings'} accessibilityRole="button" onPress={() => navigate(screen === 'Settings' ? 'Home' : 'Settings')} style={layout.settings}><Icon name={screen === 'Settings' ? 'close-outline' : 'settings-outline'} color={c.white}/></Pressable>}</View>
    {ready && state.onboarded && <View style={layout.pulse} accessibilityLiveRegion="polite"><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c[status.tone] }}/><Text style={[s.small, { color: c[status.tone], flexShrink: 1 }]}>{status.title}</Text></View>}
    {!ready ? <View style={layout.loading}><ActivityIndicator color={c.blue}/><Text style={s.body}>Loading your safety plan…</Text></View> : <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scroll} key={state.onboarded ? screen : 'onboarding'} contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets={false}>
        {!!warning && <Notice>{warning}</Notice>}{!!notificationError && <Notice>{notificationError}</Notice>}
        {!state.onboarded ? <Onboarding scrollToTop={() => scroll.current?.scrollTo({ y: 0, animated: false })}/> : screen === 'Home' ? <Home navigate={navigate} now={now}/> : screen === 'Check' ? <Check incoming={incoming} openSOS={() => navigate('SOS')}/> : screen === 'Apps' ? <Apps/> : screen === 'Family' ? <Family/> : screen === 'SOS' ? <SOS/> : <Settings/>}
      </ScrollView>
    </KeyboardAvoidingView>}
    {ready && state.onboarded && <View style={layout.tabs} accessibilityRole="tablist">{tabs.map(tab => <Pressable key={tab.name} accessibilityRole="tab" accessibilityState={{ selected: screen === tab.name }} accessibilityLabel={tab.name === 'SOS' ? 'Cyber SOS recovery guides' : tab.label} onPress={() => navigate(tab.name)} style={({ pressed }) => [layout.tab, pressed && { opacity: .6 }]}><Icon name={tab.icon} size={23} color={screen === tab.name ? c.blue : c.muted}/><Text style={[layout.tabLabel, { color: screen === tab.name ? c.blue : c.muted }]}>{tab.label}</Text></Pressable>)}</View>}
    {!foreground && <View importantForAccessibility="no-hide-descendants" style={layout.privacyCover}><Icon name="shield-checkmark" color="#95B3FF" size={54}/><Text style={[s.h2, { color: c.white }]}>SHOMAR Protect</Text><Text style={[s.body, { color: '#CFDAED', textAlign: 'center' }]}>Return to SHOMAR to view your safety plan.</Text></View>}
  </SafeAreaView>;
}
const layout = StyleSheet.create({ safe: { flex: 1, backgroundColor: c.navy }, header: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 20, paddingRight: 8, minHeight: 62 }, brand: { flex: 1, fontSize: 19, fontWeight: '800', color: c.white }, settings: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, pulse: { backgroundColor: '#EDF2FA', flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 20, paddingVertical: 9 }, content: { padding: 20, paddingBottom: 32, gap: 18, width: '100%', maxWidth: 720, alignSelf: 'center' }, tabs: { flexDirection: 'row', backgroundColor: c.white, borderTopColor: c.line, borderTopWidth: 1 }, tab: { flex: 1, minHeight: 66, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 2, gap: 4 }, tabLabel: { fontSize: 12, lineHeight: 17, fontWeight: '600', textAlign: 'center' }, loading: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }, lock: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 22 }, unlockButton: { minHeight: 54, backgroundColor: c.blue, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }, unlockText: { color: c.white, fontWeight: '700', fontSize: 16 }, privacyCover: { ...StyleSheet.absoluteFill, zIndex: 1000, elevation: 1000, backgroundColor: c.navy, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 28 } });
export default function App() { return <ErrorBoundary><SafeAreaProvider><StoreProvider><Shell/></StoreProvider></SafeAreaProvider></ErrorBoundary>; }
