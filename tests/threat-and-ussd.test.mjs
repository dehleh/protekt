import test from 'node:test';
import assert from 'node:assert/strict';
import { BANK_PANIC_DIRECTORY } from '../lib/ussd-directory.ts';
import { BloomFilter, checkThreatLedger, blindReport, globalThreatFilter } from '../lib/threat-ledger.ts';
import { assess } from '../lib/scam-engine.ts';

test('BANK_PANIC_DIRECTORY contains at least 16 institutions with valid dialers', () => {
  assert.ok(BANK_PANIC_DIRECTORY.length >= 16, `Expected at least 16 banks, got ${BANK_PANIC_DIRECTORY.length}`);

  const ids = new Set();
  const requiredBanks = ['access', 'gtbank', 'zenith', 'firstbank', 'uba', 'opay', 'palmpay', 'moniepoint', 'kuda'];

  for (const entry of BANK_PANIC_DIRECTORY) {
    assert.ok(entry.id, 'Bank missing id');
    assert.ok(!ids.has(entry.id), `Duplicate bank id: ${entry.id}`);
    ids.add(entry.id);

    assert.ok(entry.name.length > 0, `Bank ${entry.id} missing name`);
    assert.ok(entry.shortName.length > 0, `Bank ${entry.id} missing shortName`);
    assert.ok(entry.instructions.length > 10, `Bank ${entry.id} instructions too brief`);

    if (entry.dialUri) {
      assert.match(entry.dialUri, /^tel:(\*[0-9*#%]+|\+\d+)$/, `Invalid dialUri for ${entry.id}: ${entry.dialUri}`);
    }
    if (entry.phoneHotline) {
      assert.match(entry.phoneHotline, /^\+(?:234|254|233|27)\d+$/, `Invalid phoneHotline for ${entry.id}: ${entry.phoneHotline}`);
    }
  }

  for (const req of requiredBanks) {
    assert.ok(ids.has(req), `Missing required bank: ${req}`);
  }
});

test('BloomFilter handles insertion, lookup, and Base64 export/import', () => {
  const filter = new BloomFilter(1024, 4);
  const testItem = 'nuban:9998887776';

  assert.equal(filter.has(testItem), false);
  filter.add(testItem);
  assert.equal(filter.has(testItem), true);
  assert.equal(filter.has('nuban:1112223334'), false);

  const exported = filter.toBase64();
  assert.ok(typeof exported === 'string');
  assert.ok(exported.length > 0);

  const imported = BloomFilter.fromBase64(exported, 1024, 4);
  assert.equal(imported.has(testItem), true);
  assert.equal(imported.has('nuban:1112223334'), false);
});

test('checkThreatLedger flags pre-seeded threat indicators without false positives', () => {
  // Pre-seeded threat accounts in default filter
  const hitNuban = checkThreatLedger('Send payment to 2081234567 immediately');
  assert.ok(hitNuban);
  assert.equal(hitNuban.flagged, true);
  assert.equal(hitNuban.threatType, 'account');

  const hitPhone = checkThreatLedger('Reach scam support on 08021112233');
  assert.ok(hitPhone);
  assert.equal(hitPhone.flagged, true);
  assert.equal(hitPhone.threatType, 'phone');

  // Clean text with clean random 10-digit number
  const clean = checkThreatLedger('Normal message without scam items: 7771239845');
  assert.equal(clean, null);
});

test('blindReport generates irreversible tokens', () => {
  const report = blindReport('0123456789', 'account');
  assert.equal(report.type, 'account');
  assert.ok(report.blindedToken.startsWith('blnd_'));
  assert.ok(Date.now() - new Date(report.timestamp).getTime() < 5000);
});

test('scam-engine detects social commerce vendor fraud patterns', () => {
  const vendorBio = 'Flash sale 70% off brand new iPhones! Strictly payment before delivery, no pay on delivery accepted. DM to order now!';
  const result = assess(vendorBio, 'vendor');

  assert.ok(['likely-scam', 'suspicious'].includes(result.verdict));
  const signalIds = result.signals.map(s => s.id);
  assert.ok(signalIds.includes('vendor-delivery'), 'Missing vendor-delivery signal');
  assert.ok(signalIds.includes('vendor-no-pod'), 'Missing vendor-no-pod signal');
  assert.ok(signalIds.includes('vendor-discount'), 'Missing vendor-discount signal');
  assert.ok(result.actions.some(a => a.toLowerCase().includes('escrow') || a.toLowerCase().includes('delivery')));
});

test('scam-engine flags threat ledger match in vendor check with known scam account', () => {
  const vendorPost = 'Transfer to 2081234567 to buy this laptop. DM for fast shipping!';
  const result = assess(vendorPost, 'vendor');

  assert.equal(result.verdict, 'likely-scam');
  const signalIds = result.signals.map(s => s.id);
  assert.ok(signalIds.includes('threat-ledger-match'), 'Missing threat-ledger-match signal');
});
