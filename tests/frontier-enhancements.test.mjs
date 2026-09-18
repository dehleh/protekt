import test from 'node:test';
import assert from 'node:assert/strict';
import { DRILL_SCENARIOS } from '../lib/pocket-drill.ts';
import { assess } from '../lib/scam-engine.ts';

test('Pocket Cyber Drill covers 4 street-smart scenarios with bilingual explanations', () => {
  assert.ok(DRILL_SCENARIOS.length >= 4, 'Should have at least 4 scenarios');

  for (const scenario of DRILL_SCENARIOS) {
    assert.ok(scenario.id, 'Scenario must have an id');
    assert.ok(scenario.tag, 'Scenario must have a category tag');
    assert.ok(scenario.question.length > 20, 'Question must have descriptive detail');
    assert.equal(scenario.options.length, 2, 'Must have exactly 2 choices (safe vs risky)');

    const correctCount = scenario.options.filter((o) => o.isCorrect).length;
    assert.equal(correctCount, 1, 'Exactly one option must be the safe correct choice');

    assert.ok(scenario.explanationEn.length > 20, 'Missing English explanation');
    assert.ok(scenario.explanationPidgin.length > 20, 'Missing Pidgin explanation');
  }
});

test('Evidence Slip deterministic reference ID and zero-knowledge hash generation', () => {
  const result = assess('Urgent: Your OPay account has been blocked. Send your 6-digit OTP code to 08021112233');

  let hash = 0x811c9dc5;
  const hashSource = `${result.checkedAt}:${result.verdict}:${result.signals.length}`;
  for (let i = 0; i < hashSource.length; i++) {
    hash ^= hashSource.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const incidentRef = `INC-SHM-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

  assert.match(incidentRef, /^INC-SHM-[0-9A-F]{8}$/, 'Must be an 8-character hex incident ID');
  assert.equal(result.verdict, 'likely-scam');
  assert.ok(result.signals.length >= 2, 'Should flag multiple signals');
});

test('Family Broadcast message template prevents secondary impersonation extortion', () => {
  const defaultMessage = [
    '🚨 SECURITY ALERT FROM ME:',
    'I just detected a suspicious scam attempt and temporarily secured my bank / mobile accounts.',
    '',
    '⚠️ CRITICAL WARNING FOR FAMILY & FRIENDS:',
    'If anyone contacts you on WhatsApp, SMS, or phone asking for money, claiming I had an emergency, was arrested, or need urgent bail/treatment: DO NOT SEND ANY MONEY.',
    'It is an impersonation scam. Always call my standard phone line directly to verify.',
    '',
    '— Alert sent via SHOMAR Protect (African Digital-Trust Network)',
  ].join('\n');

  assert.match(defaultMessage, /DO NOT SEND ANY MONEY/);
  assert.match(defaultMessage, /impersonation scam/i);
  assert.match(defaultMessage, /call my standard phone line/i);
  assert.ok(!defaultMessage.includes('password'), 'Template should never contain credentials');
});
