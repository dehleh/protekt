'use client';
import { useEffect, useRef, useState } from 'react';
import { FileImage, LoaderCircle, Upload, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Worker as OCRWorker } from 'tesseract.js';

export function ImageInput({ onText, onBusy }: { onText: (text: string) => void; onBusy: (busy: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<OCRWorker | null>(null);
  const runRef = useRef(0);
  const [preview, setPreview] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { runRef.current++; void workerRef.current?.terminate(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function cancel() { runRef.current++; void workerRef.current?.terminate(); workerRef.current = null; setBusy(false); onBusy(false); setStatus(''); }
  async function readImage(file?: File) {
    if (!file) return;
    cancel(); setError(''); onText('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Choose a PNG, JPG, or WebP screenshot.'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('Choose an image smaller than 6 MB.'); return; }
    const run = ++runRef.current;
    setPreview(URL.createObjectURL(file)); setName(file.name); setBusy(true); onBusy(true); setProgress(0); setStatus('Preparing text reader…');
    let worker: OCRWorker | null = null;
    let expired = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 24_000_000) { bitmap.close(); throw new Error('This image is too large. Crop it to the message and try again.'); }
      const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) { bitmap.close(); throw new Error('The image could not be opened. Paste its text below instead.'); }
      context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const { createWorker } = await import('tesseract.js');
      if (run !== runRef.current) return;
      const work = async () => {
        worker = await createWorker('eng', 1, { workerPath: '/ocr/worker.min.js', corePath: '/ocr', langPath: '/ocr', workerBlobURL: false, logger: m => { if (expired || run !== runRef.current) return; if (m.status === 'recognizing text') { setStatus('Reading the screenshot…'); setProgress(Math.round(m.progress * 100)); } else setStatus('Loading the text reader…'); } });
        if (expired || run !== runRef.current) { await worker.terminate(); return null; }
        workerRef.current = worker;
        return worker.recognize(canvas);
      };
      const result = await Promise.race([work(), new Promise<never>((_, reject) => { timeout = setTimeout(() => { expired = true; reject(new Error('Text reading took too long. Try a smaller image, or paste the text below.')); }, 90000); })]);
      if (run !== runRef.current || !result) return;
      const text = result.data.text.trim();
      if (text.length < 5) throw new Error('We couldn’t read enough text. Try a clearer crop, or paste the text below.');
      onText(text.slice(0, 12000)); setStatus(text.length > 12000 ? 'First 12,000 characters extracted. Review and shorten the text before checking.' : 'Text extracted. Review and correct it before checking.'); setProgress(100);
    } catch (e) { if (run === runRef.current) setError(e instanceof Error && !/fetch|network|worker/i.test(e.message) ? e.message : 'The text reader couldn’t load. Try again, or paste the screenshot text below.'); }
    finally { if (timeout) clearTimeout(timeout); const active = worker as OCRWorker | null; if (active) await active.terminate().catch(() => {}); if (run === runRef.current) { workerRef.current = null; setBusy(false); onBusy(false); } }
  }
  return <div className="image-input"><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" ref={inputRef} onChange={event => { void readImage(event.target.files?.[0]); event.target.value = ''; }}/>{!preview ? <button className="upload-zone" onClick={() => inputRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void readImage(event.dataTransfer.files[0]); }}><span className="icon-tile blue"><Upload size={23}/></span><strong>Choose a screenshot</strong><span>or drop it here · PNG, JPG, WebP · up to 6 MB</span><small>English text is read on your device. Images are not uploaded.</small></button> : <div className="image-preview"><img src={preview} alt="Your screenshot, ready for text extraction"/><div><FileImage size={18}/><strong>{name}</strong><button className="text-button" onClick={() => inputRef.current?.click()}>Choose another</button></div><button className="icon-button" aria-label="Remove screenshot" onClick={() => { cancel(); setPreview(''); setName(''); setError(''); onText(''); }}><X size={17}/></button></div>}{status && <div className="ocr-status" role="status">{busy && <LoaderCircle size={15} className="spin"/>}<span>{status}</span>{busy && <button className="text-button" onClick={cancel}>Cancel</button>}</div>}{busy && <Progress value={progress} aria-label="Screenshot text extraction progress"/>}{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
