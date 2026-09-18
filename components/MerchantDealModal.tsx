'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Share2, Sparkles, ExternalLink, BadgeCheck } from 'lucide-react';
import { generateDealLink, KNOWN_TRUSTED_VENDORS } from '../lib/vendor-trust';

interface MerchantDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MerchantDealModal({ isOpen, onClose }: MerchantDealModalProps) {
  const [handle, setHandle] = useState('gadgetshub_ng');
  const [itemName, setItemName] = useState('iPhone 13 Pro 128GB');
  const [amount, setAmount] = useState('350000');
  const [currency, setCurrency] = useState('NGN');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseInt(amount, 10) || 0;
  const deal = generateDealLink(handle || 'vendor', itemName || 'Goods', parsedAmount, currency);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deal.shareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(deal.bioSnippet);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(deal.shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
              🛍️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Merchant Safe Deal Link & Bio Seal
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Sales Multiplier
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Eliminate buyer fear. Turn hesitant &quot;Pay-on-Delivery&quot; buyers into completed payments.
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

        {/* Form Inputs */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">Your Store Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="gadgetshub_ng"
                  className="w-full py-2 pl-7 pr-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">Item Being Sold</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Nike Air Max or Laptop"
                className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">Price Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="350000"
                className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-300 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-medium"
              >
                <option value="NGN">NGN (₦ Nigerian Naira)</option>
                <option value="KES">KES (KSh Kenyan Shilling)</option>
                <option value="GHS">GHS (GH₵ Ghanaian Cedi)</option>
                <option value="ZAR">ZAR (R South African Rand)</option>
              </select>
            </div>
          </div>

          {/* Quick Pre-fill Samples */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-neutral-400 self-center">Pre-fill sample:</span>
            {KNOWN_TRUSTED_VENDORS.slice(0, 3).map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setHandle(v.handle.replace(/^@/, ''));
                  setItemName(v.category.split('&')[0].trim());
                  setCurrency(v.country === 'KE' ? 'KES' : v.country === 'GH' ? 'GHS' : v.country === 'ZA' ? 'ZAR' : 'NGN');
                }}
                className="text-[10px] py-0.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              >
                {v.handle}
              </button>
            ))}
          </div>

          {/* Generated Deal Snippet Preview */}
          <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <BadgeCheck size={16} className="text-emerald-400" />
                Verified Purchase DM Reply
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                {deal.dealCode}
              </span>
            </div>

            <pre className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-[11px] font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {deal.shareMessage}
            </pre>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition active:scale-98"
              >
                <Share2 size={14} />
                <span>Send to Buyer on WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1 border border-neutral-700 transition"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Bio Link Snippet */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-300">Instagram / TikTok Bio Trust Seal Snippet:</span>
              <button
                onClick={handleCopyBio}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
              >
                {copiedBio ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedBio ? 'Copied' : 'Copy Bio Snippet'}</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 bg-black/50 p-2.5 rounded-xl border border-neutral-800">
              {deal.bioSnippet}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
