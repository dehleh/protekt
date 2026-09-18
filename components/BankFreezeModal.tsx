'use client';

import React, { useState } from 'react';
import { X, PhoneCall, Mail, Printer, Copy, Check, ShieldAlert, FileText, AlertTriangle } from 'lucide-react';
import { BANK_PANIC_DIRECTORY, BankPanicEntry, generatePndDisputeLetter } from '../lib/ussd-directory';

interface BankFreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  country?: 'NG' | 'KE' | 'GH' | 'ZA';
  initialScammerAccount?: string;
  initialScammerBank?: string;
}

export function BankFreezeModal({
  isOpen,
  onClose,
  country = 'NG',
  initialScammerAccount = '',
  initialScammerBank = '',
}: BankFreezeModalProps) {
  const [activeTab, setActiveTab] = useState<'freeze' | 'pnd'>('freeze');
  const [selectedBankId, setSelectedBankId] = useState<string>('access');
  const [copied, setCopied] = useState(false);

  // PND Letter form state
  const [victimName, setVictimName] = useState('');
  const [victimBank, setVictimBank] = useState('Access Bank');
  const [victimAccount, setVictimAccount] = useState('');
  const [scammerBank, setScammerBank] = useState(initialScammerBank || 'OPay');
  const [scammerAccount, setScammerAccount] = useState(initialScammerAccount);
  const [disputedAmount, setDisputedAmount] = useState('');
  const [currency, setCurrency] = useState(country === 'KE' ? 'KES' : country === 'GH' ? 'GHS' : country === 'ZA' ? 'ZAR' : 'NGN');
  const [txRef, setTxRef] = useState('');
  const [narrative, setNarrative] = useState('');

  if (!isOpen) return null;

  const countryBanks = BANK_PANIC_DIRECTORY.filter((b) => (b.country || 'NG') === country);
  const selectedBank = countryBanks.find((b) => b.id === selectedBankId) || countryBanks[0] || BANK_PANIC_DIRECTORY[0];

  const scammerBankEntry = BANK_PANIC_DIRECTORY.find((b) => b.name.toLowerCase().includes(scammerBank.toLowerCase()) || b.shortName.toLowerCase().includes(scammerBank.toLowerCase()));
  const targetFraudEmail = scammerBankEntry?.fraudEmail || 'frauddesk@cbn.gov.ng';

  const letterText = generatePndDisputeLetter({
    victimName: victimName || '[Victim Account Holder Name]',
    victimBank,
    victimAccount: victimAccount || '[Victim Account Number]',
    scammerBank,
    scammerAccount: scammerAccount || '[Beneficiary Account Number]',
    amount: disputedAmount || '0.00',
    currency,
    transactionReference: txRef || '[Bank Session / Reference ID]',
    incidentTimestamp: new Date().toISOString(),
    narrative: narrative || 'Funds transferred under false fraudulent representations / fake proof of payment. Immediate beneficiary restriction requested before cashout.',
  });

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`URGENT FRAUD RECALL & PND DEMAND - ACCT: ${scammerAccount}`);
    const body = encodeURIComponent(letterText);
    window.open(`mailto:${targetFraudEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold">
              🚨
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                15-Minute Emergency Bank Freeze & Recall
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-bold">
                  Golden Hour Protocol
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Freeze your own account in 60 seconds, or demand an immediate Post-No-Debit (PND) on the scammer’s wallet.
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

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4 p-1 rounded-2xl bg-neutral-950 border border-neutral-800">
          <button
            onClick={() => setActiveTab('freeze')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'freeze' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PhoneCall size={14} />
            <span>1. Freeze My Bank Account</span>
          </button>
          <button
            onClick={() => setActiveTab('pnd')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pnd' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText size={14} />
            <span>2. Scammer Post-No-Debit (PND) Notice</span>
          </button>
        </div>

        {/* TAB 1: 1-Tap Bank USSD Freeze */}
        {activeTab === 'freeze' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Select Your Bank / Wallet to Freeze:
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-red-500 font-medium"
              >
                {countryBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.ussdCode || b.phoneHotline})
                  </option>
                ))}
              </select>
            </div>

            {selectedBank && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-100">{selectedBank.name}</span>
                  {selectedBank.ussdCode && (
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {selectedBank.ussdCode}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{selectedBank.instructions}</p>

                <div className="pt-2 flex flex-wrap gap-2">
                  {selectedBank.dialUri && (
                    <a
                      href={selectedBank.dialUri}
                      className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition active:scale-98"
                    >
                      <PhoneCall size={15} />
                      <span>1-Tap Dial {selectedBank.ussdCode || selectedBank.phoneHotline}</span>
                    </a>
                  )}

                  {selectedBank.phoneHotline && (
                    <a
                      href={`tel:${selectedBank.phoneHotline}`}
                      className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
                    >
                      <span>Direct Fraud Hotline</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Why Speed Matters:</strong> You have roughly 15 minutes before cyber-fraudsters transfer stolen funds across multiple digital wallets or withdraw at a POS. Dial immediately.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: PND Dispute Notice */}
        {activeTab === 'pnd' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              If money has already left your account, dispatch this formal <strong>Post-No-Debit (PND)</strong> notice directly to the recipient bank’s fraud desk. Financial regulations mandate banks to freeze beneficiary wallets upon formal notification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  placeholder="e.g. Chukwuma Obi"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Your Originating Bank & Acct</label>
                <input
                  type="text"
                  value={victimAccount}
                  onChange={(e) => setVictimAccount(e.target.value)}
                  placeholder="e.g. 0123456789 (GTBank)"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Beneficiary Scammer Account</label>
                <input
                  type="text"
                  value={scammerAccount}
                  onChange={(e) => setScammerAccount(e.target.value)}
                  placeholder="e.g. 0987654321"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 font-mono text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Beneficiary Bank / Wallet</label>
                <input
                  type="text"
                  value={scammerBank}
                  onChange={(e) => setScammerBank(e.target.value)}
                  placeholder="e.g. OPay / Moniepoint / Access"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Disputed Amount ({currency})</label>
                <input
                  type="text"
                  value={disputedAmount}
                  onChange={(e) => setDisputedAmount(e.target.value)}
                  placeholder="e.g. 75,000"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Bank Transaction Reference / Session ID</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. 10000424091812903"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 font-mono text-neutral-100"
                />
              </div>
            </div>

            {/* Formatted Legal Notice Preview */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-semibold text-neutral-300">Official Formal Legal Notice Preview:</span>
                <span className="text-[11px] font-mono text-amber-400">Target: {targetFraudEmail}</span>
              </div>
              <textarea
                readOnly
                value={letterText}
                rows={7}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-300 leading-relaxed resize-none"
              />
            </div>

            {/* Action Tray */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleSendEmail}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition active:scale-98"
              >
                <Mail size={15} />
                <span>Dispatch Email to {scammerBank} Fraud Desk</span>
              </button>

              <button
                onClick={handleCopyLetter}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Notice'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                <Printer size={14} />
                <span>Print Legal Copy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
