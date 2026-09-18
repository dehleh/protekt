'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Lock,
  PhoneCall,
  Video,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Search,
  Key,
} from 'lucide-react';
import {
  scanCreatorSponsorship,
  SocialPhishingResult,
  TELCO_ANTI_HIJACK,
  generateChannelHijackAffidavit,
  CREATOR_SUPPORT_CHANNELS,
  auditBrandDealContract,
  type BrandDealAuditResult,
} from '../lib/social-shield';

interface SocialVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialVaultModal({ isOpen, onClose }: SocialVaultModalProps) {
  const [activeTab, setActiveTab] = useState<'scanner' | 'sim' | 'recovery' | 'audit'>('scanner');

  // Scanner state
  const [pitchText, setPitchText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [attachmentNames, setAttachmentNames] = useState('');
  const [scanResult, setScanResult] = useState<SocialPhishingResult | null>(null);
  const [brandAuditResult, setBrandAuditResult] = useState<BrandDealAuditResult | null>(null);
  const [copiedCounterOffer, setCopiedCounterOffer] = useState(false);

  // Recovery state
  const [creatorName, setCreatorName] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [platform, setPlatform] = useState<'YouTube' | 'Instagram' | 'TikTok' | 'X' | 'WhatsApp'>('YouTube');
  const [adSenseId, setAdSenseId] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [lastLocation, setLastLocation] = useState('Lagos, Nigeria');
  const [copiedAffidavit, setCopiedAffidavit] = useState(false);

  if (!isOpen) return null;

  const handleScanPitch = () => {
    if (!pitchText.trim()) return;
    const res = scanCreatorSponsorship(pitchText);
    setScanResult(res);
    const files = attachmentNames.split(',').map(f => f.trim()).filter(Boolean);
    const brandAudit = auditBrandDealContract(pitchText, senderEmail, files);
    setBrandAuditResult(brandAudit);
  };

  const handleSampleScam = (type: 'zip' | 'copyright' | 'fake-nike') => {
    if (type === 'zip') {
      const sample = `Hi! We are Apex Gaming. We love your videos and want to offer you $4,500 to review our new game on your channel! Attached is our contract & game build launcher in game_build.zip (password is 1234). Please review within 24 hours to secure payment!`;
      setPitchText(sample);
      setSenderEmail('campaigns@apex-gaming-reviews.xyz');
      setAttachmentNames('contract.pdf, game_launcher.exe');
      setScanResult(scanCreatorSponsorship(sample));
      setBrandAuditResult(auditBrandDealContract(sample, 'campaigns@apex-gaming-reviews.xyz', ['contract.pdf', 'game_launcher.exe']));
    } else if (type === 'fake-nike') {
      const sample = `Dear Creator, Nike wishes to sponsor your next 3 videos for $12,000. Please add our marketing partner account (nike-manager@collab-adsuite.com) as Manager to your YouTube Studio and Meta Business Suite to link ad metrics.`;
      setPitchText(sample);
      setSenderEmail('sponsorships@nike-partners-collab.co');
      setAttachmentNames('brief.pdf');
      setScanResult(scanCreatorSponsorship(sample));
      setBrandAuditResult(auditBrandDealContract(sample, 'sponsorships@nike-partners-collab.co', ['brief.pdf']));
    } else {
      const sample = `URGENT NOTICE: Your Instagram account has violated copyright guidelines. Your verified badge and monetized account will be permanently disabled within 24 hours. Click here to appeal: http://meta-support-verify-desk.com/appeal`;
      setPitchText(sample);
      setSenderEmail('security-alert@meta-support-verify-desk.com');
      setAttachmentNames('');
      setScanResult(scanCreatorSponsorship(sample));
      setBrandAuditResult(auditBrandDealContract(sample, 'security-alert@meta-support-verify-desk.com', []));
    }
  };

  const affidavitText = generateChannelHijackAffidavit({
    creatorName: creatorName || '[Your Full Legal Name]',
    channelOrHandle: channelHandle || '@YourCreatorHandle',
    platform,
    accountUrlOrNumber: `https://${platform.toLowerCase()}.com/${channelHandle.replace(/^@/, '')}`,
    monetizationId: adSenseId || undefined,
    compromisedDate: new Date().toLocaleDateString('en-GB'),
    lastCleanLocation: lastLocation || 'Lagos, Nigeria',
    contactEmail: contactEmail || 'authentic.creator@gmail.com',
  });

  const handleCopyAffidavit = () => {
    navigator.clipboard.writeText(affidavitText);
    setCopiedAffidavit(true);
    setTimeout(() => setCopiedAffidavit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold">
              🎬
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Creator & VIP Social Account Vault
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  High-Value Protection
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Defense for monetized channels, verified profiles, and accounts with confidential DMs.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'scanner' ? 'bg-purple-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🛡️ Sponsorship Scanner
          </button>
          <button
            onClick={() => setActiveTab('sim')}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'sim' ? 'bg-purple-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📵 SIM & ##002# Lock
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'recovery' ? 'bg-purple-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🚨 Channel Recovery
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🔑 VIP 2FA Audit
          </button>
        </div>

        {/* TAB 1: Sponsorship Phishing Scanner */}
        {activeTab === 'scanner' && (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Paste Sponsorship Email, Brand DM, or Copyright Strike:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSampleScam('zip')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Demo: Password ZIP
                  </button>
                  <button
                    onClick={() => handleSampleScam('fake-nike')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-purple-300 font-semibold"
                  >
                    Demo: Fake Brand Deal
                  </button>
                  <button
                    onClick={() => handleSampleScam('copyright')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Demo: Fake Strike
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Sender Email Address (Optional):
                  </label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. collab@nike-partners-collab.co"
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Attachment Filenames (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={attachmentNames}
                    onChange={(e) => setAttachmentNames(e.target.value)}
                    placeholder="e.g. sponsorship_brief.pdf, game_demo.exe"
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <textarea
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                rows={3}
                placeholder="Paste the collaboration email or DM here (e.g. 'We offer $5,000 for a review, download the contract in contract.zip, password is 1234')..."
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleScanPitch}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950 transition active:scale-98"
              >
                <Search size={14} />
                <span>Audit Brand Deal & Contract for Session Stealers</span>
              </button>
            </div>

            {/* Brand Deal Domain & Contract Audit Card */}
            {brandAuditResult && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-purple-500/30 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Brand Deal Audit:</span>
                    <span className="text-purple-300 font-semibold">{brandAuditResult.brandDetected}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    brandAuditResult.safetyScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' : brandAuditResult.safetyScore >= 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    Creator Safety Score: {brandAuditResult.safetyScore}/100
                  </span>
                </div>

                {brandAuditResult.isDomainLookalike && (
                  <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-[11px] font-medium">
                    ⚠️ SENDER DOMAIN SPOOF: This sender claims to represent {brandAuditResult.brandDetected} but is emailing from &quot;{brandAuditResult.senderDomain}&quot;. Legitimate brand deals come strictly from corporate domains.
                  </div>
                )}

                {brandAuditResult.safeCheckpoints.length > 0 && (
                  <div className="space-y-1 text-[11px] text-emerald-400">
                    {brandAuditResult.safeCheckpoints.map((cp, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span>✓</span>
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Safe Counter-Offer Protocol */}
                <div className="pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-neutral-300 text-[11px]">Safe Creator Counter-Offer Template:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(brandAuditResult.safeCounterOfferProtocol);
                        setCopiedCounterOffer(true);
                        setTimeout(() => setCopiedCounterOffer(false), 2000);
                      }}
                      className="text-[10px] text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1"
                    >
                      <Copy size={11} />
                      <span>{copiedCounterOffer ? 'Copied!' : 'Copy Safe Reply'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 whitespace-pre-wrap">
                    {brandAuditResult.safeCounterOfferProtocol}
                  </pre>
                </div>
              </div>
            )}

            {scanResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
                  scanResult.verdict === 'critical-infostealer'
                    ? 'bg-red-950/40 border-red-500/60 text-red-200'
                    : scanResult.verdict === 'suspicious'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-xs">
                    {scanResult.verdict === 'critical-infostealer'
                      ? '🛑 CRITICAL INFOSTEALER THREAT'
                      : scanResult.verdict === 'suspicious'
                      ? '⚠️ SUSPICIOUS BRAND INQUIRY'
                      : '🟢 NO OBVIOUS MALWARE SIGNS'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 font-bold">
                    Risk: {scanResult.riskScore}/100
                  </span>
                </div>

                <p className="leading-relaxed font-medium">{scanResult.explanationEn}</p>

                <div className="p-2.5 rounded-xl bg-black/50 text-[11px] text-amber-300">
                  <span className="font-bold">🇳🇬 Pidgin Alert:</span> {scanResult.explanationPidgin}
                </div>

                {scanResult.threatFlags.length > 0 && (
                  <div>
                    <span className="font-bold text-white block mb-1">Detected Red Flags:</span>
                    <ul className="space-y-1 text-[11px] text-neutral-300">
                      {scanResult.threatFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">✗</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-neutral-800 pt-2 text-[11px]">
                  <strong>Action:</strong> {scanResult.recommendedAction}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIM & ##002# Anti-Hijack */}
        {activeTab === 'sim' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <PhoneCall size={16} className="text-red-400" />
                  Universal Call Forwarding Kill Code (##002#)
                </span>
                <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
                  All GSM Networks
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Scammers hijack WhatsApp and SMS OTPs by quietly activating call forwarding on your line via social engineering. Dialing <strong>##002#</strong> immediately cancels all conditional, unconditional, and data forwarding.
              </p>

              <div className="flex gap-2 pt-1">
                <a
                  href={TELCO_ANTI_HIJACK.cancelCallForwardingDialer}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition active:scale-98"
                >
                  <PhoneCall size={14} />
                  <span>1-Tap Dial ##002# (Cancel All Forwarding)</span>
                </a>
                <a
                  href={TELCO_ANTI_HIJACK.checkCallForwardingDialer}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1 border border-neutral-700 transition"
                >
                  <span>Check *#21#</span>
                </a>
              </div>
            </div>

            {/* Telco SIM PIN Lockdown Guides */}
            <div>
              <span className="text-xs font-bold text-neutral-300 block mb-2">
                Telco SIM Card PIN Lock (Prevents SIM Extraction Hijack):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {TELCO_ANTI_HIJACK.simPinGuides.map((guide, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="font-bold text-purple-400 flex items-center justify-between">
                      <span>{guide.network}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Default: {guide.defaultPin}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-snug">{guide.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Emergency Channel Recovery */}
        {activeTab === 'recovery' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              If your monetized channel or account was hijacked via session cookie theft, submit this formal <strong>Proof of Ownership & Channel Hijack Declaration</strong> to partner escalation teams.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Your Full Legal Name</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. David Adeleke"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Channel / Profile Handle</label>
                <input
                  type="text"
                  value={channelHandle}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  placeholder="e.g. @TechWithTunde"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 font-mono text-neutral-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 font-medium"
                >
                  <option value="YouTube">YouTube (Partner Program)</option>
                  <option value="Instagram">Instagram / Facebook Page</option>
                  <option value="TikTok">TikTok (Creator Rewards)</option>
                  <option value="X">X (Twitter)</option>
                  <option value="WhatsApp">WhatsApp Business</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">AdSense ID / Payout Pub-ID</label>
                <input
                  type="text"
                  value={adSenseId}
                  onChange={(e) => setAdSenseId(e.target.value)}
                  placeholder="e.g. pub-1049281920491"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 font-mono text-neutral-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                  Authentic Contact Email (Where Support Can Reach You)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. realcreator.backup@gmail.com"
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100"
                />
              </div>
            </div>

            {/* Generated Affidavit Preview */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-semibold text-neutral-300">Generated Escalation Declaration:</span>
                <button
                  onClick={handleCopyAffidavit}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-bold"
                >
                  {copiedAffidavit ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedAffidavit ? 'Copied' : 'Copy Affidavit'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={affidavitText}
                rows={6}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-300 leading-relaxed resize-none"
              />
            </div>

            {/* Direct Escalation Links */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <span className="font-bold text-neutral-200 block">Official Expedited Support Channels:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <a
                  href={CREATOR_SUPPORT_CHANNELS.youtube.twitterEscalation}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-between text-neutral-200 transition"
                >
                  <span>Tweet @TeamYouTube (Fastest)</span>
                  <ExternalLink size={13} className="text-neutral-400" />
                </a>
                <a
                  href={CREATOR_SUPPORT_CHANNELS.instagram.helpdeskUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-between text-neutral-200 transition"
                >
                  <span>Instagram.com/hacked</span>
                  <ExternalLink size={13} className="text-neutral-400" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIP 2FA & Confidential DMs Audit */}
        {activeTab === 'audit' && (
          <div className="mt-5 space-y-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                Why SMS 2FA Fails High-Profile Creators & Executives
              </span>
              <p className="text-neutral-300 leading-relaxed">
                Standard SMS 2FA is easily bypassed by <strong>Infostealers (cookie theft)</strong> and <strong>SIM swap fraud</strong>. When malware steals your session cookie, it does NOT prompt for your password or SMS code—it walks straight into your dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-200 block">VIP Hardening Checklist:</span>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-white block">Switch to FIDO2 Hardware Security Keys (YubiKey)</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Hardware keys are physically un-phishable and immune to session cookie theft. Keep one on your keychain and a backup in a drawer.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-white block">Revoke Dangerous Third-Party Connected Apps</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Check your Google, Meta, and X "Connected Apps" monthly. Remove old analytics tools, auto-posters, or giveaway bots with "Full Account Access".
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-white block">Separate Business Email from Channel Ownership Email</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Never put your primary Google/Meta login email publicly in your YouTube &quot;About&quot; page or Instagram bio. Use an isolated public contact alias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
