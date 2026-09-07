'use client';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { Assessment, CheckMode } from '@/lib/scam-engine';

type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
type ModelDocument = Document & { modelContext?: { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> } };
export function useWebTools(actions: { check: (input: string, mode: CheckMode) => Assessment; openGuide: (id: string) => void; getProgress: () => { completed: string[]; total: number } }) {
  const current = useRef(actions); current.current = actions;
  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      { name: 'check_suspicious_content', title: 'Check a suspicious message or link', description: 'Run local pattern checks and show the result in ScamCheck. Saves only a local summary. Does not verify live websites, payments, accounts, or malware.', inputSchema: { type: 'object', properties: { content: { type: 'string', minLength: 1, maxLength: 12000 }, mode: { type: 'string', enum: ['message', 'link'] } }, required: ['content', 'mode'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute(input) { if (!input || typeof input !== 'object' || !('content' in input) || typeof input.content !== 'string' || !('mode' in input) || !['message', 'link'].includes(String(input.mode)) || Object.keys(input).some(k => !['content', 'mode'].includes(k))) throw new Error('Provide content and mode: message or link.'); let result: Assessment | undefined; flushSync(() => { result = current.current.check(input.content as string, input.mode as CheckMode); }); return result; } },
      { name: 'open_recovery_guide', title: 'Open a Cyber SOS guide', description: 'Open the chosen self-guided recovery flow. This does not complete recovery, contact support, or change an external account.', inputSchema: { type: 'object', properties: { guide: { type: 'string', enum: ['whatsapp', 'email', 'payment', 'phone'] } }, required: ['guide'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { if (!input || typeof input !== 'object' || !('guide' in input) || typeof input.guide !== 'string' || !['whatsapp', 'email', 'payment', 'phone'].includes(input.guide) || Object.keys(input).length !== 1) throw new Error('Choose whatsapp, email, payment, or phone.'); flushSync(() => current.current.openGuide(input.guide as string)); return { guide: input.guide, status: 'opened' }; } },
      { name: 'get_protection_progress', title: 'Read local protection progress', description: 'Read self-reported checklist progress on this device. This is not a live account-security assessment.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute(input) { if (!input || typeof input !== 'object' || Object.keys(input).length) throw new Error('Pass an empty object.'); return current.current.getProgress(); } },
    ];
    for (const tool of tools) { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser capability; ordinary UI remains available. */ } }
    return () => lifecycle.abort();
  }, []);
}
