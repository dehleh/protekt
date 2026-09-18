import test from 'node:test';
import assert from 'node:assert/strict';
import { getBanksByCountry, SUPPORTED_COUNTRIES } from '../lib/ussd-directory.ts';
import { assess } from '../lib/scam-engine.ts';
import { verifyVendor, KNOWN_TRUSTED_VENDORS } from '../lib/vendor-trust.ts';
import {
  BloomFilter,
  checkThreatLedger,
  mergeLedgerDelta,
  exportLedgerDelta,
  blindReport,
} from '../lib/threat-ledger.ts';

test('Pillar 1: Pan-African directory includes valid dialers for KE, GH, and ZA', () => {
  assert.equal(SUPPORTED_COUNTRIES.length, 4);

  const keBanks = getBanksByCountry('KE');
  assert.ok(keBanks.length >= 4, 'Kenya should have at least 4 institutions');
  assert.ok(keBanks.some((b) => b.id === 'safaricom-mpesa'));
  assert.ok(keBanks.some((b) => b.id === 'equity-ke'));
  assert.ok(keBanks.some((b) => b.id === 'kcb-ke'));

  const ghBanks = getBanksByCountry('GH');
  assert.ok(ghBanks.length >= 3, 'Ghana should have at least 3 institutions');
  assert.ok(ghBanks.some((b) => b.id === 'mtn-momo-gh'));
  assert.ok(ghBanks.some((b) => b.id === 'telecel-cash-gh'));

  const zaBanks = getBanksByCountry('ZA');
  assert.ok(zaBanks.length >= 4, 'South Africa should have at least 4 institutions');
  assert.ok(zaBanks.some((b) => b.id === 'capitec-za'));
  assert.ok(zaBanks.some((b) => b.id === 'fnb-za'));
});

test('Pillar 1: Scam engine flags regional financial fraud vectors across Africa', () => {
  // Kenya M-Pesa Fake Reversal
  const mpesaText = 'Confirmed. Ksh 25,000 received from Sarah Ndungu. Please reverse transaction immediately to Safaricom agent.';
  const mpesaResult = assess(mpesaText);
  assert.ok(mpesaResult.signals.some((s) => s.id === 'mpesa-fake-sms'));

  // Ghana MoMo PIN Theft
  const momoText = 'Urgent MTN MoMo system upgrade. Enter your mobile money pin to authorize agent verification cashout.';
  const momoResult = assess(momoText);
  assert.ok(momoResult.signals.some((s) => s.id === 'momo-pin-theft'));

  // South Africa Fake EFT POP
  const eftText = 'Here is your Capitec proof of payment POP. Driver is outside, please release the goods now.';
  const eftResult = assess(eftText);
  assert.ok(eftResult.signals.some((s) => s.id === 'eft-fake-proof'));
});

test('Pillar 4: SHOMAR Trust Seal validates registered African social vendors', () => {
  // Test Nigeria vendor
  const ngVendor = verifyVendor('@gadgetshub_ng');
  assert.ok(ngVendor !== null);
  assert.equal(ngVendor.tier, 3);
  assert.match(ngVendor.regNumber, /RC-1849204/);
  assert.equal(ngVendor.escrowSupported, true);

  // Test Kenya vendor without @ symbol
  const keVendor = verifyVendor('nairobiluxury');
  assert.ok(keVendor !== null);
  assert.equal(keVendor.country, 'KE');
  assert.match(keVendor.regNumber, /KRA/);

  // Test Ghana vendor
  const ghVendor = verifyVendor('@accrafashion');
  assert.ok(ghVendor !== null);
  assert.equal(ghVendor.country, 'GH');

  // Test South Africa vendor
  const zaVendor = verifyVendor('joburgtech');
  assert.ok(zaVendor !== null);
  assert.equal(zaVendor.country, 'ZA');
  assert.match(zaVendor.regNumber, /CIPC/);

  // Test unknown ghost vendor returns null
  const ghostVendor = verifyVendor('@random_fake_scammer_shop_999');
  assert.equal(ghostVendor, null);
});

test('Pillar 5: Threat Ledger Micro-Delta bitset export and bitwise OR sync (< 10 KB)', () => {
  const exportData = exportLedgerDelta();
  assert.ok(exportData.sizeBytes < 10240, `Export size ${exportData.sizeBytes} bytes must be < 10 KB`);
  assert.ok(exportData.deltaBase64.length > 100);

  // Create an external delta filter with a new threat
  const externalDelta = new BloomFilter(2048, 4);
  const newThreat = '254799988877';
  externalDelta.add(newThreat);

  // Pre-condition: candidate is not yet in ledger
  // Merge the delta
  const mergeResult = mergeLedgerDelta(externalDelta.exportBase64());
  assert.equal(mergeResult.success, true);

  // Post-condition: ledger now matches the threat via bitwise OR union
  const match = checkThreatLedger(newThreat);
  assert.ok(match !== null);
  assert.equal(match.flagged, true);
});

test('Pillar 5: Zero-Knowledge blinded threat reporting produces irreversible tokens', () => {
  const report = blindReport('08123456789', 'account');
  assert.equal(report.type, 'account');
  assert.match(report.blindedToken, /^blnd_[a-f0-9]{8}$/);
  assert.ok(!report.blindedToken.includes('08123456789'), 'Raw target must never leak in blinded token');
});
