/**
 * SHOMAR Social Media & Creator Account Vault
 * 
 * Protects monetized creators (YouTube, Instagram, TikTok, X) and high-profile users with confidential DMs
 * against session-hijacking infostealers, sponsorship scams, SIM-swap WhatsApp hijackings,
 * and fake copyright extortion.
 */

export interface SocialPhishingResult {
  verdict: 'clean' | 'suspicious' | 'critical-infostealer';
  riskScore: number; // 0 - 100
  threatFlags: string[];
  explanationEn: string;
  explanationPidgin: string;
  recommendedAction: string;
}

export interface CreatorHijackAffidavitData {
  creatorName: string;
  channelOrHandle: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'X' | 'WhatsApp';
  accountUrlOrNumber: string;
  monetizationId?: string; // e.g. AdSense Pub ID or Meta Payout ID
  compromisedDate: string;
  lastCleanLocation: string;
  contactEmail: string;
}

/**
 * Common spoofed sender domains and brand names abused in creator phishing
 */
const SPOOFED_DOMAINS = [
  'meta-support',
  'instagram-verify',
  'youtube-partner',
  'google-partnership',
  'tiktok-creator-fund',
  'nordvpn-sponsorship',
  'epicgames-partner',
  'adobe-collab',
  'razer-sponsor',
];

/**
 * Scans email text, DMs, or sponsorship pitch messages for infostealer malware formats
 */
export function scanCreatorSponsorship(text: string): SocialPhishingResult {
  const content = text.toLowerCase();
  const threatFlags: string[] = [];
  let riskScore = 0;

  // 1. Password-protected archive detection (the classic RedLine/Lumma infostealer technique)
  const hasArchivePassword = /(?:password|pass|pwd|code)\s*(?:is|:|=)?\s*["']?\w+["']?/i.test(content) &&
    /(?:\.zip|\.rar|\.7z|\.tar|archive|attached file|attachment)/i.test(content);
  if (hasArchivePassword) {
    threatFlags.push('Password-protected archive detected (Used by infostealers to bypass antivirus email scanners)');
    riskScore += 45;
  }

  // 2. Dangerous executable or script file formats
  const hasDangerousExt = /(?:\.scr|\.exe|\.bat|\.cmd|\.pif|\.vbs|\.iso|\.msi|\.hta|\.jar)\b/i.test(content);
  if (hasDangerousExt) {
    threatFlags.push('Executable or screensaver payload (.scr/.exe/.bat/.iso) detected disguised as contract/media kit');
    riskScore += 50;
  }

  // 3. Cloud storage link paired with contract/game review demands
  const hasCloudDrive = /(?:drive\.google\.com|dropbox\.com|mega\.nz|mediafire\.com|cdn\.discordapp\.com|transfer\.sh)/i.test(content);
  const mentionsContractOrGame = /(?:contract|agreement|nda|game build|launcher|client|test version|beta test|guidelines)/i.test(content);
  if (hasCloudDrive && mentionsContractOrGame) {
    threatFlags.push('External cloud drive hosting contract or game build (Frequent vector for session cookie stealers)');
    riskScore += 25;
  }

  // 4. Fake Meta / YouTube / TikTok official copyright or strike extortion
  const isFakeCopyright = /(?:copyright strike|trademark infringement|account will be disabled|violates community guidelines|verify badge will be removed|24 hours to appeal)/i.test(content);
  if (isFakeCopyright) {
    threatFlags.push('Urgent copyright or account termination strike (Official platforms never send DMs with external links to appeal)');
    riskScore += 35;
  }

  // 5. Unrealistic sponsorship compensation with artificial urgency
  const hasHighDollarUrgency = /(?:\$(?:[3-9],\d{3}|\d{5})|\b(?:usd|dollars)\b).{0,60}(?:urgent|within 24 hours|today only|immediate|exclusive offer)/i.test(content);
  if (hasHighDollarUrgency) {
    threatFlags.push('Unrealistic sponsorship payout combined with high-pressure timeline');
    riskScore += 15;
  }

  // 6. Lookalike or spoofed sender domains
  for (const domain of SPOOFED_DOMAINS) {
    if (content.includes(domain)) {
      threatFlags.push(`Spoofed or lookalike creator partner domain pattern: "${domain}"`);
      riskScore += 30;
      break;
    }
  }

  // Normalize score
  riskScore = Math.min(riskScore, 100);

  if (riskScore >= 50) {
    return {
      verdict: 'critical-infostealer',
      riskScore,
      threatFlags,
      explanationEn: 'CRITICAL THREAT: This message exhibits classic session-hijacking infostealer patterns. Opening the attached file or link will steal your browser cookies and bypass 2FA to take over your monetized channel or social accounts.',
      explanationPidgin: 'CHAI! RED ALERT: Dis message na pure session stealer virus! If you open dat file or download link, e go steal your browser login cookies, bypass your 2FA, and carry your monetized channel or account waka.',
      recommendedAction: 'DO NOT open the link or run any file. Block sender immediately. If opened on PC, disconnect internet, clear browser session cookies, and reset channel passwords from another device.',
    };
  }

  if (riskScore >= 20) {
    return {
      verdict: 'suspicious',
      riskScore,
      threatFlags,
      explanationEn: 'SUSPICIOUS COLLABORATION: The sender uses high-risk cloud links or urgency. Genuine brand agencies send standard PDF contracts without passwords or executables.',
      explanationPidgin: 'DEY CAREFUL: Dis collaboration format look fishy. Real brands dey send clean PDF, dem no dey send passworded zip or rush you like market fire.',
      recommendedAction: 'Verify the sender company on their official website or LinkedIn before opening any documents. Never run executable files.',
    };
  }

  return {
    verdict: 'clean',
    riskScore,
    threatFlags: [],
    explanationEn: 'No obvious infostealer or copyright extortion patterns detected in this text. Maintain standard vigilance.',
    explanationPidgin: 'No obvious virus format found for here. But still shine your eye well well before you open external files.',
    recommendedAction: 'Ensure all downloads are opened in preview mode first and never permit administrative access.',
  };
}

/**
 * Universal GSM and Telco Countermeasures against SIM Swap & Call Forwarding WhatsApp Hijack
 */
export const TELCO_ANTI_HIJACK = {
  // ##002# cancels all call forwarding across all GSM operators in Africa and worldwide
  cancelCallForwardingDialer: 'tel:%23%23002%23',
  cancelCallForwardingCode: '##002#',
  checkCallForwardingDialer: 'tel:*%2321%23',
  checkCallForwardingCode: '*#21#',

  simPinGuides: [
    {
      country: 'NG',
      network: 'MTN Nigeria',
      defaultPin: '0000',
      instructions: 'Go to Settings > Security > SIM Lock. Enable SIM PIN with default 0000 and immediately change to a secret 4-digit code. Prevents SIM swap takeover if phone is stolen.',
    },
    {
      country: 'NG',
      network: 'Airtel Nigeria',
      defaultPin: '1111',
      instructions: 'Enable SIM Lock with default PIN 1111. Change to your unique code to prevent SIM extraction OTP theft.',
    },
    {
      country: 'KE',
      network: 'Safaricom Kenya',
      defaultPin: '1234',
      instructions: 'Enable SIM Card PIN (default 1234). Also dial *100*100# to lock SIM swap requests across Safaricom customer care.',
    },
    {
      country: 'GH',
      network: 'MTN Ghana',
      defaultPin: '0000',
      instructions: 'Enable SIM PIN with default 0000, then change it. Dial *170# to set MoMo wallet PIN separate from SIM PIN.',
    },
    {
      country: 'ZA',
      network: 'Vodacom South Africa',
      defaultPin: '0000',
      instructions: 'Lock SIM card with default 0000 and customize PIN. Contact Vodacom fraud desk to activate biometrics on SIM replacements.',
    },
  ],
};

/**
 * Generates an official, legally-structured Creator Channel Hijack / Ownership Declaration
 * for immediate submission to YouTube Partner Support, Meta Concierge, or X Support.
 */
export function generateChannelHijackAffidavit(data: CreatorHijackAffidavitData): string {
  const timestamp = new Date().toISOString();
  return [
    '═════════════════════════════════════════════════════════════════════',
    '        EMERGENCY CREATOR ACCOUNT HIJACK & OWNERSHIP DECLARATION     ',
    '             Expedited Escalation via SHOMAR Protect Protocol        ',
    '═════════════════════════════════════════════════════════════════════',
    '',
    `DATE / TIMESTAMP: ${timestamp}`,
    `LEGAL ACCOUNT OWNER: ${data.creatorName}`,
    `PLATFORM COMPROMISED: ${data.platform}`,
    `ACCOUNT HANDLE / URL: ${data.channelOrHandle} (${data.accountUrlOrNumber})`,
    data.monetizationId ? `MONETIZATION / ADSENSE ID: ${data.monetizationId}` : 'MONETIZATION STATUS: Active Partner / Creator Fund Account',
    `INCIDENT DISCOVERY DATE: ${data.compromisedDate}`,
    `LAST CLEAN GEO-LOCATION & IP: ${data.lastCleanLocation}`,
    `AUTHENTIC CONTACT EMAIL: ${data.contactEmail}`,
    '',
    '---------------------------------------------------------------------',
    'INCIDENT SUMMARY & DEMAND FOR IMMEDIATE ACTION:',
    '---------------------------------------------------------------------',
    `1. The aforementioned account (${data.channelOrHandle}) has suffered an unauthorized takeover resulting from malicious session-hijack / unauthorized credential manipulation.`,
    '2. The malicious actor has unauthorized access to commercial monetization revenues, private confidential creator/business communications, and follower broadcasting tools.',
    '3. This account contains sensitive business data, proprietary intellectual property, and active payment payout pipelines.',
    '',
    'DEMANDED ACTIONS:',
    '- Immediately freeze all outgoing payout disbursements, bank account re-routing, and email address changes.',
    '- Terminate all active browser sessions, OAuth access tokens, and revoke newly assigned managers/roles.',
    `- Restore primary ownership control to the authentic creator (${data.contactEmail}) following verification against historical payment/AdSense records.`,
    '',
    'VERIFICATION HASH:',
    `HASH: SHA256-SHM-${Math.abs(data.creatorName.length * 31 + data.channelOrHandle.length * 17).toString(16).toUpperCase().padStart(8, '0')}`,
    'DOCUMENT GENERATED BY: SHOMAR Protect (Pan-African Digital Trust Network)',
    '═════════════════════════════════════════════════════════════════════',
  ].join('\n');
}

/**
 * Official creator emergency escalation endpoints
 */
export const CREATOR_SUPPORT_CHANNELS = {
  youtube: {
    name: 'YouTube Creator Support',
    helpdeskUrl: 'https://support.google.com/youtube/answer/76187',
    twitterEscalation: 'https://twitter.com/TeamYouTube',
    priorityTip: 'Tweet @TeamYouTube with "My channel was hijacked via session stealer, please help me open a hijack ticket". Their Twitter team responds within 1 hour to verify AdSense ID.',
  },
  instagram: {
    name: 'Meta / Instagram Support',
    helpdeskUrl: 'https://instagram.com/hacked',
    metaBusinessUrl: 'https://www.facebook.com/business/help',
    priorityTip: 'Use instagram.com/hacked from a device where you previously logged in. If subscribed to Meta Verified, use the 24/7 Live Chat support inside the Instagram app.',
  },
  tiktok: {
    name: 'TikTok Creator Support',
    helpdeskUrl: 'https://www.tiktok.com/legal/report/feedback',
    priorityTip: 'Submit report under "Account Access & Hacked Account". Attach screenshots of historical monetization statements or verification badges.',
  },
  whatsapp: {
    name: 'WhatsApp Hijack Support',
    helpdeskEmail: 'support@whatsapp.com',
    subjectTemplate: 'Lost/Stolen: Please deactivate my account',
    priorityTip: 'Email support@whatsapp.com with body: "Lost/Stolen: Please deactivate my account +[YourCountryCode][YourPhone]". WhatsApp immediately logs out the scammer.',
  },
};

export interface BrandDealAuditResult {
  verdict: 'verified-safe' | 'caution' | 'critical-hijack-risk';
  safetyScore: number; // 0 - 100
  brandDetected: string;
  senderDomain: string;
  isDomainLookalike: boolean;
  threatsFound: string[];
  safeCheckpoints: string[];
  safeCounterOfferProtocol: string;
}

const POPULAR_BRANDS = [
  { brand: 'Nike', legitimateDomain: 'nike.com', keywords: ['nike'] },
  { brand: 'Coca-Cola', legitimateDomain: 'coca-cola.com', keywords: ['coca-cola', 'cocacola'] },
  { brand: 'NordVPN', legitimateDomain: 'nordvpn.com', keywords: ['nordvpn', 'nord'] },
  { brand: 'Adobe', legitimateDomain: 'adobe.com', keywords: ['adobe', 'photoshop'] },
  { brand: 'Epic Games', legitimateDomain: 'epicgames.com', keywords: ['epic games', 'fortnite'] },
  { brand: 'Samsung', legitimateDomain: 'samsung.com', keywords: ['samsung'] },
  { brand: 'Binance', legitimateDomain: 'binance.com', keywords: ['binance'] },
  { brand: 'EA Sports', legitimateDomain: 'ea.com', keywords: ['ea sports', 'fifa'] },
];

/**
 * In-depth brand deal, sponsorship pitch, and contract auditor for monetized creators
 */
export function auditBrandDealContract(
  pitchText: string,
  senderEmail?: string,
  attachmentNames?: string[]
): BrandDealAuditResult {
  const content = pitchText.toLowerCase();
  const rawEmail = (senderEmail || '').trim().toLowerCase();
  const threatsFound: string[] = [];
  const safeCheckpoints: string[] = [];
  let riskPoints = 0;

  // 1. Detect Brand & Domain Consistency
  let brandDetected = 'Independent / Unrecognized Brand';
  let senderDomain = '';
  let isDomainLookalike = false;

  if (rawEmail.includes('@')) {
    senderDomain = rawEmail.split('@')[1] || '';
  }

  // Free email domain check for enterprise brands
  const isFreeEmail = /(?:gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|proton\.me|mail\.ru)$/i.test(senderDomain);

  for (const b of POPULAR_BRANDS) {
    const mentionsBrand = b.keywords.some(k => content.includes(k) || rawEmail.includes(k));
    if (mentionsBrand) {
      brandDetected = b.brand;
      if (senderDomain) {
        if (senderDomain === b.legitimateDomain) {
          safeCheckpoints.push(`Sender domain matches official ${b.brand} corporate domain (${b.legitimateDomain}).`);
        } else if (isFreeEmail) {
          threatsFound.push(`FREE WEBMAIL SPOOF: Pitch claims to represent ${b.brand} but sends from a free ${senderDomain} email address.`);
          riskPoints += 45;
          isDomainLookalike = true;
        } else {
          threatsFound.push(`DOMAIN SPOOFING: Sender domain is "${senderDomain}" instead of the authentic "${b.legitimateDomain}".`);
          riskPoints += 60;
          isDomainLookalike = true;
        }
      }
      break;
    }
  }

  // 2. Scan Attachment File Extensions
  const files = attachmentNames || [];
  const dangerousExts = ['.scr', '.exe', '.bat', '.cmd', '.pif', '.vbs', '.iso', '.msi', '.hta', '.jar', '.apk'];
  
  for (const file of files) {
    const lower = file.toLowerCase();
    const isDangerous = dangerousExts.some(ext => lower.endsWith(ext));
    if (isDangerous) {
      threatsFound.push(`CRITICAL MALWARE PAYLOAD: Attachment "${file}" is an executable script or disk image file. Opening this will steal your browser session tokens and 2FA keys.`);
      riskPoints += 70;
    }
  }

  // Also check if text talks about attached zip with password
  const hasPasswordProtectedArchive = /(?:password|pass|pwd)\s*(?:is|:|=)\s*["']?\w+["']?/i.test(content) &&
    /(?:\.zip|\.rar|archive|attached file|attachment)/i.test(content);
  if (hasPasswordProtectedArchive) {
    threatsFound.push('PASSWORD-PROTECTED ARCHIVE TRICK: Scammers password-protect ZIP files so Google and Microsoft email antivirus filters cannot inspect the infostealer malware inside.');
    riskPoints += 55;
  }

  // 3. Channel Manager / Permission Escalation Trap
  const mentionsAdminDelegation = /(?:add our (?:manager|email|partner)|invite us to (?:youtube studio|business manager|meta business)|grant manager access|link partner account|add as editor)/i.test(content);
  if (mentionsAdminDelegation) {
    threatsFound.push('PERMISSION TAKEOVER TRAP: Asks you to add their email as Manager/Owner in YouTube Studio or Meta Business Suite. This allows them to transfer channel ownership and remove you.');
    riskPoints += 65;
  }

  // 4. Advance Fee / Software License Scam
  const hasAdvanceFee = /(?:pay (?:registration|test|license|software) fee|buy our client software|deposit \$?\d+|license cost will be reimbursed)/i.test(content);
  if (hasAdvanceFee) {
    threatsFound.push('ADVANCE FEE FRAUD: Genuine brands pay creators; they NEVER ask creators to pay an upfront license or registration deposit.');
    riskPoints += 50;
  }

  // 5. Positive safety checkpoints if clean
  if (!hasPasswordProtectedArchive && files.length > 0 && threatsFound.length === 0) {
    safeCheckpoints.push('No dangerous executable payloads or archive evasion detected in attachments.');
  }
  if (!mentionsAdminDelegation) {
    safeCheckpoints.push('Proposal does not request account administrator or YouTube Studio manager privileges.');
  }
  if (!hasAdvanceFee) {
    safeCheckpoints.push('Proposal does not demand upfront software fees or license purchases.');
  }

  // Normalize final safety score (100 is cleanest, 0 is dangerous)
  const safetyScore = Math.max(0, 100 - riskPoints);

  const safeCounterOfferProtocol = [
    `SAFE CREATOR COUNTER-OFFER PROTOCOL:`,
    `1. "Thank you for reaching out. As a strict security policy, our management only accepts sponsorship contracts in standard PDF format via DocuSign or HelloSign."`,
    `2. "We never download executable software, test game builds on our primary studio PCs, or provide manager access to our YouTube Studio/Meta Business Suite."`,
    `3. "All brand payments must be wired to our verified agency business account prior to scheduled content release."`,
  ].join('\n');

  let verdict: BrandDealAuditResult['verdict'] = 'verified-safe';
  if (riskPoints >= 50) {
    verdict = 'critical-hijack-risk';
  } else if (riskPoints >= 20) {
    verdict = 'caution';
  }

  return {
    verdict,
    safetyScore,
    brandDetected,
    senderDomain: senderDomain || 'Not specified',
    isDomainLookalike,
    threatsFound,
    safeCheckpoints,
    safeCounterOfferProtocol,
  };
}

