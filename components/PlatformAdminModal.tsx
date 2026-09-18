'use client';

import React from 'react';
import { X, Sliders, CheckCircle2, RotateCcw, ShieldCheck, Zap, Sparkles, ShoppingBag, Radio } from 'lucide-react';
import { useFeatureFlags } from '../hooks/use-feature-flags';
import {
  FEATURE_METADATA,
  FEATURE_PRESETS,
  FeatureFlagKey,
  FeaturePreset,
} from '../lib/feature-flags';

interface PlatformAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_SECTIONS: Array<{
  id: 'financial' | 'commerce' | 'growth' | 'mass-market';
  title: string;
  icon: typeof ShieldCheck;
  color: string;
  keys: FeatureFlagKey[];
}> = [
  {
    id: 'financial',
    title: 'Financial Security & Emergency Recall',
    icon: ShieldCheck,
    color: '#EF4444',
    keys: ['preTransferRadar', 'bankFreezeAndPnd', 'evidenceSlip'],
  },
  {
    id: 'commerce',
    title: 'Merchant & Creator Trust Systems',
    icon: ShoppingBag,
    color: '#10B981',
    keys: ['merchantSafeDeal', 'vendorTrustSeal', 'creatorVault'],
  },
  {
    id: 'growth',
    title: 'Viral Distribution & Family Network',
    icon: Sparkles,
    color: '#F59E0B',
    keys: ['scamBusterCard', 'familyBroadcast'],
  },
  {
    id: 'mass-market',
    title: 'Mass Market, 2G & Low-Data Defense',
    icon: Radio,
    color: '#6366F1',
    keys: ['pocketCyberDrill', 'ussdSimulator', 'offlineZeroDataBadge', 'voiceGuidance'],
  },
];

export function PlatformAdminModal({ isOpen, onClose }: PlatformAdminModalProps) {
  const { flags, toggleFlag, applyPreset, resetFlags } = useFeatureFlags();

  if (!isOpen) return null;

  const totalEnabled = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.keys(flags).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
              <Sliders size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Platform Admin Controls
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Live Synced
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Toggle and orchestrate features dynamically. Persists locally and syncs to server state.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Close admin modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              1-Click Deployment Presets
            </span>
            <button
              onClick={resetFlags}
              className="text-[11px] font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw size={12} />
              Reset Defaults
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(FEATURE_PRESETS) as FeaturePreset[]).map((presetKey) => {
              const preset = FEATURE_PRESETS[presetKey];
              return (
                <button
                  key={presetKey}
                  onClick={() => applyPreset(presetKey)}
                  className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-700 transition text-left group"
                >
                  <strong className="block text-xs font-bold text-neutral-200 group-hover:text-white">
                    {preset.name}
                  </strong>
                  <span className="block text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories & Switches */}
        <div className="mt-5 space-y-5">
          {CATEGORY_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <SectionIcon size={14} style={{ color: section.color }} />
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {section.keys.map((key) => {
                    const meta = FEATURE_METADATA[key];
                    const isEnabled = flags[key];

                    return (
                      <div
                        key={key}
                        className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                          isEnabled
                            ? 'bg-neutral-800/60 border-neutral-700'
                            : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                        }`}
                      >
                        <div className="space-y-1 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {meta.name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-neutral-800 text-neutral-500'
                              }`}
                            >
                              {isEnabled ? 'ACTIVE' : 'OFF'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-tight">
                            {meta.description}
                          </p>
                        </div>

                        {/* Switch Control */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isEnabled}
                          onClick={() => toggleFlag(key)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? 'bg-emerald-600' : 'bg-neutral-700'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>
              <strong className="text-white font-mono">{totalEnabled}</strong> of{' '}
              <strong className="text-white font-mono">{totalCount}</strong> features active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            >
              Done &amp; Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
