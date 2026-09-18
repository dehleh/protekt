import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyBankAlert } from '../lib/fake-alert.ts';
import { LANGUAGES, VERNACULAR_GUIDANCE } from '../lib/vernacular.ts';
import { LANGUAGE_LOCALE_MAP } from '../lib/voice-speech.ts';
import { processInboundMessage } from '../lib/bot-gateway.ts';
import { auditBrandDealContract } from '../lib/social-shield.ts';
import { getVendorBySlug } from '../lib/vendor-trust.ts';

// -------------------------------------------------------------
// PILLAR 1: Fake Bank Alert & Reversal Verifier Tests
// -------------------------------------------------------------
test('Pillar 1: Flags bank credit alert sent from a personal GSM phone number', () => {
  const alertText = 'Txn: Credit\nAmt: NGN 150,000.00\nDate: 19-Sep-2026\nBal: NGN 200,000.00';
  const result = verifyBankAlert(alertText, '+2348039871234');

  assert.equal(result.verdict, 'likely-fake');
  assert.ok(result.riskScore >= 50);
  assert.ok(result.threatFlags.some(f => f.includes('PERSONAL PHONE NUMBER')));
  assert.ok(result.recommendationPidgin.includes('419'));
});

test('Pillar 1: Catches mathematical balance discrepancy in fake SMS alerts', () => {
  // Old Bal: 50,000 + Credit Amt: 100,000 should equal 150,000. But SMS says 320,000!
  const alertText = 'Txn: Credit\nAmt: NGN 100,000.00\nOld Bal: NGN 50,000.00\nBal: NGN 320,000.00\nSession: 0001849204918239';
  const result = verifyBankAlert(alertText, 'GTBANK');

  assert.ok(result.threatFlags.some(f => f.includes('ARITHMETIC DISCREPANCY')));
  assert.ok(result.riskScore >= 40);
});

test('Pillar 1: Flags accidental reversal / refund demand scam', () => {
  const alertText = 'Confirmed. Ksh 30,000 sent to JANE on 19/09/2026. Please refund me immediately my boss will kill me I sent by mistake!';
  const result = verifyBankAlert(alertText, '+254712345678');

  assert.equal(result.verdict, 'likely-fake');
  assert.ok(result.threatFlags.some(f => f.includes('REVERSAL SCAM PATTERN')));
});

test('Pillar 1: Identifies plausible authentic alert format with bank USSD dialer', () => {
  const alertText = 'Txn: Credit\nAc: 002******19\nAmt: NGN 85,000.00 CR\nDesc: NIP/GTB/CHIDI/FEES\nBal: NGN 104,220.50\nSession ID: 000013260919110545000238491823';
  const result = verifyBankAlert(alertText, 'ACCESSBANK');

  assert.equal(result.verdict, 'format-plausible');
  assert.equal(result.ussdVerifyCode, '*901*00#');
  assert.ok(result.ussdVerifyDialer.includes('tel:'));
});

// -------------------------------------------------------------
// PILLAR 2: Vernacular Voice & Audio Engine Tests
// -------------------------------------------------------------
test('Pillar 2: Supports all 7 African languages with complete guidance dictionaries', () => {
  const expectedLanguages = ['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Zulu'];

  for (const lang of expectedLanguages) {
    const langConfig = LANGUAGES.find(l => l.id === lang);
    assert.ok(langConfig, `Language ${lang} should be defined in LANGUAGES`);

    const verdicts = ['likely-scam', 'suspicious', 'uncertain', 'no-signals'];
    for (const v of verdicts) {
      const guidance = VERNACULAR_GUIDANCE[lang]?.[v];
      assert.ok(guidance, `Guidance should exist for ${lang} under ${v}`);
      assert.ok(guidance.speechText && guidance.speechText.length > 10, `speechText must exist for ${lang} under ${v}`);
      assert.ok(guidance.actionTips.length >= 2, `actionTips must exist for ${lang} under ${v}`);
    }
  }
});

test('Pillar 2: Maps all 7 languages to valid BCP 47 locale codes for speech synthesis', () => {
  const languages = ['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Zulu'];
  for (const l of languages) {
    assert.ok(Array.isArray(LANGUAGE_LOCALE_MAP[l]), `Locale map should exist for ${l}`);
    assert.ok(LANGUAGE_LOCALE_MAP[l].length > 0, `At least one locale for ${l}`);
  }
});

// -------------------------------------------------------------
// PILLAR 3: WhatsApp Bot Gateway & Playground Tests
// -------------------------------------------------------------
test('Pillar 3: WhatsApp Bot responds to Swahili and Zulu language switch commands', () => {
  const swReply = processInboundMessage({ senderId: 'u1', text: 'swahili' });
  assert.equal(swReply.language, 'Swahili');
  assert.ok(swReply.message.includes('Swahili'));

  const zuReply = processInboundMessage({ senderId: 'u2', text: 'isizulu' });
  assert.equal(zuReply.language, 'Zulu');
  assert.ok(zuReply.message.includes('Zulu'));
});

test('Pillar 3: WhatsApp Bot handles emergency SOS command with bank freeze advice', () => {
  const sosReply = processInboundMessage({ senderId: 'u3', text: 'SOS' });
  assert.ok(sosReply.message.includes('SHOMAR CYBER SOS'));
  assert.ok(sosReply.message.includes('Lost Money'));
  assert.ok(sosReply.message.includes('WhatsApp Hacked'));
});

// -------------------------------------------------------------
// PILLAR 4: Creator Brand Deal & Contract Scanner Tests
// -------------------------------------------------------------
test('Pillar 4: Flags spoofed sender domains pretending to represent major brands', () => {
  const pitch = 'Hi, we represent Nike and want to sponsor your videos for $15,000.';
  const email = 'partnerships@nike-creator-deals.co';
  const result = auditBrandDealContract(pitch, email, ['agreement.pdf']);

  assert.equal(result.brandDetected, 'Nike');
  assert.equal(result.isDomainLookalike, true);
  assert.ok(result.threatsFound.some(t => t.includes('DOMAIN SPOOFING')));
  assert.ok(result.safetyScore < 60);
});

test('Pillar 4: Catches infostealer executable attachments disguised as briefs or contracts', () => {
  const pitch = 'Please review our game brief and contract attached.';
  const email = 'agency@apex-partners.org';
  const attachments = ['sponsorship_contract.pdf.exe', 'game_brief.scr'];
  const result = auditBrandDealContract(pitch, email, attachments);

  assert.equal(result.verdict, 'critical-hijack-risk');
  assert.ok(result.threatsFound.some(t => t.includes('CRITICAL MALWARE PAYLOAD')));
  assert.ok(result.safeCounterOfferProtocol.includes('SAFE CREATOR COUNTER-OFFER PROTOCOL'));
});

test('Pillar 4: Catches YouTube Studio / Meta channel manager permission escalation traps', () => {
  const pitch = 'To link the advertising dashboard, please add our manager email (sponsor-ops@marketing-corp.com) as Manager to your YouTube Studio.';
  const result = auditBrandDealContract(pitch, 'sponsor-ops@marketing-corp.com', ['guidelines.pdf']);

  assert.equal(result.verdict, 'critical-hijack-risk');
  assert.ok(result.threatsFound.some(t => t.includes('PERMISSION TAKEOVER TRAP')));
});

// -------------------------------------------------------------
// PILLAR 6: Merchant Bio Trust Seal & Public Verification Tests
// -------------------------------------------------------------
test('Pillar 6: Resolves registered vendor by handle slug for public /v/[slug] route', () => {
  const vendor1 = getVendorBySlug('gadgetshub_ng');
  assert.ok(vendor1);
  assert.equal(vendor1.businessName, 'Gadgets Hub Technologies Ltd');
  assert.equal(vendor1.trustScore, 98);

  const vendor2 = getVendorBySlug('@nairobiluxury');
  assert.ok(vendor2);
  assert.equal(vendor2.businessName, 'Nairobi Luxury Apparel Kenya Ltd');
  assert.equal(vendor2.country, 'KE');

  const unknown = getVendorBySlug('non_existent_vendor_99');
  assert.equal(unknown, undefined);
});
