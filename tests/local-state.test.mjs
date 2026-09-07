import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalState, historyEntry, toggleItem } from '../lib/local-state.ts';
import { assess } from '../lib/scam-engine.ts';

test('history construction excludes submitted content and domain names', () => {
  const assessment = assess('https://private-client.example', 'link');
  const summary = historyEntry(assessment, 'check-1');
  assert.deepEqual(Object.keys(summary).sort(), ['checkedAt', 'id', 'mode', 'signals', 'verdict']);
  assert.ok(!JSON.stringify(summary).includes('private-client'));
});
test('malformed persisted data safely returns an empty state', () => {
  for (const raw of [null, '', 'not-json', 'null', '42', '{}']) {
    assert.deepEqual(parseLocalState(raw), { checklist: [], recovery: [], history: [] });
  }
});
test('unknown properties are discarded from restored history', () => {
  const history = [{ id: 'a', mode: 'message', verdict: 'uncertain', checkedAt: '2026-09-06T12:00:00Z', signals: 0, originalText: 'private-message', extra: true }];
  const parsed = parseLocalState(JSON.stringify({ history }));
  assert.equal(parsed.history.length, 1);
  assert.ok(!JSON.stringify(parsed).includes('private-message'));
});
test('corrupted verdicts, dates, and warning counts are ignored', () => {
  const valid = { id: 'a', mode: 'message', verdict: 'uncertain', checkedAt: '2026-09-06T12:00:00Z', signals: 0 };
  const history = [{ ...valid, verdict: 'guaranteed-safe' }, { ...valid, checkedAt: 'nonsense' }, { ...valid, signals: -10 }, { ...valid, mode: '<script>' }];
  assert.equal(parseLocalState(JSON.stringify({ history })).history.length, 0);
});
test('history is bounded to 30 summaries', () => {
  const result = assess('A normal meeting reminder for tomorrow afternoon at the office.');
  const history = Array.from({ length: 100 }, (_, i) => historyEntry(result, String(i)));
  assert.equal(parseLocalState(JSON.stringify({ history })).history.length, 30);
});
test('toggling checklist items is reversible and does not duplicate entries', () => {
  assert.deepEqual(toggleItem(['email'], 'email', true), ['email']);
  assert.deepEqual(toggleItem(['email', 'phone'], 'email', false), ['phone']);
});
