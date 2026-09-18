'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Radio,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { FeatureFlagsProvider, useFeatureFlags } from '@/hooks/use-feature-flags';
import {
  FEATURE_METADATA,
  FEATURE_PRESETS,
  FeatureFlagKey,
  FeaturePreset,
} from '@/lib/feature-flags';
import { assessAccountTransfer } from '@/lib/threat-ledger';
import { BANK_PANIC_DIRECTORY, SUPPORTED_COUNTRIES } from '@/lib/ussd-directory';

const ADMIN_PASSCODE = 'shomar-admin-2026';
const AUTH_STORAGE_KEY = 'shomar_admin_authenticated';

export default function PlatformAdminPage() {
  return (
    <FeatureFlagsProvider>
      <PlatformAdminContent />
    </FeatureFlagsProvider>
  );
}

function PlatformAdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Threat sandbox state
  const [testAccount, setTestAccount] = useState('0123456789');
  const [testBank, setTestBank] = useState('Access Bank');
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Regional directory tab
  const [selectedCountry, setSelectedCountry] = useState<'NG' | 'KE' | 'GH' | 'ZA'>('NG');

  const { flags, toggleFlag, applyPreset, resetFlags } = useFeatureFlags();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch {
      // Session storage unavailable
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch {}
    } else {
      setAuthError('Incorrect operator passcode. Access denied.');
      setPasscode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  const handleRunDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAccount.trim()) return;
    const result = assessAccountTransfer(testAccount.trim(), testBank);
    setSandboxResult(result);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="text-neutral-500 text-sm font-mono animate-pulse">Initializing Platform Admin Console...</div>
      </div>
    );
  }

  // Passcode Challenge Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Lock size={26} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded-full mb-2">
              Confidential · Internal Only
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Platform Admin Console</h1>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Restricted management portal for SHOMAR Protect core services and feature orchestration.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Operator Passcode
              </label>
              <input
                id="admin-passcode"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter secret authorization key"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500 transition"
                autoFocus
              />
              {authError && <p className="text-xs text-rose-400 font-semibold mt-1.5">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Unlock size={16} />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-[11px] text-neutral-500">
              This terminal is unadvertised and accessible only to authorized engineers and platform administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalEnabled = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.keys(flags).length;

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

  const countryBanks = BANK_PANIC_DIRECTORY.filter((b) => (b.country || 'NG') === selectedCountry);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">SHOMAR Platform Admin</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  Live Console
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono">
                  Hidden Route
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Centralized feature flags, threat engine diagnostics, and pan-African emergency registries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition flex items-center gap-1.5"
            >
              <span>User App View</span>
              <ExternalLink size={13} />
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition flex items-center gap-1.5 border border-rose-500/20"
            >
              <LogOut size={13} />
              <span>Lock Console</span>
            </button>
          </div>
        </header>

        {/* System Health / Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Active Features</span>
              <Activity size={14} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {totalEnabled} / {totalCount}
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">
              {totalEnabled === totalCount ? 'Full Frontier Active' : 'Custom Deployment Mode'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Sync Engine</span>
              <Server size={14} className="text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">REST + Cache</div>
            <span className="text-[10px] text-indigo-400 mt-1 block">/api/admin/features</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Threat Ledger</span>
              <ShieldAlert size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">Bloom + ZK</div>
            <span className="text-[10px] text-amber-400 mt-1 block">Zero False Certainty</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Target Markets</span>
              <Radio size={14} className="text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">NG · KE · GH · ZA</div>
            <span className="text-[10px] text-cyan-400 mt-1 block">USSD, Telco &amp; Web</span>
          </div>
        </div>

        {/* Feature Flags Orchestrator Section */}
        <section className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-indigo-400" />
                <h2 className="text-base font-bold text-white">Feature Flags Orchestrator</h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Toggle capabilities across the platform. Changes take effect on client reload and propagate via backend API.
              </p>
            </div>

            <button
              onClick={resetFlags}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw size={12} />
              <span>Reset Factory Defaults</span>
            </button>
          </div>

          {/* 1-Click Preset Bar */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/90">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
              1-Click Deployment Profiles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(FEATURE_PRESETS) as FeaturePreset[]).map((presetKey) => {
                const preset = FEATURE_PRESETS[presetKey];
                return (
                  <button
                    key={presetKey}
                    onClick={() => applyPreset(presetKey)}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-700 transition text-left group"
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

          {/* Categorized Toggle Switches */}
          <div className="space-y-6">
            {CATEGORY_SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <SectionIcon size={14} style={{ color: section.color }} />
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.keys.map((key) => {
                      const meta = FEATURE_METADATA[key];
                      const isEnabled = flags[key];

                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                            isEnabled
                              ? 'bg-neutral-800/60 border-neutral-700 shadow-sm'
                              : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                          }`}
                        >
                          <div className="space-y-1 flex-1 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white">{meta.name}</span>
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
                            <p className="text-[11px] text-neutral-400 leading-snug">
                              {meta.description}
                            </p>
                          </div>

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
        </section>

        {/* Threat Ledger & Radar Diagnostic Sandbox */}
        <section className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-amber-400" />
              <div>
                <h2 className="text-base font-bold text-white">Threat Ledger &amp; Radar Sandbox</h2>
                <p className="text-xs text-neutral-400">
                  Simulate and verify pre-transfer threat matches directly against our on-device Bloom &amp; heuristic ledger.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRunDiagnostic} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="diag-account" className="block text-xs font-semibold text-neutral-400 mb-1">
                Account / Phone Number
              </label>
              <input
                id="diag-account"
                type="text"
                value={testAccount}
                onChange={(e) => setTestAccount(e.target.value)}
                placeholder="e.g. 0123456789 or 254700000001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="diag-bank" className="block text-xs font-semibold text-neutral-400 mb-1">
                Bank / Provider
              </label>
              <select
                id="diag-bank"
                value={testBank}
                onChange={(e) => setTestBank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Access Bank">Access Bank (Nigeria)</option>
                <option value="OPay">OPay Digital Services</option>
                <option value="Palmpay">Palmpay</option>
                <option value="Moniepoint">Moniepoint MFB</option>
                <option value="Safaricom M-Pesa">Safaricom M-Pesa (Kenya)</option>
                <option value="MTN MoMo">MTN Mobile Money (Ghana)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Search size={14} />
                <span>Run Diagnostic Scan</span>
              </button>
            </div>
          </form>

          {sandboxResult && (
            <div
              className={`mt-4 p-4 rounded-2xl border ${
                sandboxResult.riskLevel === 'flagged-fraud'
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : sandboxResult.riskLevel === 'safe'
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono uppercase">
                  Verdict: {sandboxResult.riskLevel}
                </span>
                <span className="text-xs font-mono">
                  Report Count: <strong>{sandboxResult.reportCount}</strong>
                </span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">{sandboxResult.recommendation}</p>
              {sandboxResult.lastReportedModus && (
                <p className="text-[11px] opacity-80 mt-1">
                  Last Modus Operandi: {sandboxResult.lastReportedModus}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Regional Panic & Telco Gateway Directory */}
        <section className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Regional Emergency Directory &amp; Dialers</h2>
              <p className="text-xs text-neutral-400">
                Panic USSD codes, hotlines, and Post-No-Debit fraud desk contacts.
              </p>
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              {SUPPORTED_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedCountry === c.code
                      ? 'bg-neutral-800 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {countryBanks.map((bank) => (
              <div
                key={bank.id}
                className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-white font-bold">{bank.name}</strong>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                    {bank.shortName}
                  </span>
                </div>
                <div className="text-xs text-neutral-300 font-mono">
                  {bank.ussdCode ? (
                    <span className="text-red-400 font-bold">{bank.ussdCode}</span>
                  ) : (
                    <span>Hotline: {bank.phoneHotline}</span>
                  )}
                </div>
                {bank.fraudEmail && (
                  <p className="text-[10px] text-neutral-500 font-mono truncate">{bank.fraudEmail}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
