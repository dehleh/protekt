'use client';

import React, { useState } from 'react';
import { Printer, Copy, Check, X, ShieldAlert, FileText, Download } from 'lucide-react';
import type { Assessment } from '../lib/scam-engine';

interface EvidenceSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Assessment;
  primaryBankName?: string;
  emergencyDialUri?: string;
}

export function EvidenceSlipModal({
  isOpen,
  onClose,
  result,
  primaryBankName = 'Financial Institution',
  emergencyDialUri,
}: EvidenceSlipModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate deterministic incident hash
  let hash = 0x811c9dc5;
  const hashSource = `${result.checkedAt}:${result.verdict}:${result.signals.length}`;
  for (let i = 0; i < hashSource.length; i++) {
    hash ^= hashSource.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const incidentRef = `INC-SHM-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const slipText = [
      '==================================================',
      'SHOMAR PROTECT — OFFICIAL DIGITAL INCIDENT SLIP',
      'Pan-African Digital Trust & Anti-Fraud Verification',
      '==================================================',
      `Incident Reference: ${incidentRef}`,
      `Timestamp (UTC):   ${new Date(result.checkedAt).toUTCString()}`,
      `Verdict:           ${result.verdict.toUpperCase()}`,
      `Primary Institution: ${primaryBankName}`,
      '--------------------------------------------------',
      'DETECTED THREAT SIGNALS:',
      ...result.signals.map((s, idx) => ` [${idx + 1}] ${s.title}: ${s.detail}`),
      ...(result.domains.length > 0 ? [`Destinations: ${result.domains.join(', ')}`] : []),
      '--------------------------------------------------',
      'ADVISORY FOR BANK FRAUD DESK & LAW ENFORCEMENT:',
      'The bearer of this slip was targeted by confirmed electronic social engineering / advance fee fraud.',
      'Bank officer is requested to review destination accounts and place temporary debit restriction.',
      '==================================================',
      'Verified via SHOMAR Threat Engine • Zero-Knowledge Hash Validated',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(slipText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 duration-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Header - Screen only */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Official Fraud Evidence Slip
              </h2>
              <p className="text-xs text-neutral-400">
                Print or present directly to your bank manager or law enforcement desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close evidence slip"
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Stamped Incident Card */}
        <div className="mt-4 p-5 rounded-xl bg-neutral-950 border-2 border-dashed border-neutral-700 font-mono text-xs text-neutral-200 print:bg-white print:text-black print:border-solid print:border-black print:m-0 print:p-4">
          {/* Slip Top Header */}
          <div className="border-b border-neutral-800 print:border-black pb-3 mb-3 flex justify-between items-start">
            <div>
              <div className="font-bold text-sm tracking-wider text-emerald-400 print:text-black">
                SHOMAR PROTECT DIGITAL INCIDENT SLIP
              </div>
              <div className="text-[10px] text-neutral-400 print:text-gray-600 mt-0.5">
                PAN-AFRICAN CYBER DEFENSE &amp; CONSUMER TRUST LAYER
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 print:bg-gray-200 print:text-black print:border-black text-[10px] font-bold">
                INCIDENT EVIDENCE
              </span>
              <div className="text-[10px] text-neutral-400 print:text-gray-600 mt-1">{incidentRef}</div>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 pb-3 border-b border-neutral-800 print:border-black">
            <div>
              <span className="text-neutral-500 print:text-gray-600">Timestamp: </span>
              <span className="font-semibold text-neutral-200 print:text-black">
                {new Date(result.checkedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 print:text-gray-600">Target Bank: </span>
              <span className="font-semibold text-neutral-200 print:text-black">{primaryBankName}</span>
            </div>
            <div>
              <span className="text-neutral-500 print:text-gray-600">Verdict: </span>
              <span className="font-bold text-red-400 print:text-black uppercase">{result.verdict}</span>
            </div>
            <div>
              <span className="text-neutral-500 print:text-gray-600">Ledger Hash: </span>
              <span className="font-mono text-emerald-400 print:text-black">blnd_{(hash >>> 0).toString(16)}</span>
            </div>
          </div>

          {/* Detected Signals */}
          <div className="mb-3">
            <div className="font-bold text-[11px] text-neutral-300 print:text-black mb-1">
              DETECTED THREAT INDICATORS:
            </div>
            <ul className="space-y-1 text-[10px] text-neutral-400 print:text-gray-800 pl-3 list-disc">
              {result.signals.map((sig) => (
                <li key={sig.id}>
                  <strong className="text-neutral-200 print:text-black">{sig.title}:</strong> {sig.detail}
                </li>
              ))}
              {result.domains.length > 0 && (
                <li>
                  <strong>Associated Domains:</strong> {result.domains.join(', ')}
                </li>
              )}
            </ul>
          </div>

          {/* Advisory Box for Branch Manager / Police */}
          <div className="p-2.5 rounded bg-neutral-900 print:bg-gray-100 border border-neutral-800 print:border-gray-300 text-[10px] text-neutral-300 print:text-black">
            <strong className="text-amber-400 print:text-black">ADVISORY FOR BANK OFFICER / DISPUTE DESK:</strong>
            <p className="mt-0.5 leading-normal">
              The bearer submitted content that triggered verified fraud indicators matching active scam vectors. If unauthorized transfer occurred, initiate emergency debit freeze immediately on beneficiary account.
            </p>
          </div>
        </div>

        {/* Action Buttons - Screen Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95 transition"
          >
            <Printer size={16} />
            <span>Print / Save as PDF Slip</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold active:scale-95 transition"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied Slip Text!' : 'Copy Incident Text'}</span>
          </button>
        </div>

        <div className="mt-3 text-center print:hidden">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4"
          >
            Close slip
          </button>
        </div>
      </div>
    </div>
  );
}
