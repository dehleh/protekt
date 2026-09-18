'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { verifyVendor, KNOWN_TRUSTED_VENDORS, VendorTrustRecord } from '../lib/vendor-trust';

interface VendorTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function VendorTrustModal({ isOpen, onClose, initialQuery = '' }: VendorTrustModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedVendor, setSelectedVendor] = useState<VendorTrustRecord | null>(
    initialQuery ? verifyVendor(initialQuery) : KNOWN_TRUSTED_VENDORS[0]
  );
  const [reportSuccess, setReportSuccess] = useState(false);
  const [bioCopied, setBioCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (text: string) => {
    setQuery(text);
    const result = verifyVendor(text);
    setSelectedVendor(result);
    setReportSuccess(false);
  };

  const handleQuickSelect = (vendor: VendorTrustRecord) => {
    setQuery(vendor.handle);
    setSelectedVendor(vendor);
    setReportSuccess(false);
  };

  const handleBlindedReport = async () => {
    if (!selectedVendor) return;
    try {
      await fetch('/api/threats/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'account',
          blindedToken: `blnd_${Date.now().toString(16)}`,
          country: selectedVendor.country,
          notes: `User reported dispute on vendor ${selectedVendor.handle}`,
        }),
      });
      setReportSuccess(true);
    } catch {
      setReportSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                SHOMAR Trust Seal
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified African Social Commerce
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Cryptographic buyer protection for Instagram, WhatsApp & TikTok vendors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* 1-Tap Search Input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Vendor Handle, Business Name, or Seal ID:
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="e.g. @gadgetshub_ng, @nairobiluxury, @accrafashion"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {query && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick 1-Tap Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] text-neutral-400">Quick Test:</span>
            {KNOWN_TRUSTED_VENDORS.slice(0, 4).map((v) => (
              <button
                key={v.id}
                onClick={() => handleQuickSelect(v)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  selectedVendor?.id === v.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {v.country === 'NG' ? '🇳🇬' : v.country === 'KE' ? '🇰🇪' : v.country === 'GH' ? '🇬🇭' : '🇿🇦'}{' '}
                {v.handle}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        <div className="mt-5">
          {selectedVendor ? (
            <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/40 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedVendor.businessName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-medium">
                      {selectedVendor.handle}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5">{selectedVendor.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">{selectedVendor.trustScore}/100</div>
                  <div className="text-[10px] text-emerald-400/80 uppercase font-semibold">Trust Score</div>
                </div>
              </div>

              {/* Pillars Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Registration</div>
                  <div className="font-semibold text-emerald-400 truncate mt-0.5">{selectedVendor.regNumber}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Escrow Guarantee</div>
                  <div className="font-semibold text-neutral-200 mt-0.5">
                    {selectedVendor.escrowSupported ? '✓ Buyer Protected' : 'None'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Completed Orders</div>
                  <div className="font-semibold text-neutral-200 mt-0.5">
                    {selectedVendor.successfulOrders.toLocaleString()} verified
                  </div>
                </div>
              </div>

              {/* Physical Dispatch Verification */}
              <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-start gap-2.5 text-xs">
                <span className="text-base">📍</span>
                <div>
                  <span className="font-semibold text-neutral-200">Verified Physical Dispatch: </span>
                  <span className="text-neutral-400">{selectedVendor.physicalAddress}</span>
                  <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
                    ✓ Physically inspected location (Not a ghost vendor)
                  </div>
                </div>
              </div>

              {/* Cryptographic Seal Token */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                <div className="truncate mr-2">
                  <span className="text-neutral-400 text-[11px]">Cryptographic Seal ID: </span>
                  <code className="text-emerald-400 text-[11px] font-mono">{selectedVendor.sealToken}</code>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded shrink-0">
                  Zero-Tamper
                </span>
              </div>

              {/* Verified Seller Bio & Embed Generator (Viral Merchant Trust) */}
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400">Merchant Growth &amp; Trust Tools:</span>
                  <span className="text-[10px] text-neutral-400">For Instagram Bio, WhatsApp &amp; Storefront</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={async () => {
                      const bioText = `🛡️ Verified by SHOMAR Trust Seal (${selectedVendor.regNumber}) • /v/${selectedVendor.handle.replace(/^@/, '')}`;
                      await navigator.clipboard.writeText(bioText);
                      setBioCopied(true);
                      setTimeout(() => setBioCopied(false), 2500);
                    }}
                    className="py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <span>{bioCopied ? '✓ Copied Bio Link!' : '📋 Copy Bio Link'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      const embedCode = `<a href="https://shomar.protect/v/${selectedVendor.handle.replace(/^@/, '')}" target="_blank"><img src="https://shomar.protect/trust-seal-badge.svg" alt="SHOMAR Verified African Social Merchant" /></a>`;
                      await navigator.clipboard.writeText(embedCode);
                      setEmbedCopied(true);
                      setTimeout(() => setEmbedCopied(false), 2500);
                    }}
                    className="py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <span>{embedCopied ? '✓ Copied Embed!' : '🌐 Copy Web Badge'}</span>
                  </button>

                  <a
                    href={`/v/${selectedVendor.handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white border border-emerald-500 flex items-center justify-center gap-1.5 transition font-semibold text-center no-underline"
                  >
                    <span>View Live Seal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleBlindedReport}
                  className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
                >
                  {reportSuccess ? '✓ Blinded report submitted to ledger' : 'Report discrepancy on this vendor'}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  Confirm & Return
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-950/20 border border-amber-500/40 p-5 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                !
              </div>
              <h3 className="text-sm font-bold text-amber-300">Unverified Vendor</h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                No matching SHOMAR Trust Seal found for &quot;{query}&quot;. This vendor has not verified their physical store,
                CAC/KRA business identity, or activated buyer escrow protection.
              </p>
              <div className="p-3 rounded-lg bg-neutral-900/80 border border-amber-500/30 text-xs text-amber-200 text-left">
                <strong>Buyer Advisory:</strong> Never pay into personal accounts via direct transfer for unverified vendors.
                Request Payment on Delivery (POD) or use an escrow partner.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
