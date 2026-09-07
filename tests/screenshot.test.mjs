import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorker } from 'tesseract.js';
import { assess } from '../lib/scam-engine.ts';

test('local OCR extracts screenshot text that can be assessed', { timeout: 90000 }, async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const worker = await createWorker('eng', 1, { langPath: path.join(root, 'public/ocr'), cacheMethod: 'none' });
  try {
    const result = await worker.recognize(path.join(root, 'tests/fixtures/otp-message.png'));
    assert.match(result.data.text, /send your OTP/i);
    assert.equal(assess(result.data.text, 'screenshot').verdict, 'likely-scam');
  } finally { await worker.terminate(); }
});
