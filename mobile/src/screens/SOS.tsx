import { useState } from 'react';
import { Linking, Share, Text, TextInput, View } from 'react-native';
import { guides } from '../../../lib/safety-content';
import { BANK_PANIC_DIRECTORY } from '../../../lib/ussd-directory';
import { toggle } from '../core/state';
import { useStore } from '../services/store';
import { openGuide } from '../services/links';
import { Button, Card, Chips, Copy, Notice, Tick, Title, c, s } from '../ui';

export function SOS() {
  const { state, update } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedBankName, setSelectedBankName] = useState(() => (BANK_PANIC_DIRECTORY.find(b => b.id === state.primaryBank)?.shortName || 'OPay'));
  const [briefOpen, setBriefOpen] = useState(false);
  const [incident, setIncident] = useState('Account access');
  const [impact, setImpact] = useState('Not sure');
  const [notes, setNotes] = useState('');
  const guide = guides.find(g => g.id === selected);
  const selectedBank = BANK_PANIC_DIRECTORY.find(b => b.shortName === selectedBankName) || BANK_PANIC_DIRECTORY[0];
  async function shareBrief() {
    const safeNotes = notes.trim().slice(0, 800);
    await Share.share({ title: 'Cyber incident support brief', message: `SHOMAR CYBER INCIDENT BRIEF\n\nSituation: ${incident}\nMoney lost: ${impact}\nNotes: ${safeNotes || 'No additional notes'}\nPrepared: ${new Date().toLocaleString()}\n\nDo not add passwords, PINs, OTPs, recovery codes, full card numbers, BVN or NIN. This brief was prepared on the device and shared only after the user opened the phone share sheet.` });
  }
  return <View style={s.stack}>
    <Title>Cyber SOS</Title><Copy muted>Take a breath. Let’s work through the next steps.</Copy>
    {!guide ? <>
      <Card style={{ borderColor: '#FECACA', borderWidth: 1.5, backgroundColor: '#FEF2F2' }}>
        <Text style={[s.h2, { color: c.danger }]}>Emergency Bank Freeze (USSD Panic)</Text>
        <Copy>Dial these official emergency codes from <strong>any phone</strong> to instantly lock account debits if your device is lost or compromised.</Copy>
        <Chips values={BANK_PANIC_DIRECTORY.map(b => b.shortName)} value={selectedBank.shortName} onChange={name => {
          setSelectedBankName(name);
          const found = BANK_PANIC_DIRECTORY.find(b => b.shortName === name);
          if (found) update(v => ({ ...v, primaryBank: found.id }));
        }}/>
        <View style={{ backgroundColor: c.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', gap: 6 }}>
          <Text style={[s.label, { color: c.ink }]}>{selectedBank.name} ({selectedBank.category})</Text>
          {selectedBank.ussdCode && <Text style={{ fontSize: 22, fontWeight: '800', color: c.danger, letterSpacing: 0.5 }}>{selectedBank.ussdCode}</Text>}
          <Copy muted>{selectedBank.instructions}</Copy>
        </View>
        {selectedBank.dialUri && <Button title={`Dial ${selectedBank.ussdCode || 'Emergency Freeze'}`} icon="call-outline" onPress={() => void Linking.openURL(selectedBank.dialUri!)}/>}
        {selectedBank.phoneHotline && <Button title={`Call 24/7 Fraud Hotline (${selectedBank.phoneHotline})`} secondary icon="call-outline" onPress={() => void Linking.openURL(`tel:${selectedBank.phoneHotline}`)}/>}
      </Card>
      {guides.map(item => <Card key={item.id}><Text style={s.h2}>{item.title}</Text><Copy muted>{item.description}</Copy><Button title="Start recovery guide" secondary icon="arrow-forward-outline" onPress={() => setSelected(item.id)}/></Card>)}
      <Card><Text style={s.h2}>Prepare a support brief</Text><Copy muted>Create a short, redacted summary you can choose to share with your bank, provider, trusted person, or future SHOMAR responder.</Copy>{!briefOpen ? <Button title="Prepare support brief" secondary icon="document-text-outline" onPress={() => setBriefOpen(true)}/> : <View style={s.stack}><Text style={s.label}>What happened?</Text><Chips values={['Account access', 'Money sent', 'Lost phone', 'Threat or impersonation']} value={incident} onChange={setIncident}/><Text style={s.label}>Was money lost?</Text><Chips values={['No', 'Yes', 'Not sure']} value={impact} onChange={setImpact}/><Text style={s.label}>Short notes</Text><TextInput accessibilityLabel="Redacted incident notes" multiline value={notes} onChangeText={setNotes} maxLength={800} placeholder="What happened and when? Leave out all security secrets." placeholderTextColor={c.muted} textAlignVertical="top" style={[s.input, { minHeight: 120 }]}/><Notice>Never include passwords, PINs, OTPs, recovery codes, full card numbers, BVN or NIN.</Notice><Button title="Open phone share sheet" icon="share-social-outline" onPress={() => void shareBrief()}/><Button title="Clear brief" secondary onPress={() => { setNotes(''); setBriefOpen(false); }}/></View>}</Card>
      <Notice>These are self-help tools. A live SHOMAR response desk is not connected yet, and opening the share sheet does not send anything automatically.</Notice></> : <>
      <Button title="Choose another situation" secondary icon="arrow-back-outline" onPress={() => setSelected(null)}/>
      <Text style={s.h2}>{guide.title}</Text><Notice>{guide.urgent}</Notice>
      {guide.steps.map((step, index) => { const id = `${guide.id}:${index}`; return <Card key={id}>
        <Text style={s.small}>STEP {index + 1} OF {guide.steps.length}</Text><Text style={s.h2}>{step.title}</Text><Copy>{step.body}</Copy>
        {step.action && <Button title={step.action.label} secondary icon="open-outline" onPress={() => void openGuide(step.action!.href)}/>}
        {step.secondary && <Button title={step.secondary.label} secondary icon="open-outline" onPress={() => void openGuide(step.secondary!.href)}/>}
        <Tick title="I have completed this step" checked={state.recoveryDone.includes(id)} onPress={() => update(v => ({ ...v, recoveryDone: toggle(v.recoveryDone, id) }))}/>
      </Card>; })}
      <Button title={guide.source.label} secondary icon="open-outline" onPress={() => void openGuide(guide.source.href)}/>
    </>}
  </View>;
}
