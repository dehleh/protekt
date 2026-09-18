import { checkThreatLedger } from './threat-ledger.ts';

export type Verdict = 'likely-scam' | 'suspicious' | 'uncertain' | 'no-signals';
export type CheckMode = 'message' | 'link' | 'screenshot' | 'vendor';
export type Signal = { id: string; title: string; detail: string; weight: number };
export type Assessment = { verdict: Verdict; title: string; summary: string; signals: Signal[]; actions: string[]; domains: string[]; checkedAt: string; mode: CheckMode };

export const MAX_INPUT = 12000;
const signals: { id: string; title: string; detail: string; weight: number; test: (text: string) => boolean }[] = [
  { id: 'secret', title: 'A request for private security details', detail: 'The message appears to ask you to share a password, PIN, OTP, or recovery code. These can give someone access to your account.', weight: 4, test: t => /\b(send|share|reply with|provide|tell me|forward|give me)\b.{0,65}\b(otp|one[- ]time (?:password|code)|password|pin|verification code|recovery code|six[- ]digit code|6[- ]digit code)\b/i.test(t) },
  { id: 'urgency', title: 'Pressure to act quickly', detail: 'Deadlines and threats of account closure can discourage you from checking a request independently.', weight: 1, test: t => /\b(urgent|immediately|act now|last chance|within \d+ (?:hours?|minutes?)|account (?:will be |has been )?(?:blocked|suspended|closed)|today only)\b/i.test(t) },
  { id: 'advance-fee', title: 'An upfront fee tied to a promised reward', detail: 'Paying a processing or activation fee to receive a prize, grant, job, or loan is a common scam pattern.', weight: 3, test: t => /\b(pay|send|transfer|deposit|fee|payment)\b/i.test(t) && /\b(processing|activation|registration|release|clearance)\b/i.test(t) && /\b(prize|grant|loan|job|employment|won|winning|reward|benefit)\b/i.test(t) },
  { id: 'returns', title: 'An unrealistic investment promise', detail: 'Guaranteed profit or a promise to quickly double your money is a strong warning sign. This check does not verify an investment provider.', weight: 4, test: t => /\b(guaranteed (?:profit|returns?|income)|double (?:your|the) money|risk[- ]free (?:investment|returns?)|\d{2,3}% (?:daily|weekly) (?:profit|returns?))\b/i.test(t) },
  { id: 'prize', title: 'An unexpected prize or giveaway', detail: 'A surprise reward can be used to prompt a payment or collect personal information. Verify the organiser through a separate channel.', weight: 1, test: t => /\b(you(?:'ve| have)? won|congratulations.{0,40}(?:selected|winner|won)|claim your (?:prize|reward|grant))\b/i.test(t) },
  { id: 'payment-proof', title: 'A payment notification needs independent verification', detail: 'A screenshot, SMS, or payment alert does not establish that money reached your account. Check your own bank app or statement before releasing goods.', weight: 1, test: t => /\b(credit alert|payment (?:receipt|confirmation)|transfer (?:receipt|successful)|release (?:the |your )?goods)\b/i.test(t) },
  { id: 'sideload', title: 'A request to install an app outside a store', detail: 'An APK or request to disable device protection can expose your device and accounts. No app file has been scanned here.', weight: 3, test: t => /(?:\.apk\b|\bdisable (?:play protect|antivirus|security)|\benable unknown sources)/i.test(t) },
  { id: 'identity-secret', title: 'A request for sensitive identity details', detail: 'BVN, NIN, card details, and banking credentials should not be sent in a message or entered through an unexpected link.', weight: 4, test: t => /\b(send|share|provide|submit|enter|verify|confirm|drop)\b.{0,70}\b(bvn|nin|card (?:number|details)|cvv|atm pin|bank login|internet banking password)\b/i.test(t) },
  { id: 'reversal', title: 'A payment reversal or refund story', detail: 'A stranger may claim they transferred money by mistake and pressure you to send it back. Confirm funds and instructions directly with your bank.', weight: 3, test: t => /\b(?:mistake(?:nly)?|wrongly|accidentally)\b.{0,60}\b(?:transfer|sent|credit)\b|\b(?:reverse|refund|send back)\b.{0,60}\b(?:transfer|money|funds?)\b/i.test(t) },
  { id: 'account-rental', title: 'A request to lend or rent an account', detail: 'Letting someone use your bank, wallet, SIM, or social account can expose you to theft, debt, or criminal activity.', weight: 4, test: t => /\b(?:rent|borrow|use)\b.{0,45}\b(?:bank account|wallet|sim|whatsapp|social media account)\b/i.test(t) },
  { id: 'pidgin-pressure', title: 'Pressure or secrecy in informal language', detail: 'The message uses pressure or secrecy that may be intended to stop you from checking with someone you trust.', weight: 1, test: t => /\b(?:no tell anybody|make you no tell|sharp sharp|do am now|send am now|na only today|your account go block|abeg hurry)\b/i.test(t) },
  { id: 'loan-harvest', title: 'A loan offer asking for money or private data first', detail: 'Unexpected loan approvals can be used to collect fees or identity details. Verify the lender independently before sharing anything.', weight: 3, test: t => /\b(?:loan|credit)\b.{0,70}\b(?:approved|offer|available)\b/i.test(t) && /\b(?:fee|bvn|nin|otp|deposit|processing)\b/i.test(t) },
  { id: 'nuban-harvest', title: 'A payment request to a personal or unfamiliar account', detail: 'The message includes a 10-digit account number paired with a payment request. Confirm the account name and purpose through official channels before transferring funds.', weight: 3, test: t => /\b(?:pay|send|transfer|deposit|credit)\b.{0,60}\b(?:acct|account|acc)\b.{0,30}\b\d{10}\b|\b\d{10}\b.{0,60}\b(?:pay|send|transfer|deposit|into this account|send the money)\b/i.test(t) },
  { id: 'chat-redirect', title: 'A redirect to a private chat for financial or work offers', detail: 'The message directs you to a WhatsApp or Telegram chat for loans, grants, jobs, or investment returns. Scammers frequently use chat apps to avoid institutional monitoring.', weight: 3, test: t => /(?:wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|telegram\.me\/)/i.test(t) && /\b(job|employment|grant|loan|investment|crypto|task|earn|income|profit|bonus|reward)\b/i.test(t) },
  { id: 'vendor-delivery', title: 'Demanding payment or delivery fee before dispatch', detail: 'The seller insists on full payment or a dispatch fee before sending the goods. Online social vendors who block customers after payment frequently use this tactic.', weight: 3, test: t => /\b(?:pay(?:ment)?|send|transfer)\b.{0,40}\b(?:delivery|waybill|dispatch|courier)\b.{0,30}\b(?:fee|money|first|before)\b|\b(?:delivery|waybill|dispatch)\b.{0,30}\b(?:fee\s*(?:first|before)|before dispatch|before delivery)\b|\bpay(?:ment)?\s+before\s+delivery\b/i.test(t) },
  { id: 'vendor-no-pod', title: 'Refusal of escrow or payment-on-delivery', detail: 'The seller explicitly refuses payment-on-delivery or neutral escrow. For unknown social media sellers, lack of escrow or physical store presence is a major risk indicator.', weight: 3, test: t => /\b(no pay on delivery|no payment on delivery|no pod|payment validates order|pay before delivery only|we do not do pod|we don't do pay on delivery)\b/i.test(t) },
  { id: 'vendor-discount', title: 'Unrealistically low price or extreme discount for luxury goods', detail: 'The offer advertises expensive smartphones, electronics, or designer goods at prices far below market value or extreme flash discounts. Unrealistic discounts on social media are almost always bait.', weight: 4, test: t => /\b(?:iphone|macbook|ps5|playstation\s*5|generator)\b.{0,60}(?:(?:₦\s*|naira\s*|[n₦]\s*|for\s*)?(?:[1-9]\d{1,2},000|1[0-5]\d,000)|\b(?:50|60|70|80|90)%\s*(?:off|discount)\b)/i.test(t) || /\b(?:flash sale|promo(?:tion)?|clearance)\b.{0,50}\b(?:50|60|70|80|90)%\s*(?:off|discount)\b/i.test(t) },
  { id: 'mpesa-fake-sms', title: 'A fake M-Pesa receipt or reversal request', detail: 'The message mimics a Safaricom M-Pesa confirmation or demands an immediate funds reversal. Never refund via your own PIN; contact Safaricom (234) to confirm genuine transactions.', weight: 4, test: t => /\b(?:confirmed\.?\s*(?:ksh|kes|\d+)|you have received\s*(?:ksh|kes|\d+))\b.{0,60}\b(?:mpesa|m-pesa|safaricom)\b|\b(?:reversal|reverse)\b.{0,50}\b(?:mpesa|m-pesa|fuliza|safaricom)\b/i.test(t) },
  { id: 'momo-pin-theft', title: 'A Mobile Money (MoMo) PIN or approval request', detail: 'The message demands your MoMo PIN, cash-out approval prompt, or asks for an agent verification fee. MTN and Telecel agents will never request your secret PIN.', weight: 4, test: t => /\b(?:momo|mobile money|mtn momo|vodafone cash|telecel cash)\b.{0,60}\b(?:pin|approval|approve prompt|cashout|cash out|agent fee)\b/i.test(t) },
  { id: 'eft-fake-proof', title: 'Demanding goods release on unverified proof of payment', detail: 'The buyer provides a Proof of Payment (POP) screenshot and pressures you to release goods or dispatch a courier before funds reflect in your account. Fake EFT alerts are common marketplace traps.', weight: 3, test: t => /\b(?:proof of payment|pop|payment receipt|deposit slip)\b/i.test(t) && /\b(?:capitec|fnb|standard bank|nedbank|absa|instant eft)\b/i.test(t) && /\b(?:release|courier|driver|dispatch|goods|send)\b/i.test(t) },
];

const KNOWN_FINTECHS: { brand: string; pattern: RegExp; officialDomains: string[] }[] = [
  { brand: 'OPay', pattern: /(?:^|\.)(?:[0o]pay|opay-?[\w-]*)\./i, officialDomains: ['opayweb.com', 'opay.ng'] },
  { brand: 'PalmPay', pattern: /(?:^|\.)(?:palmpay|palm-?pay|palmpay-?[\w-]*)\./i, officialDomains: ['palmpay.com'] },
  { brand: 'Kuda', pattern: /(?:^|\.)(?:kudabank|kuda-?[\w-]*)\./i, officialDomains: ['kuda.com'] },
  { brand: 'Moniepoint', pattern: /(?:^|\.)(?:moniepoint|monie-?point|moniepoint-?[\w-]*)\./i, officialDomains: ['moniepoint.com'] },
  { brand: 'GTBank', pattern: /(?:^|\.)(?:gtbank|gtb-?[\w-]*)\./i, officialDomains: ['gtbank.com'] },
  { brand: 'Zenith Bank', pattern: /(?:^|\.)(?:zenithbank|zenith-?[\w-]*)\./i, officialDomains: ['zenithbank.com'] },
  { brand: 'First Bank', pattern: /(?:^|\.)(?:firstbanknigeria|firstbank-?[\w-]*)\./i, officialDomains: ['firstbanknigeria.com'] },
  { brand: 'Access Bank', pattern: /(?:^|\.)(?:accessbankplc|accessbank-?[\w-]*)\./i, officialDomains: ['accessbankplc.com'] },
  { brand: 'Safaricom M-Pesa', pattern: /(?:^|\.)(?:safaricom|m-?pesa|fuliza-?[\w-]*)\./i, officialDomains: ['safaricom.co.ke'] },
  { brand: 'MTN MoMo', pattern: /(?:^|\.)(?:mtn-?momo|momo-?pay|mtn-?[\w-]*)\./i, officialDomains: ['mtn.com', 'mtn.com.gh', 'mtn.ng'] },
  { brand: 'Capitec Bank', pattern: /(?:^|\.)(?:capitec|capitec-?[\w-]*)\./i, officialDomains: ['capitecbank.co.za'] },
];

function positiveStatements(text: string) {
  return text.split(/(?<=[.!?\n])\s+/).filter(sentence => !/\b(never|do not|don't|avoid|beware|warning|should not|must not|no one should)\b/i.test(sentence)).join(' ');
}

function extractUrls(text: string): URL[] {
  const candidates = text.match(/(?:https?:\/\/|www\.)[^\s<>"']+/gi) ?? [];
  return candidates.slice(0, 20).flatMap(candidate => {
    try { return [new URL(candidate.replace(/[.,;!?)\]]+$/, '').replace(/^www\./i, 'https://www.'))]; } catch { return []; }
  });
}

export function detectCheckMode(input: string): CheckMode {
  const text = input.trim();
  if (/^(?:https?:\/\/|www\.)\S+$/i.test(text) || (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i.test(text) && !/\s/.test(text))) {
    return 'link';
  }
  if (/\b(pay(?:ment)?\s+before\s+delivery|no\s+pay\s+on\s+delivery|no\s+pod|delivery\s+fee|waybill|dispatch\s+fee|dm\s+to\s+order|flash\s+sale|promo\s+price|order\s+via\s+whatsapp|vendor|strictly\s+payment)\b/i.test(text)) {
    return 'vendor';
  }
  return 'message';
}

export function validateInput(input: string, mode: CheckMode): string | null {
  const text = input.trim();
  if (!text) return mode === 'link' ? 'Paste the website link you want to check.' : mode === 'vendor' ? 'Paste the vendor chat, product offer, or social media handle to check.' : 'Add the message you want to check.';
  if (text.length > MAX_INPUT) return 'Please check one message at a time, up to 12,000 characters.';
  if (mode === 'link') {
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || /\s/.test(text)) return 'Enter one complete website link, such as https://example.com.';
    } catch { return 'That link does not look complete. Check it and try again.'; }
  }
  return null;
}

export function assess(input: string, mode: CheckMode = 'message'): Assessment {
  const error = validateInput(input, mode);
  if (error) throw new Error(error);
  const text = input.trim();
  const statements = positiveStatements(text);
  const found: Signal[] = signals.filter(rule => rule.test(statements)).map(({ test, ...signal }) => signal);
  const add = (signal: Signal) => { if (!found.some(s => s.id === signal.id)) found.push(signal); };

  // On-device zero-knowledge threat ledger matching
  const match = checkThreatLedger(text);
  if (match) {
    add({
      id: 'threat-ledger-match',
      title: 'Flagged in SHOMAR Threat Ledger',
      detail: match.detail,
      weight: 4,
    });
  }

  const urls = mode === 'link' ? [new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)] : extractUrls(text);
  for (const url of urls) {
    if (url.protocol === 'http:') add({ id: 'http', title: 'The link uses an unencrypted connection', detail: 'An HTTP address does not encrypt information in transit. HTTPS alone would not prove the site is legitimate either.', weight: 1 });
    if (url.username || url.password) add({ id: 'userinfo', title: 'The link disguises its destination', detail: `Text before an @ sign can look like a trusted website. The actual destination is ${url.hostname}.`, weight: 3 });
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.startsWith('[')) add({ id: 'ip', title: 'A numeric address instead of a website name', detail: 'This link uses an IP address. That makes it harder to recognise who operates the website.', weight: 1 });
    if (url.hostname.includes('xn--')) add({ id: 'unicode', title: 'A domain that needs a closer look', detail: 'This address contains internationalised characters. They can be legitimate, but can also resemble another brand.', weight: 1 });
    if (['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'ow.ly', 'trib.al', 'cli.re', 's.id'].includes(url.hostname.replace(/^www\./, ''))) add({ id: 'shortened', title: 'The destination is hidden by a shortened link', detail: 'This check cannot expand shortened links. Verify the final destination independently before continuing.', weight: 1 });
    if (url.hostname.split('.').length > 4) add({ id: 'subdomain', title: 'An unusually complex website address', detail: 'Many subdomains can make the real owner difficult to recognise. A brand name at the beginning does not establish ownership.', weight: 1 });

    const hostLower = url.hostname.toLowerCase().replace(/^www\./, '');
    for (const item of KNOWN_FINTECHS) {
      if (item.pattern.test(hostLower) && !item.officialDomains.some(d => hostLower === d || hostLower.endsWith('.' + d))) {
        add({
          id: 'fintech-spoof',
          title: `A website mimicking ${item.brand}`,
          detail: `The address matches patterns often used to imitate ${item.brand}, but is not its official website (${item.officialDomains[0]}). Do not enter login details, OTP, or PIN here.`,
          weight: 4,
        });
      }
    }
  }
  const weight = found.reduce((sum, signal) => sum + signal.weight, 0);
  const verdict: Verdict = weight >= 4 ? 'likely-scam' : weight >= 1 ? 'suspicious' : mode === 'link' || text.length < 35 ? 'uncertain' : 'no-signals';
  const copy: Record<Verdict, [string, string]> = {
    'likely-scam': ['This looks like a scam', 'Strong warning signs were found. Pause before paying, sharing details, or following any instructions.'],
    suspicious: ['Take a closer look', 'Something here needs independent verification. A warning sign is not proof that a person or business is fraudulent.'],
    uncertain: ['We need more context', 'There is not enough evidence to judge this. A link alone cannot establish whether a website or payment request is genuine.'],
    'no-signals': ['No clear warning signs found', 'The available pattern checks did not find a warning. This is not a guarantee of safety or a verification of the sender.'],
  };

  const defaultActions = [
    found.some(s => s.id === 'secret') ? 'Keep passwords, PINs, and verification codes private. Enter them only in the official app or website you opened yourself.' : 'Contact the person or organisation through a contact method you already trust.',
    'Open the official app or type the known website address yourself. Do not use contact details from the suspicious message.',
    'Already clicked, paid, or shared information? Start a Cyber SOS guide for your situation.',
  ];

  const vendorActions = [
    'Never pay full price or delivery fees upfront to an unfamiliar social media vendor.',
    'Insist on verified payment-on-delivery or use a recognized escrow platform.',
    'Search the seller’s bank account number and phone number online to check for prior customer complaints.',
    'Already sent money? Open Cyber SOS immediately to access your bank’s USSD panic freeze code.',
  ];

  return {
    verdict,
    title: copy[verdict][0],
    summary: copy[verdict][1],
    signals: found,
    actions: mode === 'vendor' ? vendorActions : defaultActions,
    domains: [...new Set(urls.map(url => url.hostname))],
    checkedAt: new Date().toISOString(),
    mode,
  };
}
