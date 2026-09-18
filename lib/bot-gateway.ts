import { assess, type Assessment } from './scam-engine.ts';
import { VERNACULAR_GUIDANCE, type SupportedLanguage } from './vernacular.ts';

export type InboundPayload = {
  senderId: string;
  text: string;
  language?: SupportedLanguage;
};

export type BotReply = {
  recipientId: string;
  message: string;
  assessment?: Assessment;
  language: SupportedLanguage;
};

const LANGUAGE_COMMANDS: Record<string, SupportedLanguage> = {
  pidgin: 'Pidgin assist',
  naija: 'Pidgin assist',
  hausa: 'Hausa',
  yoruba: 'Yoruba',
  igbo: 'Igbo',
  english: 'English',
};

export function processInboundMessage(payload: InboundPayload): BotReply {
  const raw = payload.text.trim();
  const lower = raw.toLowerCase();
  let lang: SupportedLanguage = payload.language ?? 'English';

  // Check language change commands
  if (LANGUAGE_COMMANDS[lower]) {
    lang = LANGUAGE_COMMANDS[lower];
    const guidance = VERNACULAR_GUIDANCE[lang]['no-signals'];
    return {
      recipientId: payload.senderId,
      language: lang,
      message: `✅ Language set to ${lang}.\n\nForward any suspicious message, link, or payment request here to check it instantly.`,
    };
  }

  // Check SOS commands
  if (['sos', 'help', 'hacked', 'scammed', 'emergency'].includes(lower)) {
    return {
      recipientId: payload.senderId,
      language: lang,
      message: [
        '🛡️ *SHOMAR CYBER SOS*',
        'Take a breath. Here are the immediate steps:',
        '',
        '1. *Lost Money?* Contact your bank immediately via their official mobile app or verified hotline to request a recall.',
        '2. *WhatsApp Hacked?* Re-register your phone number in WhatsApp now. Never share 6-digit codes.',
        '3. *Compromised Email?* Sign in from a trusted device and change your password, then terminate active sessions.',
        '',
        'Do not pay anyone claiming they can hack back your account or recover your funds for an upfront fee.',
        'For guided recovery checklists, visit: https://protect.shomar.io/#sos',
      ].join('\n'),
    };
  }

  // Assess content
  const mode = /^https?:\/\/\S+$/i.test(raw) ? 'link' : 'message';
  let assessment: Assessment;
  try {
    assessment = assess(raw, mode);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Please check your text and try again.';
    return {
      recipientId: payload.senderId,
      language: lang,
      message: `⚠️ *SHOMAR Protect*: ${errorMsg}\n\nTip: You can paste a suspicious message or a website link. Leave out passwords, PINs, and personal OTPs.`,
    };
  }

  const localized = VERNACULAR_GUIDANCE[lang][assessment.verdict];
  const trafficHeader =
    assessment.verdict === 'likely-scam'
      ? '🛑 *STOP. DO NOT SEND MONEY OR CODES.*'
      : assessment.verdict === 'suspicious'
      ? '⚠️ *WAIT. PAUSE & VERIFY BEFORE PAYING.*'
      : assessment.verdict === 'uncertain'
      ? '🔍 *MORE INFORMATION NEEDED.*'
      : '🟢 *NO CLEAR WARNING SIGNS FOUND.*';

  const lines: string[] = [
    `🛡️ *SHOMAR Protect*`,
    trafficHeader,
    `*${assessment.title}*`,
    '',
    `💬 *Guidance (${lang})*:`,
    localized.advice,
    '',
    `⚡ *Top Action*: ${assessment.actions[0] || 'Do not send OTPs or money.'}`,
  ];

  if (assessment.signals.length > 0) {
    lines.push('', `🔍 *Key Warning Signs:*`);
    for (const signal of assessment.signals.slice(0, 3)) {
      lines.push(`• ${signal.title}`);
    }
  }

  lines.push(
    '',
    '🔒 *Privacy Notice*: Checked in ephemeral memory. No data stored. For panic bank freeze, reply *SOS*.'
  );

  return {
    recipientId: payload.senderId,
    language: lang,
    assessment,
    message: lines.join('\n'),
  };
}
