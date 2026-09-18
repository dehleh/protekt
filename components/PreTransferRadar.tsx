'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Search, X, Share2, Flag, ArrowRight, ShieldCheck } from 'lucide-react';
import { assessAccountTransfer, PreTransferScanResult } from '../lib/threat-ledger';
import { blindReport } from '../lib/threat-ledger';

interface PreTransferRadarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScamBuster?: (account: string, bank: string, modus: string) => void;
  onOpenDealModal?: () => void;
}

const COMMON_BANKS = [
  'OPay',
  'PalmPay',
  'Moniepoint',
  'Kuda Bank',
  'Access Bank',
  'GTBank',
  'Zenith Bank',
  'First Bank',
  'Safaricom M-Pesa',
  'MTN Mobile Money',
  'Capitec Bank',
];

export function PreTransferRadar({
  isOpen,
  onClose,
  onOpenScamBuster,
  onOpenDealModal,
}: PreTransferRadarProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('OPay');
  const [result, setResult] = useState<PreTransferScanResult | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [usePidgin, setUsePidgin] = useState(false);

  if (!isOpen) return null;

  const handleScan = (accountToTest?: string, bankToTest?: string) => {
    const target = accountToTest ?? accountNumber;
    const bank = bankToTest ?? selectedBank;
    if (!target.trim()) return;
    setReportSubmitted(false);
    const res = assessAccountTransfer(target, bank);
    setResult(res);
  };

  const handleQuickTest = (acc: string, bank: string) => {
    setAccountNumber(acc);
    setSelectedBank(bank);
    handleScan(acc, bank);
  };

  const handleReportAccount = () => {
    if (!result) return;
    blindReport(result.target, 'account');
    setReportSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              📡
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Pre-Transfer Scam Radar
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Offline Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Check any African bank account, MoMo, or Till number before transferring cash.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">Select Institution</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                Account Number / Till / Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0123456789 or 254700000001"
                  className="w-full py-2.5 pl-3 pr-20 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
                <button
                  onClick={() => handleScan()}
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition"
                >
                  <Search size={13} />
                  <span>Scan</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1-Tap Quick Test Chips */}
          <div className="pt-1">
            <span className="text-[10px] text-neutral-400 block mb-1.5 font-medium">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickTest('0123456789', 'Access Bank')}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 transition"
              >
                🛑 Flagged iPhone Mule (0123456789)
              </button>
              <button
                onClick={() => handleQuickTest('0800000001', 'Fintech Wallet')}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 transition"
              >
                🛑 Loan Shark Harasser (0800000001)
              </button>
              <button
                onClick={() => handleQuickTest('254700000001', 'Safaricom M-Pesa')}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 transition"
              >
                🛑 M-Pesa Fake Reversal (254700000001)
              </button>
              <button
                onClick={() => handleQuickTest('2049102941', 'OPay')}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 transition"
              >
                🟢 Clean Account (2049102941)
              </button>
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {result && (
          <div className="mt-5 space-y-3.5 animate-in fade-in duration-200">
            {/* Risk Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                result.riskLevel === 'flagged-fraud'
                  ? 'bg-red-950/50 border-red-500/60 text-red-200'
                  : result.riskLevel === 'caution'
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                  : 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {result.riskLevel === 'flagged-fraud' ? (
                    <ShieldAlert size={22} className="text-red-400 shrink-0 mt-0.5" />
                  ) : result.riskLevel === 'caution' ? (
                    <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      {result.riskLevel === 'flagged-fraud'
                        ? 'DANGER: FLAGGED IN RADAR'
                        : result.riskLevel === 'caution'
                        ? 'CAUTION: UNVERIFIED ACCOUNT'
                        : 'CLEAN: ZERO COMMUNITY FLAGS'}
                      {result.reportCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 font-mono font-bold">
                          {result.reportCount} Reports
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {result.target} ({result.bankName})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setUsePidgin(!usePidgin)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition shrink-0"
                >
                  {usePidgin ? '🇳🇬 English' : '🇳🇬 Pidgin'}
                </button>
              </div>

              {result.lastReportedModus && (
                <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-red-900/50 text-xs text-red-200">
                  <span className="font-bold text-red-300">Reported Modus:</span> {result.lastReportedModus}
                </div>
              )}

              <p className="text-xs mt-3 leading-relaxed">
                {usePidgin ? result.recommendationPidgin : result.recommendation}
              </p>
            </div>

            {/* Safety Tips Checklist */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              <span className="font-bold text-neutral-300 block mb-1.5">Safety Checklist Before Sending Money:</span>
              <ul className="space-y-1 text-[11px] text-neutral-400">
                {result.safetyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1-Tap Action Tray */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {result.riskLevel === 'flagged-fraud' && onOpenScamBuster && (
                <button
                  onClick={() => {
                    onOpenScamBuster(result.target, result.bankName, result.lastReportedModus || 'Scam Account');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950 transition active:scale-98"
                >
                  <Share2 size={14} />
                  <span>Share Scam Buster Card</span>
                </button>
              )}

              <button
                onClick={handleReportAccount}
                disabled={reportSubmitted}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                <Flag size={14} className={reportSubmitted ? 'text-emerald-400' : 'text-amber-400'} />
                <span>{reportSubmitted ? '✓ Reported to Ledger' : 'Flag Account (Blinded)'}</span>
              </button>

              {onOpenDealModal && (
                <button
                  onClick={() => {
                    onOpenDealModal();
                    onClose();
                  }}
                  className="sm:col-span-2 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center justify-center gap-1.5 border border-neutral-800 transition"
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Buying from a social vendor? Use SHOMAR Escrow Deal Link</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
