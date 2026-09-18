/**
 * Native Android Ambient Scam Shield Service
 * 
 * Performs 0-click passive, zero-knowledge analysis of ambient notifications and SMS messages.
 * Evaluates messages 100% locally on-device without leaking message content to the network.
 */

import { assess, type Assessment } from '../../../lib/scam-engine.ts';
import { checkThreatLedger, type ThreatMatch } from '../../../lib/threat-ledger.ts';
import { getBanksByCountry, type BankPanicEntry } from '../../../lib/ussd-directory.ts';

export type AmbientAlertUrgency = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AmbientScamAlert {
  id: string;
  timestamp: string;
  urgency: AmbientAlertUrgency;
  title: string;
  summary: string;
  sourceApp?: string; // e.g. 'SMS', 'WhatsApp', 'Telegram'
  matchedThreat?: ThreatMatch | null;
  recommendedAction: string;
  panicDialUri?: string; // 1-tap USSD emergency panic code
}

/**
 * Scans an ambient message or notification text.
 * Returns an AmbientScamAlert if a scam or threat vector is identified, or null if benign.
 */
export function scanAmbientMessage(
  text: string,
  options: {
    country?: 'NG' | 'KE' | 'GH' | 'ZA';
    primaryBankId?: string;
    sourceApp?: string;
  } = {}
): AmbientScamAlert | null {
  const cleaned = text.trim();
  if (!cleaned || cleaned.length < 5) return null;

  const country = options.country || 'NG';

  // 1. Zero-Knowledge Threat Ledger lookup (accounts, numbers, links)
  const ledgerMatch = checkThreatLedger(cleaned);
  if (ledgerMatch && ledgerMatch.flagged) {
    const banks = getBanksByCountry(country);
    const bank = banks.find((b) => b.id === options.primaryBankId) || banks[0];

    return {
      id: `amb_${Date.now()}_threat`,
      timestamp: new Date().toISOString(),
      urgency: 'CRITICAL',
      title: '🚨 SHOMAR AMBIENT SHIELD: KNOWN THREAT DETECTED',
      summary: ledgerMatch.detail,
      sourceApp: options.sourceApp || 'Message/Notification',
      matchedThreat: ledgerMatch,
      recommendedAction: 'Do not click links or send funds. The sender/account is in the fraud ledger.',
      panicDialUri: bank?.dialUri,
    };
  }

  // 2. Scam Engine Heuristic Assessment
  const assessment: Assessment = assess(cleaned);

  // If likely scam or suspicious
  if (assessment.verdict === 'likely-scam' || (assessment.verdict === 'suspicious' && assessment.signals.length >= 2)) {
    const isOtpTheft = assessment.signals.some((s) => s.id === 'secret' || s.id === 'identity-secret' || s.id === 'momo-pin-theft');
    const isFakeDebit = assessment.signals.some((s) => s.id === 'receipt-claim' || s.id === 'mpesa-fake-sms' || s.id === 'eft-fake-proof');
    const banks = getBanksByCountry(country);
    const bank = banks.find((b) => b.id === options.primaryBankId) || banks[0];

    let urgency: AmbientAlertUrgency = assessment.verdict === 'likely-scam' ? 'CRITICAL' : 'WARNING';
    let title = '⚠️ SUSPICIOUS MESSAGE DETECTED';
    let recommendation = 'Pause before responding or transferring funds.';

    if (isOtpTheft) {
      urgency = 'CRITICAL';
      title = '🚨 OTP / PIN THEFT ATTEMPT DETECTED';
      recommendation = 'NEVER share your OTP, PIN, or password with anyone. Your bank will NEVER ask for it.';
    } else if (isFakeDebit) {
      urgency = 'CRITICAL';
      title = '⚠️ POTENTIAL FAKE DEBIT / REVERSAL NOTICE';
      recommendation = 'Log into your official banking app directly. Do not click links or dial numbers in this message.';
    }

    return {
      id: `amb_${Date.now()}_scan`,
      timestamp: new Date().toISOString(),
      urgency,
      title,
      summary: assessment.signals.map((s) => s.title).join(' • '),
      sourceApp: options.sourceApp || 'Incoming Notification',
      recommendedAction: recommendation,
      panicDialUri: bank?.dialUri,
    };
  }

  return null;
}
