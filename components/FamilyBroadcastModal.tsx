'use client';

import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Copy, Check, X, ShieldAlert, Users, Plus, Trash2 } from 'lucide-react';

interface FamilyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName?: string;
  threatDetail?: string;
}

type ThreatScenario = 'impersonation' | 'fake-alert' | 'whatsapp-hack' | 'loan-scam';

const SCENARIOS: { id: ThreatScenario; label: string; icon: string; message: string }[] = [
  {
    id: 'impersonation',
    label: 'Impersonation / Kidnap Scam',
    icon: '🚨',
    message: [
      '🚨 SECURITY ALERT FROM ME:',
      'I just detected a suspicious scam attempt and secured my accounts.',
      '',
      '⚠️ CRITICAL WARNING FOR FAMILY & FRIENDS:',
      'If anyone contacts you on WhatsApp, SMS, or phone claiming I had an accident, emergency, was arrested, or need bail money: DO NOT SEND ANY MONEY.',
      'It is an impersonation scam. Always call my verified standard mobile line directly before doing anything.',
      '',
      '— Stay safe with SHOMAR Protect (100% Free & Offline): https://shomar.protect',
    ].join('\n'),
  },
  {
    id: 'fake-alert',
    label: 'Fake Bank Credit Alert',
    icon: '💳',
    message: [
      '⚠️ FAMILY FINANCIAL WARNING:',
      'Someone just sent me a fake bank credit alert trying to collect goods or claim a "mistaken refund".',
      '',
      '🛑 DO NOT send money back to anyone claiming they overpaid you by mistake. Always check your actual balance inside your bank app or via official USSD dialer before believing any SMS.',
      '',
      '— Verify alerts with SHOMAR Protect: https://shomar.protect',
    ].join('\n'),
  },
  {
    id: 'whatsapp-hack',
    label: 'WhatsApp Takeover Attempt',
    icon: '📱',
    message: [
      '⚠️ WHATSAPP SECURITY ALERT:',
      'A scammer is attempting to hijack WhatsApp accounts in our circle by asking for 6-digit registration codes or voice notes.',
      '',
      '🔒 NEVER share any SMS code or WhatsApp 6-digit PIN with anyone, even if the message appears to come from a friend or church/school group admin.',
      'If my account goes silent or leaves groups, call my GSM voice line immediately.',
      '',
      '— Protected by SHOMAR Protect: https://shomar.protect',
    ].join('\n'),
  },
  {
    id: 'loan-scam',
    label: 'Fake Loan App Blackmail',
    icon: '💸',
    message: [
      '⚠️ DEFAMATION / LOAN SCAM NOTICE:',
      'Illegal predatory loan apps are harvesting contact lists and sending fake defamatory messages claiming people took loans.',
      '',
      '❌ If you receive any message claiming I or anyone in our family owes money to an unlicensed loan app, ignore and block them immediately. Do not pay any extortion.',
      '',
      '— Shared via SHOMAR Protect: https://shomar.protect',
    ].join('\n'),
  },
];

export function FamilyBroadcastModal({
  isOpen,
  onClose,
  bankName,
  threatDetail,
}: FamilyBroadcastModalProps) {
  const [copied, setCopied] = useState(false);
  const [scenario, setScenario] = useState<ThreatScenario>('impersonation');
  const [circleMembers, setCircleMembers] = useState<{ name: string; relation: string }[]>([
    { name: 'Mom & Dad', relation: 'Parents' },
    { name: 'Family WhatsApp Group', relation: 'Family Circle' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');

  if (!isOpen) return null;

  const currentMessage = SCENARIOS.find((s) => s.id === scenario)?.message || SCENARIOS[0].message;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentMessage)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(currentMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setCircleMembers((prev) => [
      ...prev,
      { name: newMemberName.trim(), relation: newMemberRelation.trim() || 'Family' },
    ]);
    setNewMemberName('');
    setNewMemberRelation('');
  };

  const handleRemoveMember = (idx: number) => {
    setCircleMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
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
                1-Tap warning to shield parents, children, and close contacts from fraud
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

        {/* Scenario Selector */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-neutral-300 block mb-2">
            Select Threat Scenario to Broadcast:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 ${
                  scenario === s.id
                    ? 'bg-red-500/20 border-red-500 text-white font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
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
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 whitespace-pre-line font-mono max-h-40 overflow-y-auto leading-relaxed select-all">
            {currentMessage}
          </div>
        </div>

        {/* 1-Tap Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center no-underline shadow-lg active:scale-95 transition"
          >
            <MessageSquare size={16} />
            <span>1-Tap WhatsApp Family Broadcast</span>
          </a>

          <a
            href={smsUrl}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold text-center no-underline active:scale-95 transition"
          >
            <PhoneCall size={16} />
            <span>1-Tap SMS Circle Alert</span>
          </a>
        </div>

        {/* Protected Family Circle Roster */}
        <div className="mt-5 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Users size={14} className="text-emerald-400" />
              Your Protected Circle ({circleMembers.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {circleMembers.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300"
              >
                <span className="font-semibold text-white">{m.name}</span>
                <span className="text-neutral-500 font-mono">({m.relation})</span>
                <button
                  onClick={() => handleRemoveMember(idx)}
                  className="text-neutral-500 hover:text-red-400 ml-1"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Add contact or group name..."
              className="flex-1 p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={newMemberRelation}
              onChange={(e) => setNewMemberRelation(e.target.value)}
              placeholder="e.g. Sister, Mom"
              style={{ width: '110px' }}
              className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddMember}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
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
