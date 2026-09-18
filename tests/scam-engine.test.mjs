import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, validateInput, MAX_INPUT } from '../lib/scam-engine.ts';

test('a request for an OTP receives a strong warning', () => {
  const result = assess('Please send your OTP to our support agent immediately.');
  assert.equal(result.verdict, 'likely-scam');
  assert.ok(result.signals.some(s => s.id === 'secret'));
});
test('routine non-scam messages never receive a guarantee of safety', () => {
  const result = assess('Hello, our usual team meeting is at the office tomorrow afternoon.');
  assert.equal(result.verdict, 'no-signals');
  assert.match(result.summary, /not a guarantee/);
});
test('security advice is not mistaken for a request for a secret', () => {
  const result = assess('Never share your OTP or password with anyone. Keep your account secure.');
  assert.ok(!result.signals.some(s => s.id === 'secret'));
});
test('a plain HTTPS link remains unverified', () => {
  const result = assess('https://example.com', 'link');
  assert.equal(result.verdict, 'uncertain');
  assert.deepEqual(result.domains, ['example.com']);
});
test('deceptive userinfo identifies the actual host', () => {
  const result = assess('https://trusted-bank.example@attacker.example/login', 'link');
  assert.deepEqual(result.domains, ['attacker.example']);
  assert.ok(result.signals.some(s => s.id === 'userinfo'));
});
test('HTTP warnings are not proof that a domain is malicious', () => {
  assert.equal(assess('http://example.com', 'link').verdict, 'suspicious');
});
test('shortened links remain unresolved', () => {
  const result = assess('https://bit.ly/example', 'link');
  assert.ok(result.signals.some(s => s.id === 'shortened'));
});
test('advance fee grant plus urgency is treated as likely scam', () => {
  assert.equal(assess('Congratulations! You have been selected for a business grant. Pay a processing fee to claim your reward. Act now!').verdict, 'likely-scam');
});
test('guaranteed investment returns trigger a strong warning', () => {
  assert.equal(assess('We offer guaranteed returns. Double your money this week.').verdict, 'likely-scam');
});
test('payment receipt claims prompt independent verification', () => {
  assert.ok(assess('Transfer successful. Please release the goods now.').signals.some(s => s.id === 'payment-proof'));
});
test('a sideloaded app request is flagged without claiming malware analysis', () => {
  const result = assess('Install our rewards.apk file to continue using the service.');
  assert.ok(result.signals.some(s => s.id === 'sideload'));
  assert.ok(result.signals.some(s => /No app file has been scanned/.test(s.detail)));
});
test('invalid, multiple, and executable links are rejected', () => {
  for (const input of ['javascript:alert(1)', 'file:///etc/passwd', 'https://', 'not a link', 'https://example.com https://example.org']) assert.ok(validateInput(input, 'link'), input);
});
test('empty and oversized text is rejected', () => {
  assert.ok(validateInput('  ', 'message'));
  assert.ok(validateInput('a'.repeat(MAX_INPUT + 1), 'message'));
});
test('bare domains are accepted without being trusted', () => {
  assert.equal(validateInput('example.com', 'link'), null);
  assert.equal(assess('example.com', 'link').verdict, 'uncertain');
});
test('multiple links do not duplicate a warning', () => {
  const result = assess('Please review http://example.com and http://example.org');
  assert.equal(result.signals.filter(s => s.id === 'http').length, 1);
});
test('single-word messages request more context', () => {
  assert.equal(assess('Hello').verdict, 'uncertain');
});

test('a 10-digit NUBAN payment demand triggers a strong warning', () => {
  const result = assess('Transfer the registration fee into this account 0123456789 immediately.');
  assert.ok(result.signals.some(s => s.id === 'nuban-harvest'));
  assert.equal(result.verdict, 'likely-scam');
});

test('a private chat redirect for financial or work offers is flagged', () => {
  const result = assess('New crypto investment task available. Click wa.me/2348012345678 to start earning daily profit.');
  assert.ok(result.signals.some(s => s.id === 'chat-redirect'));
  assert.equal(result.verdict, 'suspicious');
});

test('a lookalike fintech domain triggers fintech-spoof signal', () => {
  const result = assess('https://opay-bonus-claim.net/login', 'link');
  assert.ok(result.signals.some(s => s.id === 'fintech-spoof'));
  assert.equal(result.verdict, 'likely-scam');
});

test('an official fintech domain does not trigger fintech-spoof signal', () => {
  const result = assess('https://opayweb.com/login', 'link');
  assert.ok(!result.signals.some(s => s.id === 'fintech-spoof'));
});

