import { mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'ocr');
await mkdir(output, { recursive: true });
await copyFile(path.join(root, 'node_modules/tesseract.js/dist/worker.min.js'), path.join(output, 'worker.min.js'));
const core = path.join(root, 'node_modules/tesseract.js-core');
for (const file of await readdir(core)) {
  if (/^tesseract-core.*\.wasm(?:\.js)?$/.test(file)) await copyFile(path.join(core, file), path.join(output, file));
}
const data = path.join(root, 'node_modules/@tesseract.js-data/eng');
const language = path.join(data, '4.0.0_best_int/eng.traineddata.gz');
await copyFile(language, path.join(output, 'eng.traineddata.gz'));
console.log('Prepared local screenshot text reader assets.');
