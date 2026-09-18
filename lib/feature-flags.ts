/**
 * Centralized Platform-Admin Feature Flags Configuration
 * Controls all core and frontier features of SHOMAR Protect dynamically.
 */

export interface FeatureFlags {
  // Financial Security & Recall
  preTransferRadar: boolean;
  bankFreezeAndPnd: boolean;
  evidenceSlip: boolean;

  // Merchant & Creator Trust
  merchantSafeDeal: boolean;
  vendorTrustSeal: boolean;
  creatorVault: boolean;

  // Viral Growth & Family
  scamBusterCard: boolean;
  familyBroadcast: boolean;

  // Low-Data & Mass Market
  pocketCyberDrill: boolean;
  ussdSimulator: boolean;
  offlineZeroDataBadge: boolean;
  voiceGuidance: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;

export const FEATURE_FLAG_STORAGE_KEY = 'shomar-feature-flags-v1';

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Financial Security & Recall
  preTransferRadar: true,
  bankFreezeAndPnd: true,
  evidenceSlip: true,

  // Merchant & Creator Trust
  merchantSafeDeal: true,
  vendorTrustSeal: true,
  creatorVault: true,

  // Viral Growth & Family
  scamBusterCard: true,
  familyBroadcast: true,

  // Low-Data & Mass Market
  pocketCyberDrill: true,
  ussdSimulator: true,
  offlineZeroDataBadge: true,
  voiceGuidance: true,
};

export const FEATURE_METADATA: Record<
  FeatureFlagKey,
  { name: string; category: 'financial' | 'commerce' | 'growth' | 'mass-market'; description: string }
> = {
  preTransferRadar: {
    name: 'Pre-Transfer Scam Radar',
    category: 'financial',
    description: 'Instant NUBAN / Mobile Money scan before transferring cash.',
  },
  bankFreezeAndPnd: {
    name: '15-Min Bank Freeze & PND',
    category: 'financial',
    description: '1-tap USSD panic dialer and formal Post-No-Debit legal notice.',
  },
  evidenceSlip: {
    name: 'Bank & Police Evidence Slip',
    category: 'financial',
    description: 'Formal digital incident report for bank managers and police officers.',
  },
  merchantSafeDeal: {
    name: 'Merchant Safe Deal Link',
    category: 'commerce',
    description: 'Custom deal links and bio trust badges that convert hesitant buyers.',
  },
  vendorTrustSeal: {
    name: 'Verified Vendor Directory',
    category: 'commerce',
    description: 'Registry of CAC/KRA registered social vendors with trust scores.',
  },
  creatorVault: {
    name: 'Creator & VIP Social Vault',
    category: 'commerce',
    description: 'Sponsorship infostealer scanner, ##002# kill code, and channel hijack recovery.',
  },
  scamBusterCard: {
    name: 'WhatsApp Status Scam Buster',
    category: 'growth',
    description: 'Viral 9:16 high-contrast story graphic generator for WhatsApp status.',
  },
  familyBroadcast: {
    name: 'Family & Circle Broadcast',
    category: 'growth',
    description: 'Pre-composed WhatsApp / SMS alert to stop secondary impersonation extortion.',
  },
  pocketCyberDrill: {
    name: '30-Second Cyber Drill',
    category: 'mass-market',
    description: 'Street-smart micro scenarios with bilingual English/Pidgin explanations.',
  },
  ussdSimulator: {
    name: '2G USSD Telco Simulator',
    category: 'mass-market',
    description: 'Interactive feature phone simulator dialing *384*746# over HTTP.',
  },
  offlineZeroDataBadge: {
    name: '0.00 MB Offline Badge',
    category: 'mass-market',
    description: 'Topbar reassurance badge confirming on-device Bloom ledger operations.',
  },
  voiceGuidance: {
    name: 'Multilingual Voice Guidance',
    category: 'mass-market',
    description: 'Text-to-speech vernacular guidance in English, Pidgin, Hausa, Yoruba, and Igbo.',
  },
};

export type FeaturePreset = 'full' | 'minimal' | 'commerce-creator' | 'low-data';

export const FEATURE_PRESETS: Record<FeaturePreset, { name: string; description: string; flags: FeatureFlags }> = {
  full: {
    name: 'Full Frontier (All Features)',
    description: 'All 12 commercial and frontier features enabled.',
    flags: { ...DEFAULT_FEATURE_FLAGS },
  },
  minimal: {
    name: 'Minimal Core Shield',
    description: 'Only essential scam checks and emergency bank panic freeze active.',
    flags: {
      preTransferRadar: false,
      bankFreezeAndPnd: true,
      evidenceSlip: true,
      merchantSafeDeal: false,
      vendorTrustSeal: false,
      creatorVault: false,
      scamBusterCard: false,
      familyBroadcast: true,
      pocketCyberDrill: false,
      ussdSimulator: false,
      offlineZeroDataBadge: true,
      voiceGuidance: false,
    },
  },
  'commerce-creator': {
    name: 'Commerce & Creator Focus',
    description: 'Prioritizes social vendor deal links, creator vault, and pre-transfer radar.',
    flags: {
      preTransferRadar: true,
      bankFreezeAndPnd: true,
      evidenceSlip: false,
      merchantSafeDeal: true,
      vendorTrustSeal: true,
      creatorVault: true,
      scamBusterCard: true,
      familyBroadcast: false,
      pocketCyberDrill: false,
      ussdSimulator: false,
      offlineZeroDataBadge: true,
      voiceGuidance: false,
    },
  },
  'low-data': {
    name: '2G Mass Market Mode',
    description: 'Focuses on offline USSD, vernacular voice, and pocket cyber drills.',
    flags: {
      preTransferRadar: true,
      bankFreezeAndPnd: true,
      evidenceSlip: false,
      merchantSafeDeal: false,
      vendorTrustSeal: false,
      creatorVault: false,
      scamBusterCard: false,
      familyBroadcast: true,
      pocketCyberDrill: true,
      ussdSimulator: true,
      offlineZeroDataBadge: true,
      voiceGuidance: true,
    },
  },
};

/**
 * Parses and sanitizes stored feature flags
 */
export function parseFeatureFlags(raw: string | null): FeatureFlags {
  if (!raw) return { ...DEFAULT_FEATURE_FLAGS };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_FEATURE_FLAGS };

    const result: Record<string, boolean> = { ...DEFAULT_FEATURE_FLAGS };
    for (const key of Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[]) {
      if (typeof parsed[key] === 'boolean') {
        result[key] = parsed[key];
      }
    }
    return (result as unknown) as FeatureFlags;
  } catch {
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}
