'use client';

import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Copy, Check, X, ShieldAlert } from 'lucide-react';

interface FamilyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName?: string;
  threatDetail?: string;
}

export function FamilyBroadcastModal({
  isOpen,
  onClose,
  bankName,
  threatDetail,
}: FamilyBroadcastModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultMessage = [
    '🚨 SECURITY ALERT FROM ME:',
    'I just detected a suspicious scam attempt and temporarily secured my bank / mobile accounts.',
    '',
    '⚠️ CRITICAL WARNING FOR FAMILY & FRIENDS:',
    'If anyone contacts you on WhatsApp, SMS, or phone asking for money, claiming I had an emergency, was arrested, or need urgent bail/treatment: DO NOT SEND ANY MONEY.',
    'It is an impersonation scam. Always call my standard phone line directly to verify.',
    '',
    '— Alert sent via SHOMAR Protect (African Digital-Trust Network)',
  ].join('\n');

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(defaultMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(defaultMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Family &amp; Circle Safety Broadcast
              </h2>
              <p className="text-xs text-neutral-400">
                1-Tap warning to stop scammers from impersonating you to your loved ones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close broadcast modal"
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informative Alert Note */}
        <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 leading-relaxed">
          <strong>Why send this?</strong> When cybercriminals target an account or attempt SIM swaps, they often immediately message parents, spouses, and children claiming you are in danger to extract emergency money. Sending this preemptive alert neutralizes the threat instantly.
        </div>

        {/* Message Preview Box */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-neutral-300">Broadcast Message Preview:</span>
            <button
              onClick={handleCopy}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied to Clipboard!' : 'Copy text'}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 whitespace-pre-line font-mono max-h-48 overflow-y-auto leading-relaxed select-all">
            {defaultMessage}
          </div>
        </div>

        {/* 1-Tap Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center no-underline shadow-lg active:scale-95 transition"
          >
            <MessageSquare size={16} />
            <span>1-Tap WhatsApp Broadcast</span>
          </a>

          <a
            href={smsUrl}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold text-center no-underline active:scale-95 transition"
          >
            <PhoneCall size={16} />
            <span>1-Tap SMS Circle Alert</span>
          </a>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4"
          >
            Done, return to protection
          </button>
        </div>
      </div>
    </div>
  );
}
