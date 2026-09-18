'use client';

import React, { useRef, useState } from 'react';
import { X, Share2, Copy, Download, Check, ShieldAlert } from 'lucide-react';

interface ScamBusterCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: string;
  bankName: string;
  modus: string;
}

export function ScamBusterCardModal({
  isOpen,
  onClose,
  account,
  bankName,
  modus,
}: ScamBusterCardModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const targetAccount = account || '0123456789';
  const targetBank = bankName || 'Access Bank';
  const targetModus = modus || 'Fake Bank Receipt & Marketplace Advance Fee';
  const timestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const shareText = [
    `🚨 SCAMMER ALERT (VERIFIED BY SHOMAR PROTECT)`,
    `⚠️ ACCOUNT: ${targetAccount} (${targetBank})`,
    `MODUS: ${targetModus}`,
    `DO NOT TRANSFER MONEY TO THIS ACCOUNT.`,
    ``,
    `Always verify bank accounts and social vendors free on: https://protect.shomar.africa`,
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background: Dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.5, '#140505');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Red Glow
    const radial = ctx.createRadialGradient(540, 400, 50, 540, 400, 600);
    radial.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    radial.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1000);

    // Top Brand Pill
    ctx.fillStyle = '#ef4444';
    ctx.roundRect(140, 120, 800, 90, 45);
    ctx.fill();

    ctx.font = 'bold 38px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 SHOMAR COMMUNITY FRAUD RADAR', 540, 178);

    // Main Alert Headline
    ctx.font = '900 68px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCAMMER ALERT', 540, 360);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('VERIFIED ON SHOMAR THREAT LEDGER', 540, 425);

    // Center Details Box
    ctx.fillStyle = '#1c1917';
    ctx.roundRect(100, 540, 880, 680, 36);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Account Details
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#a8a29e';
    ctx.textAlign = 'left';
    ctx.fillText('FLAGGED RECIPIENT ACCOUNT:', 160, 640);

    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(targetAccount, 160, 725);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(targetBank, 160, 800);

    // Divider
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 850);
    ctx.lineTo(920, 850);
    ctx.stroke();

    // Modus
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#a8a29e';
    ctx.fillText('REPORTED FRAUD PATTERN:', 160, 920);

    ctx.font = '500 36px sans-serif';
    ctx.fillStyle = '#fecaca';
    const modusLines = targetModus.length > 35 ? [targetModus.slice(0, 35), targetModus.slice(35)] : [targetModus];
    modusLines.forEach((l, i) => {
      ctx.fillText(l, 160, 980 + i * 50);
    });

    // Verification Date
    ctx.font = '30px monospace';
    ctx.fillStyle = '#78716c';
    ctx.fillText(`VERIFIED AT: ${timestamp}`, 160, 1140);

    // Danger Warning Banner
    ctx.fillStyle = '#450a0a';
    ctx.roundRect(100, 1280, 880, 180, 28);
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText('DO NOT TRANSFER FUNDS', 540, 1360);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText('Always verify before you pay.', 540, 1420);

    // Footer Watermark
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🛡️ SHOMAR PROTECT', 540, 1720);

    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#a8a29e';
    ctx.fillText('Pan-African Digital Trust Network • protect.shomar.africa', 540, 1775);

    // Download trigger
    const link = document.createElement('a');
    link.download = `shomar-scam-alert-${targetAccount}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-neutral-950 border border-red-900/60 rounded-3xl p-5 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 transition z-10"
        >
          <X size={16} />
        </button>

        <h3 className="text-sm font-bold text-center mb-3 text-neutral-300">
          WhatsApp Status & Story Scam Buster
        </h3>

        {/* Story Card Visual Preview (9:16 Aspect Mockup) */}
        <div className="relative rounded-2xl bg-gradient-to-b from-neutral-900 via-red-950/40 to-black p-5 border border-red-700/50 shadow-inner text-center overflow-hidden">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider mb-2">
            <ShieldAlert size={12} />
            <span>Community Scam Alert</span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">SCAMMER EXPOSED</h2>
          <p className="text-[10px] font-bold text-red-400 mb-4">VERIFIED ON SHOMAR PROTECT</p>

          {/* Account Box */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-red-900/60 text-left space-y-1 my-2">
            <div className="text-[10px] text-neutral-400 font-mono">FLAGGED RECIPIENT:</div>
            <div className="text-lg font-bold font-mono text-white tracking-wide">{targetAccount}</div>
            <div className="text-xs font-semibold text-red-300">{targetBank}</div>
            <div className="border-t border-neutral-800 my-1 pt-1">
              <div className="text-[10px] text-neutral-400">Modus:</div>
              <div className="text-[11px] text-neutral-200 leading-snug">{targetModus}</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/80 text-[11px] font-bold text-red-300 my-3">
            DO NOT TRANSFER ANY MONEY
          </div>

          <div className="text-[9px] text-neutral-400 font-medium">
            🛡️ SHOMAR Protect · Check free on protect.shomar.africa
          </div>
        </div>

        {/* 1-Tap Viral Sharing Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-98"
          >
            <Share2 size={15} />
            <span>Post Directly to WhatsApp Status</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition"
            >
              <Download size={14} />
              <span>Save HD Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
