import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState, selectApp, summarize, pulse } from '../src/core/state.ts';
import { createWriteQueue } from '../src/core/write-queue.ts';
import { assess } from '../../lib/scam-engine.ts';

test('missing, corrupt and future-version storage starts without protection claims', () => {
  for (const input of [null, 'bad json', '[]', '{"version":3,"alerts":true}']) assert.deepEqual(restoreState(input), initialState());
  assert.equal(pulse().tone, 'neutral');
});
test('restoration rejects unknown apps and progress for unselected accounts', () => {
  const state = restoreState(JSON.stringify({ version: 2, selectedApps: ['whatsapp', 'unknown', 'whatsapp'], appProgress: { whatsapp: ['sign-in', 'secret'], instagram: ['recovery'] }, alerts: 'true', statusCard: 1 }));
  assert.deepEqual(state.selectedApps, ['whatsapp']);
  assert.deepEqual(state.appProgress, { whatsapp: ['sign-in'] });
  assert.equal(state.alerts, false); assert.equal(state.statusCard, false);
});
test('removing an account removes its saved checklist and never auto-adds another account', () => {
  const before = { ...initialState(), selectedApps: ['whatsapp'], appProgress: { whatsapp: ['sign-in'] } };
  const removed = selectApp(before, 'whatsapp');
  assert.deepEqual(removed.selectedApps, []); assert.deepEqual(removed.appProgress, {});
  assert.deepEqual(before.appProgress, { whatsapp: ['sign-in'] });
  assert.equal(selectApp(before, 'not-supported'), before);
});
test('assessment summary never persists submitted content, destinations or explanations', () => {
  const result = assess('URGENT: Send your OTP immediately to https://example.com/private-token', 'message');
  const summary = summarize(result, 'check-one');
  assert.deepEqual(Object.keys(summary).sort(), ['checkedAt', 'id', 'mode', 'signals', 'verdict']);
  const saved = JSON.stringify(summary);
  for (const secret of ['OTP', 'example.com', 'private-token', 'URGENT']) assert.equal(saved.includes(secret), false);
  assert.equal(summary.verdict, 'likely-scam');
});
test('restored summaries strip unexpected fields and discard invalid records', () => {
  const summary = { id: '1', verdict: 'suspicious', mode: 'link', checkedAt: '2026-09-07T10:00:00Z', signals: 2 };
  const restored = restoreState(JSON.stringify({ version: 2, history: [{ ...summary, input: 'private content', domains: ['private.example'] }, { ...summary, signals: -1 }, { ...summary, checkedAt: 'not a date' }, { ...summary, verdict: 'safe' }] }));
  assert.deepEqual(restored.history, [summary]);
});
test('history is bounded to the 30 most recently supplied summaries', () => {
  const history = Array.from({ length: 45 }, (_, i) => ({ id: String(i), verdict: 'uncertain', mode: 'message', checkedAt: '2026-09-07T10:00:00Z', signals: 0 }));
  const result = restoreState(JSON.stringify({ version: 2, history }));
  assert.equal(result.history.length, 30); assert.equal(result.history[29].id, '29');
});
test('family profiles reject malformed data and do not restore unrelated personal fields', () => {
  const member = { id: 'child-one', name: '  Junior  ', role: 'Child', age: '10–12', email: 'private@example.com', location: 'private' };
  const result = restoreState(JSON.stringify({ version: 2, family: [member, null, { ...member, age: '11' }, { ...member, name: '' }] }));
  assert.deepEqual(result.family, [{ id: 'child-one', name: 'Junior', role: 'Child', age: '10–12' }]);
});
test('green describes only a recent no-signals result; uncertainty is amber', () => {
  const now = Date.parse('2026-09-07T10:00:00Z');
  const sample = { id: '1', verdict: 'no-signals', mode: 'message', checkedAt: new Date(now).toISOString(), signals: 0 };
  assert.equal(pulse(sample, now).tone, 'good');
  assert.match(pulse(sample, now).detail, /not guaranteed/);
  assert.equal(pulse({ ...sample, verdict: 'uncertain' }, now).tone, 'caution');
  assert.equal(pulse({ ...sample, verdict: 'likely-scam' }, now).tone, 'danger');
  for (const checkedAt of ['invalid', new Date(now - 86_400_001).toISOString(), new Date(now + 120_000).toISOString()]) assert.equal(pulse({ ...sample, checkedAt }, now).tone, 'neutral');
});
test('queued writes cannot restore old data after a reset', async () => {
  const writes = []; let release;
  const barrier = new Promise(resolve => { release = resolve; });
  const queue = createWriteQueue(async value => { if (value === 'old') await barrier; writes.push(value); });
  const old = queue('old'); const reset = queue('empty');
  await Promise.resolve(); assert.deepEqual(writes, []);
  release(); await Promise.all([old, reset]); assert.deepEqual(writes, ['old', 'empty']);
});
test('a failed save does not prevent a later successful deletion', async () => {
  const writes = [];
  const queue = createWriteQueue(async value => { if (value === 'fail') throw new Error('storage full'); writes.push(value); });
  await assert.rejects(queue('fail'), /storage full/); await queue('empty'); assert.deepEqual(writes, ['empty']);
});
test('version 1 data migrates to private version 2 preferences', () => {
  const state = restoreState(JSON.stringify({ version: 1, onboarded: true, selectedApps: ['gmail'] }));
  assert.equal(state.version, 2); assert.equal(state.onboarded, true); assert.deepEqual(state.selectedApps, ['gmail']);
  assert.equal(state.appLock, false); assert.equal(state.lowData, false); assert.equal(state.reminders, 'off');
});
test('new Nigerian scam patterns are explained without declaring certainty', () => {
  for (const message of ['Send your BVN and ATM pin to verify now', 'I mistakenly transfer money, send it back sharp sharp', 'Your loan is approved, pay processing fee']) {
    const result = assess(message, 'message');
    assert.equal(result.verdict, 'likely-scam'); assert.ok(result.signals.length > 0); assert.match(result.summary, /warning signs/i);
  }
});

test('supported vernacular languages are restored and unknown ones default to English', () => {
  for (const lang of ['English', 'Pidgin assist', 'Hausa', 'Yoruba', 'Igbo']) {
    const state = restoreState(JSON.stringify({ version: 2, language: lang }));
    assert.equal(state.language, lang);
  }
  const fallback = restoreState(JSON.stringify({ version: 2, language: 'unsupported-lang' }));
  assert.equal(fallback.language, 'English');
});

test('NUBAN and fintech spoofing patterns are caught by mobile engine tests', () => {
  const nubanCheck = assess('Transfer the deposit to account 9876543210 immediately');
  assert.ok(nubanCheck.signals.some(s => s.id === 'nuban-harvest'));

  const spoofCheck = assess('https://kudabank-verify.xyz/login', 'link');
  assert.ok(spoofCheck.signals.some(s => s.id === 'fintech-spoof'));
});

