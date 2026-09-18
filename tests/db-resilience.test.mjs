import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isDbActive,
  getStoredFeatureFlags,
  saveStoredFeatureFlags,
  insertThreatReport,
  getThreatReports,
  getStoredVendor,
} from '../lib/db.ts';

test('DB Resilience - In-memory fallback functions without DATABASE_URL', async () => {
  // Should not throw or crash when no DB connection is present
  assert.strictEqual(typeof isDbActive(), 'boolean');

  // Feature flags return defaults
  const flags = await getStoredFeatureFlags();
  assert.ok(flags, 'Flags should be returned');
  assert.strictEqual(typeof flags.preTransferRadar, 'boolean');
  assert.strictEqual(flags.preTransferRadar, true);

  // Updating feature flags persists in memory
  const saved = await saveStoredFeatureFlags({
    ...flags,
    preTransferRadar: true,
  });
  // Without real Postgres, saveStoredFeatureFlags returns boolean cleanly
  assert.strictEqual(typeof saved, 'boolean');

  const updatedFlags = await getStoredFeatureFlags();
  assert.strictEqual(updatedFlags.preTransferRadar, true);
});

test('DB Resilience - Threat report insertion and retrieval with fallback', async () => {
  const token = `blnd_${Date.now().toString(16)}`;
  const result = await insertThreatReport('account', token, 'Nigeria');

  assert.ok(result.id > 0, 'Report ID should be positive integer');
  assert.strictEqual(typeof result.persisted, 'boolean');

  const reports = await getThreatReports(10);
  assert.ok(reports.totalCount >= 1, 'Total count should reflect inserted report');
  assert.ok(Array.isArray(reports.reports), 'Reports should be an array');
  const found = reports.reports.find((r) => r.blinded_token === token);
  assert.ok(found, 'Inserted token should be retrieved');
});

test('DB Resilience - Verified vendor retrieval with fallback', async () => {
  const vendor = await getStoredVendor('gadgetshub_ng');
  assert.ok(vendor, 'Vendor gadgetshub_ng should be found');
  assert.strictEqual(vendor.businessName, 'Gadgets Hub Technologies Ltd');
  assert.strictEqual(vendor.trustScore, 98);

  const unknown = await getStoredVendor('non_existent_merchant_xyz');
  assert.strictEqual(unknown, null);
});
