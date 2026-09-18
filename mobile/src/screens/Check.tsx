import { useEffect, useState } from 'react';
import { Image, Keyboard, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { assess, MAX_INPUT, type Assessment } from '../../../lib/scam-engine';
import { examples } from '../../../lib/safety-content';
import { BANK_PANIC_DIRECTORY } from '../../../lib/ussd-directory';
import { VERNACULAR_GUIDANCE } from '../../../lib/vernacular';
import { pulse, summarize } from '../core/state';
import { notifyWarning } from '../services/notifications';
import { analyzeScreenshot, textRecognitionAvailable } from '../services/image-analysis';
import { useStore } from '../services/store';
import { Button, Card, Chips, Copy, Icon, Notice, Title, c, s } from '../ui';

export type IncomingCheck = { token: string; text?: string; imageUri?: string; contentSize?: number | null };
export function Check({ openSOS, incoming }: { openSOS: () => void; incoming?: IncomingCheck | null }) {
  const { state, update } = useStore();
  const [mode, setMode] = useState<'message' | 'link' | 'vendor'>('message');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Assessment | null>(null);
  const [error, setError] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [imageNote, setImageNote] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const userBank = BANK_PANIC_DIRECTORY.find(b => b.id === state.primaryBank) || BANK_PANIC_DIRECTORY[0];

  async function processImage(uri: string, contentSize?: number | null) {
    if (contentSize && contentSize > 8_000_000) { setError('Choose a screenshot smaller than 8 MB.'); return; }
    setImageBusy(true); setError(''); setImageNote(''); setResult(null); setImageUri(uri);
    try {
      const found = await analyzeScreenshot(uri);
      const qrText = found.qrValues.map(value => `QR code: ${value}`).join('\n');
      const qrOnlyLink = !found.text && found.qrValues.length === 1 ? found.qrValues[0] : '';
      const combined = (qrOnlyLink || [found.text, qrText].filter(Boolean).join('\n\n')).slice(0, MAX_INPUT);
      if (!combined) setError(found.textError || 'No readable text or QR code was found. Try a clearer screenshot.');
      else { setInput(combined); setMode(qrOnlyLink && /^https?:\/\/\S+$/i.test(qrOnlyLink) ? 'link' : 'message'); setImageNote(`${found.text ? 'Text extracted locally' : 'No readable text'}${found.qrValues.length ? ` · ${found.qrValues.length} QR code${found.qrValues.length === 1 ? '' : 's'} found` : ' · no QR code found'}. Review everything below before checking.`); }
    } catch { setError('The screenshot could not be analysed. Try another image or paste the text.'); }
    finally { setImageBusy(false); }
  }
  useEffect(() => {
    if (!incoming) return;
    if (incoming.text) { const value = incoming.text.slice(0, MAX_INPUT); setInput(value); setMode(/^https?:\/\/\S+$/i.test(value.trim()) ? 'link' : 'message'); setResult(null); setImageUri(''); setImageNote('Shared content is ready. Review it before checking.'); }
    else if (incoming.imageUri) void processImage(incoming.imageUri, incoming.contentSize);
  }, [incoming?.token]);
  async function chooseScreenshot() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1, selectionLimit: 1 });
    if (!picked.canceled) {
      const asset = picked.assets[0];
      if (asset.width * asset.height > 24_000_000) { setError('Choose a screenshot under 24 megapixels.'); return; }
      await processImage(asset.uri, asset.fileSize);
    }
  }
  function run() {
    try {
      const next = assess(input, mode);
      const summary = summarize(next, randomUUID());
      setResult(next); setError(''); setNotificationError(''); Keyboard.dismiss();
      update(v => ({ ...v, history: [summary, ...v.history].slice(0, 30) }));
      if (state.alerts) void notifyWarning(summary).catch(() => setNotificationError('Your result is saved, but the phone could not show a notification.'));
    } catch (e) { setError(e instanceof Error ? e.message : 'Please check the text and try again.'); }
  }
  return <View style={s.stack}>
    <Title>Pause. Check. Decide.</Title>
    <Copy muted>A second look at a message, link, or vendor, before you act.</Copy>

    {/* 1-Tap Primary Bank Panic Freeze Bar */}
    {userBank.dialUri && (
      <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(userBank.dialUri!)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Icon name="alert-circle" color={c.danger} size={22}/>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.danger }}>1-TAP PANIC FREEZE: {userBank.shortName}</Text>
            <Text style={{ fontSize: 12, color: '#7F1D1D' }}>Dial {userBank.ussdCode || userBank.phoneHotline} to lock debits</Text>
          </View>
        </View>
        <View style={{ backgroundColor: c.danger, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Dial Now</Text>
        </View>
      </Pressable>
    )}

    <Card>
      <Chips values={['Message', 'Link', 'Vendor']} value={mode === 'message' ? 'Message' : mode === 'link' ? 'Link' : 'Vendor'} onChange={v => { setMode(v === 'Link' ? 'link' : v === 'Vendor' ? 'vendor' : 'message'); setResult(null); setError(''); }}/>
      <Button secondary title={imageBusy ? 'Reading screenshot…' : 'Choose a screenshot'} icon="image-outline" disabled={imageBusy} onPress={() => void chooseScreenshot()}/>
      {!textRecognitionAvailable && <Text style={s.small}>Screenshot text recognition needs the SHOMAR development build. QR reading may still work in Expo Go.</Text>}
      {!!imageUri && <Image accessibilityLabel="Selected screenshot" source={{ uri: imageUri }} resizeMode="contain" style={{ width: '100%', height: 190, borderRadius: 13, backgroundColor: '#EDF2FA' }}/>} 
      {!!imageNote && <Notice>{imageNote}</Notice>}
      <Text style={s.label}>{mode === 'message' ? 'Paste or review the message' : mode === 'link' ? 'Paste or review one website link' : 'Paste vendor post, bio, chat, or payment request'}</Text>
      <TextInput accessibilityLabel={mode === 'message' ? 'Message to check' : mode === 'link' ? 'Website link to check' : 'Vendor content to check'} multiline value={input} onChangeText={v => { setInput(v); setResult(null); setError(''); }} maxLength={MAX_INPUT} placeholder={mode === 'message' ? 'Someone sent me this…' : mode === 'link' ? 'https://example.com' : 'e.g. Flash sale 70% off! DM to order, strictly payment before delivery, transfer to 8012345678...'} placeholderTextColor={c.muted} textAlignVertical="top" autoCapitalize="none" autoCorrect={false} style={[s.input, { minHeight: 155 }]} keyboardType={mode === 'link' ? 'url' : 'default'}/>
      <Text style={s.small}>{input.length.toLocaleString()} / 12,000 · Checked on this device</Text>
      {!!error && <Text accessibilityRole="alert" style={[s.body, { color: c.danger }]}>{error}</Text>}
      <Button title="Check for warning signs" icon="shield-checkmark-outline" onPress={run}/>
      {!!input && <Button secondary title="Clear this check" onPress={() => { setInput(''); setResult(null); setError(''); setImageUri(''); setImageNote(''); }}/>} 
    </Card>
    <Notice>We check common patterns without opening the link. Screenshot text and QR codes are read on this device. This cannot verify a sender, scan an APK, or guarantee safety. Submitted content is not saved.</Notice>
    {!!notificationError && <Notice>{notificationError}</Notice>}
    {result ? <>
      <Card style={{ borderColor: result.verdict === 'likely-scam' ? '#EF4444' : result.verdict === 'suspicious' ? '#F59E0B' : '#10B981', borderWidth: 2, backgroundColor: result.verdict === 'likely-scam' ? '#FEF2F2' : result.verdict === 'suspicious' ? '#FFFBEB' : '#F0FDF4' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 28 }}>{result.verdict === 'likely-scam' ? '🛑' : result.verdict === 'suspicious' ? '⚠️' : result.verdict === 'uncertain' ? '🔍' : '🟢'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: result.verdict === 'likely-scam' ? c.danger : result.verdict === 'suspicious' ? c.caution : c.good }}>TRAFFIC LIGHT VERDICT</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: c.ink }}>
              {result.verdict === 'likely-scam' ? 'STOP. DO NOT SEND MONEY.' : result.verdict === 'suspicious' ? 'WAIT. VERIFY BEFORE PAYING.' : result.verdict === 'uncertain' ? 'NEED MORE CONTEXT.' : 'NO OBVIOUS WARNING SIGNS.'}
            </Text>
          </View>
        </View>
        <Copy>{result.summary}</Copy>
        {state.language !== 'English' && VERNACULAR_GUIDANCE[state.language] && (
          <View style={{ backgroundColor: c.white, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.line }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.blue }}>{state.language} Guidance:</Text>
            <Text style={{ fontSize: 13, color: c.ink, marginTop: 2 }}>{VERNACULAR_GUIDANCE[state.language][result.verdict].advice}</Text>
          </View>
        )}
        <Button
          title={result.verdict === 'likely-scam' ? '🚨 Emergency: Freeze Bank Account' : '🛡️ Open Cyber SOS to Verify'}
          icon={result.verdict === 'likely-scam' ? 'alert-circle-outline' : 'shield-checkmark-outline'}
          onPress={openSOS}
        />
        {result.signals.length > 0 && (
          <Pressable onPress={() => setShowDetails(!showDetails)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.muted }}>
              {showDetails ? 'Hide technical signs' : `Why was this flagged? (${result.signals.length} signs)`}
            </Text>
            <Icon name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color={c.muted}/>
          </Pressable>
        )}
        {showDetails && result.signals.map(signal => (
          <View key={signal.id} style={{ gap: 3, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 6 }}>
            <Text style={s.label}>{signal.title}</Text>
            <Copy muted>{signal.detail}</Copy>
          </View>
        ))}
        {showDetails && result.domains.length > 0 && (
          <Copy muted>Destination names: {result.domains.join(', ')}</Copy>
        )}
      </Card>
      <Card>
        <Text style={s.h2}>What to do next</Text>
        {result.actions.map((action, i) => <Copy key={action}>{i + 1}. {action}</Copy>)}
      </Card>
    </> : <Card><Text style={s.h2}>{state.history.length ? 'Latest saved check' : 'Try a sample'}</Text>{state.history[0] ? <><Copy>{pulse(state.history[0]).title}</Copy><Text style={s.small}>{new Date(state.history[0].checkedAt).toLocaleString()} · {state.history[0].signals} warning patterns</Text><Copy muted>Only the summary is saved. Paste the content again for a full assessment.</Copy><Button secondary title="Open Cyber SOS" onPress={openSOS}/></> : <><Copy muted>See how a suspicious grant message is explained.</Copy><Button secondary title="Use sample message" onPress={() => { setMode('message'); setInput(examples[0].text); }}/></>}</Card>}
  </View>;
}
