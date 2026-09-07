export type Verdict = 'likely-scam' | 'suspicious' | 'uncertain' | 'no-signals';
export type CheckMode = 'message' | 'link' | 'screenshot';
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

export function validateInput(input: string, mode: CheckMode): string | null {
  const text = input.trim();
  if (!text) return mode === 'link' ? 'Paste the website link you want to check.' : 'Add the message you want to check.';
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
  const urls = mode === 'link' ? [new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)] : extractUrls(text);
  const add = (signal: Signal) => { if (!found.some(s => s.id === signal.id)) found.push(signal); };
  for (const url of urls) {
    if (url.protocol === 'http:') add({ id: 'http', title: 'The link uses an unencrypted connection', detail: 'An HTTP address does not encrypt information in transit. HTTPS alone would not prove the site is legitimate either.', weight: 1 });
    if (url.username || url.password) add({ id: 'userinfo', title: 'The link disguises its destination', detail: `Text before an @ sign can look like a trusted website. The actual destination is ${url.hostname}.`, weight: 3 });
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.startsWith('[')) add({ id: 'ip', title: 'A numeric address instead of a website name', detail: 'This link uses an IP address. That makes it harder to recognise who operates the website.', weight: 1 });
    if (url.hostname.includes('xn--')) add({ id: 'unicode', title: 'A domain that needs a closer look', detail: 'This address contains internationalised characters. They can be legitimate, but can also resemble another brand.', weight: 1 });
    if (['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy'].includes(url.hostname.replace(/^www\./, ''))) add({ id: 'shortened', title: 'The destination is hidden by a shortened link', detail: 'This check cannot expand shortened links. Verify the final destination independently before continuing.', weight: 1 });
    if (url.hostname.split('.').length > 4) add({ id: 'subdomain', title: 'An unusually complex website address', detail: 'Many subdomains can make the real owner difficult to recognise. A brand name at the beginning does not establish ownership.', weight: 1 });
  }
  const weight = found.reduce((sum, signal) => sum + signal.weight, 0);
  const verdict: Verdict = weight >= 4 ? 'likely-scam' : weight >= 1 ? 'suspicious' : mode === 'link' || text.length < 35 ? 'uncertain' : 'no-signals';
  const copy: Record<Verdict, [string, string]> = {
    'likely-scam': ['This looks like a scam', 'Strong warning signs were found. Pause before paying, sharing details, or following any instructions.'],
    suspicious: ['Take a closer look', 'Something here needs independent verification. A warning sign is not proof that a person or business is fraudulent.'],
    uncertain: ['We need more context', 'There is not enough evidence to judge this. A link alone cannot establish whether a website or payment request is genuine.'],
    'no-signals': ['No clear warning signs found', 'The available pattern checks did not find a warning. This is not a guarantee of safety or a verification of the sender.'],
  };
  return {
    verdict, title: copy[verdict][0], summary: copy[verdict][1], signals: found,
    actions: [found.some(s => s.id === 'secret') ? 'Keep passwords, PINs, and verification codes private. Enter them only in the official app or website you opened yourself.' : 'Contact the person or organisation through a contact method you already trust.', 'Open the official app or type the known website address yourself. Do not use contact details from the suspicious message.', 'Already clicked, paid, or shared information? Start a Cyber SOS guide for your situation.'],
    domains: [...new Set(urls.map(url => url.hostname))], checkedAt: new Date().toISOString(), mode,
  };
}
