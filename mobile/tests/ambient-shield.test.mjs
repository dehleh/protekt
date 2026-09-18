import test from 'node:test';
import assert from 'node:assert/strict';
import { scanAmbientMessage } from '../src/services/ambient-shield.ts';

test('scanAmbientMessage triggers CRITICAL alert for ambient OTP theft attempt', () => {
  const message = 'Dear customer, your bank account is about to be blocked. To prevent this, send the 6-digit OTP code sent to your phone immediately to verify identity.';
  const alert = scanAmbientMessage(message, { country: 'NG', primaryBankId: 'gtbank' });

  assert.ok(alert !== null, 'Expected alert for OTP demand');
  assert.equal(alert.urgency, 'CRITICAL');
  assert.match(alert.title, /OTP \/ PIN THEFT/i);
  assert.match(alert.panicDialUri, /tel:\*737\*51\*74/);
});

test('scanAmbientMessage triggers CRITICAL alert for M-Pesa fake SMS reversal in Kenya', () => {
  const message = 'Confimed. Ksh 15,000 sent to John Kamau. Wait, wrong person? Call 0700000001 or click link to reverse M-Pesa transaction immediately.';
  const alert = scanAmbientMessage(message, { country: 'KE', primaryBankId: 'safaricom-mpesa' });

  assert.ok(alert !== null, 'Expected alert for fake M-Pesa reversal');
  assert.equal(alert.urgency, 'CRITICAL');
  assert.match(alert.panicDialUri, /tel:\*100\*100/);
});

test('scanAmbientMessage catches known threat ledger item in zero-knowledge mode', () => {
  // 0123456789 is a pre-seeded account threat
  const message = 'Transfer the processing fee of 5,000 naira to account 0123456789 to receive your grant.';
  const alert = scanAmbientMessage(message, { country: 'NG' });

  assert.ok(alert !== null, 'Expected alert for threat ledger match');
  assert.equal(alert.urgency, 'CRITICAL');
  assert.match(alert.title, /KNOWN THREAT DETECTED/i);
  assert.ok(alert.matchedThreat?.flagged);
});

test('scanAmbientMessage returns null for benign routine messages', () => {
  const message = 'Good morning mom, how was your night? Hope everyone is fine at home.';
  const alert = scanAmbientMessage(message, { country: 'NG' });

  assert.equal(alert, null, 'Routine message must not trigger any ambient alert');
});
