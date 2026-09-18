import test from 'node:test';
import assert from 'node:assert/strict';
import { VERNACULAR_GUIDANCE, LANGUAGES } from '../lib/vernacular.ts';
import { processInboundMessage } from '../lib/bot-gateway.ts';

test('vernacular dictionary covers all 5 languages for all verdicts', () => {
  const verdicts = ['likely-scam', 'suspicious', 'uncertain', 'no-signals'];
  for (const lang of LANGUAGES) {
    for (const v of verdicts) {
      const g = VERNACULAR_GUIDANCE[lang.id]?.[v];
      assert.ok(g, `Missing guidance for ${lang.id} ${v}`);
      assert.ok(g.advice.length > 10);
      assert.ok(g.speechText.length > 10);
      assert.ok(g.actionTips.length > 0);
    }
  }
});

test('bot gateway responds to language change commands', () => {
  const reply = processInboundMessage({ senderId: 'user-1', text: 'hausa' });
  assert.equal(reply.language, 'Hausa');
  assert.match(reply.message, /Language set to Hausa/i);
});

test('bot gateway responds to emergency SOS keywords', () => {
  const reply = processInboundMessage({ senderId: 'user-2', text: 'SOS' });
  assert.match(reply.message, /SHOMAR CYBER SOS/);
  assert.match(reply.message, /Lost Money\?/);
});

test('bot gateway assesses suspicious messages and outputs vernacular guidance', () => {
  const reply = processInboundMessage({
    senderId: 'user-3',
    text: 'URGENT: Your bank account will be closed. Send your OTP immediately to keep active.',
    language: 'Pidgin assist',
  });
  assert.equal(reply.assessment?.verdict, 'likely-scam');
  assert.match(reply.message, /SHOMAR Protect/);
  assert.match(reply.message, /Dis message get serious scam signs/i);
});
