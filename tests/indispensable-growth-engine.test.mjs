import test from 'node:test';
import assert from 'node:assert/strict';
import { assessAccountTransfer } from '../lib/threat-ledger.ts';
import { generateDealLink } from '../lib/vendor-trust.ts';
import { generatePndDisputeLetter } from '../lib/ussd-directory.ts';
import {
  scanCreatorSponsorship,
  TELCO_ANTI_HIJACK,
  generateChannelHijackAffidavit,
  CREATOR_SUPPORT_CHANNELS,
} from '../lib/social-shield.ts';

test('Pre-Transfer Radar: flags known African fraud accounts and returns report count', () => {
  const result = assessAccountTransfer('0123456789', 'Access Bank');
  assert.equal(result.riskLevel, 'flagged-fraud');
  assert.equal(result.reportCount, 7);
  assert.match(result.lastReportedModus, /iPhone/i);
  assert.match(result.recommendation, /DO NOT TRANSFER/);
  assert.match(result.recommendationPidgin, /NO SEND MONEY/);

  // M-Pesa Kenyan fraud line
  const mpesaResult = assessAccountTransfer('254700000001', 'Safaricom M-Pesa');
  assert.equal(mpesaResult.riskLevel, 'flagged-fraud');
  assert.ok(mpesaResult.reportCount >= 5);

  // Clean account
  const cleanResult = assessAccountTransfer('2049102941', 'OPay');
  assert.equal(cleanResult.riskLevel, 'safe');
  assert.equal(cleanResult.reportCount, 0);

  // Irregular account
  const invalidResult = assessAccountTransfer('123', 'AnyBank');
  assert.equal(invalidResult.riskLevel, 'caution');
});

test('Merchant Safe Deal Link: generates verified transaction link and bio snippet', () => {
  const deal = generateDealLink('gadgetshub_ng', 'iPhone 13 Pro 128GB', 350000, 'NGN');

  assert.equal(deal.vendorHandle, 'gadgetshub_ng');
  assert.match(deal.dealCode, /^DEAL-[0-9A-F]{1,8}$/);
  assert.match(deal.dealUrl, /https:\/\/protect\.shomar\.africa\/deal\/gadgetshub_ng\?ref=DEAL-/);
  assert.match(deal.shareMessage, /PROTECTED PURCHASE DEAL/);
  assert.match(deal.shareMessage, /NGN 350,000/);
  assert.match(deal.bioSnippet, /SHOMAR Verified Merchant/);
});

test('15-Minute Bank Freeze & PND: generates compliant Post-No-Debit legal notice', () => {
  const letter = generatePndDisputeLetter({
    victimName: 'Chukwuma Obi',
    victimBank: 'Access Bank',
    victimAccount: '0123456789',
    scammerBank: 'OPay',
    scammerAccount: '9012345678',
    amount: '85,000',
    currency: 'NGN',
    transactionReference: 'SESS-20260918-99482',
    incidentTimestamp: '2026-09-18T22:30:00Z',
    narrative: 'Victim sent funds following fake Instagram delivery promise.',
  });

  assert.match(letter, /POST-NO-DEBIT \(PND\) DEMAND/);
  assert.match(letter, /FRAUD RISK MANAGEMENT DESK — OPAY/);
  assert.match(letter, /NGN 85,000/);
  assert.match(letter, /SESS-20260918-99482/);
  assert.match(letter, /blnd_pnd_/);
});

test('Social Vault: detects password-protected archive infostealer sponsorship traps', () => {
  const phishingEmail = `
    Hello creator! We are GameTech Studios and want to sponsor your YouTube channel with $4,500.
    Please download our game build launcher and contract from Google Drive:
    drive.google.com/file/d/game_client.zip (password is 1234).
    Review within 24 hours to secure your spot!
  `;

  const scan = scanCreatorSponsorship(phishingEmail);
  assert.equal(scan.verdict, 'critical-infostealer');
  assert.ok(scan.riskScore >= 50);
  assert.ok(scan.threatFlags.length >= 2);
  assert.match(scan.threatFlags[0], /Password-protected archive/i);
  assert.match(scan.explanationPidgin, /session stealer virus/i);
});

test('Social Vault: detects executable screensaver and fake copyright strike messages', () => {
  const scrPayload = 'Here is the media kit for our brand deal: attached media_kit.scr';
  const scanScr = scanCreatorSponsorship(scrPayload);
  assert.equal(scanScr.verdict, 'critical-infostealer');
  assert.match(scanScr.threatFlags[0], /Executable or screensaver/i);

  const fakeCopyright = 'Urgent: Your account violated copyright guidelines. 24 hours to appeal before permanent disable.';
  const scanCopyright = scanCreatorSponsorship(fakeCopyright);
  assert.ok(scanCopyright.riskScore >= 35);
  assert.match(scanCopyright.threatFlags[0], /Urgent copyright/i);

  const benignInquiry = 'Hi, we are interested in booking a 30s ad slot on your podcast next month. Could you share your rate card?';
  const scanBenign = scanCreatorSponsorship(benignInquiry);
  assert.equal(scanBenign.verdict, 'clean');
  assert.equal(scanBenign.threatFlags.length, 0);
});

test('Social Vault: provides universal GSM ##002# call forwarding canceler and recovery affidavit', () => {
  assert.equal(TELCO_ANTI_HIJACK.cancelCallForwardingCode, '##002#');
  assert.equal(TELCO_ANTI_HIJACK.cancelCallForwardingDialer, 'tel:%23%23002%23');
  assert.ok(TELCO_ANTI_HIJACK.simPinGuides.length >= 4);

  const affidavit = generateChannelHijackAffidavit({
    creatorName: 'David Adeleke',
    channelOrHandle: '@TechWithTunde',
    platform: 'YouTube',
    accountUrlOrNumber: 'https://youtube.com/@TechWithTunde',
    monetizationId: 'pub-984729104829',
    compromisedDate: '18 Sep 2026',
    lastCleanLocation: 'Lagos, Nigeria',
    contactEmail: 'tunde.recovery@gmail.com',
  });

  assert.match(affidavit, /EMERGENCY CREATOR ACCOUNT HIJACK/);
  assert.match(affidavit, /pub-984729104829/);
  assert.match(affidavit, /tunde\.recovery@gmail\.com/);
  assert.match(affidavit, /SHA256-SHM-/);

  assert.ok(CREATOR_SUPPORT_CHANNELS.youtube.twitterEscalation.includes('TeamYouTube'));
  assert.ok(CREATOR_SUPPORT_CHANNELS.whatsapp.helpdeskEmail === 'support@whatsapp.com');
});
