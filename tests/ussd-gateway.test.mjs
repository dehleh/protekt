import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/ussd/route.ts';

function createMockRequest(body) {
  return {
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => body,
  };
}

test('USSD Gateway: Root menu displays 4 options and begins with CON', async () => {
  const req = createMockRequest({ text: '', phoneNumber: '+2348000000000', sessionId: 'sess_01' });
  const res = await POST(req);
  const text = await res.text();

  assert.ok(text.startsWith('CON '), 'Root menu must begin with CON to keep session open');
  assert.match(text, /1\. Check Account/);
  assert.match(text, /2\. Check Phone Number/);
  assert.match(text, /3\. Emergency Bank Freeze Codes/);
  assert.match(text, /4\. Vernacular Helpline/);
});

test('USSD Gateway: Option 1 detects flagged threat account and returns END alert', async () => {
  // 0123456789 is in the threat ledger
  const req = createMockRequest({ text: '1*0123456789', phoneNumber: '+2348000000000', sessionId: 'sess_02' });
  const res = await POST(req);
  const text = await res.text();

  assert.ok(text.startsWith('END '), 'Result must terminate session with END');
  assert.match(text, /🛑 SHOMAR ALERT.*0123456789.*flagged/);
});

test('USSD Gateway: Option 1 benign account returns clear status', async () => {
  const req = createMockRequest({ text: '1*9876543210', phoneNumber: '+2348000000000', sessionId: 'sess_03' });
  const res = await POST(req);
  const text = await res.text();

  assert.ok(text.startsWith('END '));
  assert.match(text, /🟢 SHOMAR: No scam records found/);
});

test('USSD Gateway: Option 3 delivers regional emergency panic codes', async () => {
  // Kenya selection (3*2)
  const reqKe = createMockRequest({ text: '3*2', phoneNumber: '+254700000000', sessionId: 'sess_ke' });
  const resKe = await POST(reqKe);
  const textKe = await resKe.text();
  assert.ok(textKe.startsWith('END '));
  assert.match(textKe, /M-Pesa SIM Lock: \*100\*100#/);
  assert.match(textKe, /Equity Bank: \*247#/);

  // South Africa selection (3*4)
  const reqZa = createMockRequest({ text: '3*4', phoneNumber: '+27820000000', sessionId: 'sess_za' });
  const resZa = await POST(reqZa);
  const textZa = await resZa.text();
  assert.ok(textZa.startsWith('END '));
  assert.match(textZa, /Capitec: \*120\*3279#/);
  assert.match(textZa, /FNB: \*120\*321#/);
});

test('USSD Gateway: Option 4 delivers multilingual vernacular advice', async () => {
  const req = createMockRequest({ text: '4', phoneNumber: '+2348000000000', sessionId: 'sess_04' });
  const res = await POST(req);
  const text = await res.text();

  assert.ok(text.startsWith('END '));
  assert.match(text, /Pidgin/i);
  assert.match(text, /Hausa/i);
  assert.match(text, /Yoruba/i);
  assert.match(text, /Igbo/i);
});
