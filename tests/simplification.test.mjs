import test from 'node:test';
import assert from 'node:assert/strict';
import { detectCheckMode } from '../lib/scam-engine.ts';
import { parseLocalState, emptyState } from '../lib/local-state.ts';
import { processInboundMessage } from '../lib/bot-gateway.ts';

test('detectCheckMode auto-detects links, social vendor posts, and messages in 1 tap', () => {
  // URLs and bare domains
  assert.equal(detectCheckMode('https://cbn-grant-portal.online/claim'), 'link');
  assert.equal(detectCheckMode('http://opay-claim-bonus.xyz'), 'link');
  assert.equal(detectCheckMode('kudabank-verify.xyz'), 'link');
  assert.equal(detectCheckMode('www.gtbank-promo.com'), 'link');

  // Social commerce vendor posts
  assert.equal(detectCheckMode('Flash sale 70% off! Payment before delivery only, no pay on delivery accepted.'), 'vendor');
  assert.equal(detectCheckMode('DM to order. Waybill fee first before dispatch.'), 'vendor');
  assert.equal(detectCheckMode('Order via whatsapp. Strictly payment validates order.'), 'vendor');

  // General messages
  assert.equal(detectCheckMode('Congratulations, you won ₦50,000. Send processing fee.'), 'message');
  assert.equal(detectCheckMode('Your account is blocked. Send your OTP immediately.'), 'message');
});

test('parseLocalState handles primaryBank preference and vendor history items', () => {
  // Default on empty
  const initial = parseLocalState(null);
  assert.equal(initial.primaryBank, 'opay');

  // Restores saved primaryBank
  const restored = parseLocalState(JSON.stringify({ primaryBank: 'gtbank' }));
  assert.equal(restored.primaryBank, 'gtbank');

  // Restores history item with vendor mode
  const historyRaw = JSON.stringify({
    primaryBank: 'zenith',
    history: [
      {
        id: 'hist-1',
        mode: 'vendor',
        verdict: 'likely-scam',
        checkedAt: '2026-09-18T10:00:00.000Z',
        signals: 3,
      },
    ],
  });
  const parsedHistory = parseLocalState(historyRaw);
  assert.equal(parsedHistory.primaryBank, 'zenith');
  assert.equal(parsedHistory.history.length, 1);
  assert.equal(parsedHistory.history[0].mode, 'vendor');
});

test('bot-gateway delivers Traffic Light headline and concise format for likely scam', () => {
  const reply = processInboundMessage({
    senderId: 'user-99',
    text: 'URGENT: Your bank account will be blocked. Send your OTP immediately to keep active.',
  });

  assert.equal(reply.assessment?.verdict, 'likely-scam');
  assert.match(reply.message, /🛑 \*STOP\. DO NOT SEND MONEY OR CODES\.\*/);
  assert.match(reply.message, /⚡ \*Top Action\*/);
  assert.match(reply.message, /🔍 \*Key Warning Signs:\*/);
});
