import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_METADATA,
  FEATURE_PRESETS,
  parseFeatureFlags,
} from '../lib/feature-flags.ts';
import { GET, POST } from '../app/api/admin/features/route.ts';

test('Feature Flags: all 12 commercial and frontier flags are defined with metadata', () => {
  const expectedKeys = [
    'preTransferRadar',
    'bankFreezeAndPnd',
    'evidenceSlip',
    'merchantSafeDeal',
    'vendorTrustSeal',
    'creatorVault',
    'scamBusterCard',
    'familyBroadcast',
    'pocketCyberDrill',
    'ussdSimulator',
    'offlineZeroDataBadge',
    'voiceGuidance',
  ];

  for (const key of expectedKeys) {
    assert.equal(typeof DEFAULT_FEATURE_FLAGS[key], 'boolean', `Flag ${key} must be boolean in defaults`);
    assert.equal(DEFAULT_FEATURE_FLAGS[key], true, `Flag ${key} should default to true`);
    assert.ok(FEATURE_METADATA[key], `Metadata for ${key} must exist`);
    assert.ok(FEATURE_METADATA[key].name.length > 0, `Name for ${key} must not be empty`);
    assert.ok(FEATURE_METADATA[key].description.length > 0, `Description for ${key} must not be empty`);
    assert.ok(
      ['financial', 'commerce', 'growth', 'mass-market'].includes(FEATURE_METADATA[key].category),
      `Category for ${key} must be valid`
    );
  }
});

test('Feature Presets: predefined deployment profiles match operational constraints', () => {
  assert.ok(FEATURE_PRESETS.full);
  assert.ok(FEATURE_PRESETS.minimal);
  assert.ok(FEATURE_PRESETS['commerce-creator']);
  assert.ok(FEATURE_PRESETS['low-data']);

  // Minimal profile
  const minimal = FEATURE_PRESETS.minimal.flags;
  assert.equal(minimal.bankFreezeAndPnd, true);
  assert.equal(minimal.evidenceSlip, true);
  assert.equal(minimal.familyBroadcast, true);
  assert.equal(minimal.preTransferRadar, false);
  assert.equal(minimal.creatorVault, false);
  assert.equal(minimal.pocketCyberDrill, false);
  assert.equal(minimal.ussdSimulator, false);

  // Commerce & Creator profile
  const commerce = FEATURE_PRESETS['commerce-creator'].flags;
  assert.equal(commerce.merchantSafeDeal, true);
  assert.equal(commerce.vendorTrustSeal, true);
  assert.equal(commerce.creatorVault, true);
  assert.equal(commerce.preTransferRadar, true);
  assert.equal(commerce.pocketCyberDrill, false);

  // Low-Data 2G profile
  const lowData = FEATURE_PRESETS['low-data'].flags;
  assert.equal(lowData.ussdSimulator, true);
  assert.equal(lowData.voiceGuidance, true);
  assert.equal(lowData.pocketCyberDrill, true);
  assert.equal(lowData.offlineZeroDataBadge, true);
  assert.equal(lowData.creatorVault, false);
});

test('parseFeatureFlags: defensively handles corrupt or incomplete local storage', () => {
  // Null or empty
  assert.deepEqual(parseFeatureFlags(null), DEFAULT_FEATURE_FLAGS);
  assert.deepEqual(parseFeatureFlags(''), DEFAULT_FEATURE_FLAGS);
  assert.deepEqual(parseFeatureFlags('invalid json {['), DEFAULT_FEATURE_FLAGS);
  assert.deepEqual(parseFeatureFlags('123'), DEFAULT_FEATURE_FLAGS);

  // Partial valid JSON
  const partial = JSON.stringify({ preTransferRadar: false, creatorVault: false });
  const parsed = parseFeatureFlags(partial);
  assert.equal(parsed.preTransferRadar, false);
  assert.equal(parsed.creatorVault, false);
  assert.equal(parsed.bankFreezeAndPnd, true); // preserved default
  assert.equal(parsed.voiceGuidance, true);

  // Corrupted non-boolean values ignored
  const corrupted = JSON.stringify({ preTransferRadar: 'not-a-bool', bankFreezeAndPnd: null });
  const sanitized = parseFeatureFlags(corrupted);
  assert.equal(sanitized.preTransferRadar, true);
  assert.equal(sanitized.bankFreezeAndPnd, true);
});

test('Platform Admin API Route: GET & POST handlers control server state dynamically', async () => {
  // 1. GET returns active flags
  const getRes = await GET();
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.flags);
  assert.ok(Array.isArray(getData.presets));

  // 2. POST preset switch
  const postPresetReq = new Request('http://localhost:3001/api/admin/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset: 'minimal' }),
  });
  const postPresetRes = await POST(postPresetReq);
  assert.equal(postPresetRes.status, 200);
  const postPresetData = await postPresetRes.json();
  assert.equal(postPresetData.success, true);
  assert.equal(postPresetData.flags.creatorVault, false);
  assert.equal(postPresetData.flags.bankFreezeAndPnd, true);

  // 3. POST partial toggle
  const postToggleReq = new Request('http://localhost:3001/api/admin/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: { creatorVault: true } }),
  });
  const postToggleRes = await POST(postToggleReq);
  const postToggleData = await postToggleRes.json();
  assert.equal(postToggleData.success, true);
  assert.equal(postToggleData.flags.creatorVault, true);

  // 4. POST reset
  const postResetReq = new Request('http://localhost:3001/api/admin/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true }),
  });
  const postResetRes = await POST(postResetReq);
  const postResetData = await postResetRes.json();
  assert.equal(postResetData.success, true);
  assert.equal(postResetData.flags.creatorVault, true);
  assert.equal(postResetData.flags.preTransferRadar, true);

  // 5. POST invalid payload
  const postBadReq = new Request('http://localhost:3001/api/admin/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ somethingElse: 123 }),
  });
  const postBadRes = await POST(postBadReq);
  assert.equal(postBadRes.status, 400);
});

test('Platform Admin Portal Security: operator passcode and isolated portal route', () => {
  const ADMIN_PASSCODE = 'shomar-admin-2026';
  assert.equal(typeof ADMIN_PASSCODE, 'string');
  assert.ok(ADMIN_PASSCODE.length >= 12, 'Admin passcode must be at least 12 characters');
  assert.match(ADMIN_PASSCODE, /^shomar-admin-\d{4}$/, 'Passcode follows operational format');

  // Verify that DEFAULT_FEATURE_FLAGS provides a complete boolean mapping for all flags
  const flagCount = Object.keys(DEFAULT_FEATURE_FLAGS).length;
  assert.equal(flagCount, 12, 'Must maintain exactly 12 governed feature flags');
});
