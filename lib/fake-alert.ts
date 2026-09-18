/**
 * SHOMAR Protect - Fake Bank Alert & Reversal SMS Verifier
 * 
 * Protects merchants, market traders, and individuals against the #1 financial fraud vector in Africa:
 * Spoofed SMS credit alerts, fake banking receipts, and fraudulent M-Pesa / Mobile Money reversal scams.
 */

export interface AlertFieldAnalysis {
  field: string;
  value: string;
  status: 'clean' | 'warning' | 'danger';
  detail: string;
}

export interface FakeAlertResult {
  verdict: 'likely-fake' | 'suspicious' | 'format-plausible';
  riskScore: number; // 0 - 100
  title: string;
  summary: string;
  senderHeader: string;
  detectedBank: string;
  parsedAmount?: string;
  parsedCurrency?: string;
  ussdVerifyCode?: string;
  ussdVerifyDialer?: string;
  threatFlags: string[];
  fieldChecks: AlertFieldAnalysis[];
  recommendationEn: string;
  recommendationPidgin: string;
}

export interface BankTemplate {
  bank: string;
  country: 'NG' | 'KE' | 'GH' | 'ZA';
  officialSenderTags: string[];
  ussdBalanceCode: string;
  refPattern?: RegExp;
}

export const SUPPORTED_BANKS: BankTemplate[] = [
  // Nigeria (NG)
  { bank: 'GTBank (Guaranty Trust)', country: 'NG', officialSenderTags: ['GTBANK', 'GTBank', 'GTCO'], ussdBalanceCode: '*737*6*1#', refPattern: /\b(?:\d{30}|REF:\w+)\b/i },
  { bank: 'Access Bank', country: 'NG', officialSenderTags: ['ACCESS', 'AccessBank', 'ACCESSBANK'], ussdBalanceCode: '*901*00#', refPattern: /\b\d{30}\b/ },
  { bank: 'Zenith Bank', country: 'NG', officialSenderTags: ['ZENITH', 'ZenithBank'], ussdBalanceCode: '*966*00#', refPattern: /\b\d{10,30}\b/ },
  { bank: 'First Bank of Nigeria', country: 'NG', officialSenderTags: ['FIRSTBANK', 'FirstBank'], ussdBalanceCode: '*894*00#', refPattern: /\b\d{10,30}\b/ },
  { bank: 'United Bank for Africa (UBA)', country: 'NG', officialSenderTags: ['UBA', 'UBAGroup'], ussdBalanceCode: '*919*00#', refPattern: /\b\d{10,30}\b/ },
  { bank: 'OPay', country: 'NG', officialSenderTags: ['OPAY', 'OPay'], ussdBalanceCode: '*955*0#', refPattern: /\b\d{10,20}\b/ },
  { bank: 'PalmPay', country: 'NG', officialSenderTags: ['PALMPAY', 'PalmPay'], ussdBalanceCode: '*861#', refPattern: /\b\d{10,20}\b/ },
  { bank: 'Kuda Bank', country: 'NG', officialSenderTags: ['KUDA', 'KudaBank'], ussdBalanceCode: '*894#', refPattern: /\b[a-zA-Z0-9-]{12,36}\b/ },

  // Kenya (KE)
  { bank: 'Safaricom M-Pesa', country: 'KE', officialSenderTags: ['MPESA', 'M-PESA'], ussdBalanceCode: '*334#', refPattern: /\b[A-Z0-9]{10}\b/ },
  { bank: 'Equity Bank', country: 'KE', officialSenderTags: ['EQUITY', 'EquityBank'], ussdBalanceCode: '*247#', refPattern: /\b\d{10,20}\b/ },
  { bank: 'KCB Bank', country: 'KE', officialSenderTags: ['KCB', 'KCBBank'], ussdBalanceCode: '*522#', refPattern: /\b\d{10,20}\b/ },

  // Ghana (GH)
  { bank: 'MTN Mobile Money (MoMo)', country: 'GH', officialSenderTags: ['MTNMOMO', 'MoMo', 'MTN-MoMo'], ussdBalanceCode: '*170#', refPattern: /\b\d{8,16}\b/ },
  { bank: 'Telecel Cash', country: 'GH', officialSenderTags: ['TELECEL', 'TelecelCash'], ussdBalanceCode: '*110#', refPattern: /\b\d{8,16}\b/ },

  // South Africa (ZA)
  { bank: 'Capitec Bank', country: 'ZA', officialSenderTags: ['CAPITEC', 'CapitecAlert'], ussdBalanceCode: '*120*3279#', refPattern: /\b\d{8,16}\b/ },
  { bank: 'FNB (First National Bank)', country: 'ZA', officialSenderTags: ['FNB', 'FNBalrt'], ussdBalanceCode: '*120*321#', refPattern: /\b\d{8,16}\b/ },
  { bank: 'Standard Bank ZA', country: 'ZA', officialSenderTags: ['STANLIB', 'StandardBank'], ussdBalanceCode: '*120*2345#', refPattern: /\b\d{8,16}\b/ },
];

/**
 * Parses and verifies an SMS credit alert or transaction text
 */
export function verifyBankAlert(text: string, declaredSender?: string): FakeAlertResult {
  const content = text.trim();
  const normalized = content.toLowerCase();
  const threatFlags: string[] = [];
  const fieldChecks: AlertFieldAnalysis[] = [];
  let riskScore = 0;

  // 1. Identify Sender Header
  let matchedBank: BankTemplate | undefined;
  const rawSender = declaredSender?.trim() || '';

  // Check if sender is a personal phone number (+234..., 080..., 07..., 09...)
  const isPersonalPhone = /^(?:\+?\d{10,14}|0[789][01]\d{8}|0[1-9]\d{8})$/.test(rawSender);
  if (isPersonalPhone) {
    threatFlags.push('ALERT SENT FROM A PERSONAL PHONE NUMBER: Genuine banks never send credit notifications from 11-digit GSM or international mobile numbers.');
    fieldChecks.push({
      field: 'Sender ID',
      value: rawSender,
      status: 'danger',
      detail: 'Personal telephone number detected. Legitimate bank SMS comes from an alphanumeric brand header (e.g. GTBANK, MPESA).'
    });
    riskScore += 65;
  } else if (rawSender) {
    matchedBank = SUPPORTED_BANKS.find(b => 
      b.officialSenderTags.some(tag => tag.toLowerCase() === rawSender.toLowerCase())
    );
    if (matchedBank) {
      fieldChecks.push({
        field: 'Sender ID',
        value: rawSender,
        status: 'clean',
        detail: `Matches official sender tag format for ${matchedBank.bank}.`
      });
    } else {
      fieldChecks.push({
        field: 'Sender ID',
        value: rawSender,
        status: 'warning',
        detail: 'Unrecognized sender header. Verify with bank official directory.'
      });
      riskScore += 15;
    }
  }

  // If no bank matched via sender, guess from content keywords
  if (!matchedBank) {
    matchedBank = SUPPORTED_BANKS.find(b => 
      b.officialSenderTags.some(tag => normalized.includes(tag.toLowerCase())) ||
      normalized.includes(b.bank.toLowerCase().split(' ')[0])
    );
  }

  // 2. Parse Transaction Amount and Currency
  const currencyMatch = content.match(/(?:NGN|KES|GHS|ZAR|USD|₦|KSh|GH₵|R)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
  let parsedAmount = currencyMatch ? currencyMatch[1] : undefined;
  let parsedCurrency = currencyMatch ? currencyMatch[0].replace(currencyMatch[1], '').trim() : undefined;
  if (!parsedCurrency && currencyMatch) {
    if (content.includes('NGN') || content.includes('₦')) parsedCurrency = 'NGN';
    else if (content.includes('KES') || content.includes('KSh')) parsedCurrency = 'KES';
    else if (content.includes('GHS') || content.includes('GH₵')) parsedCurrency = 'GHS';
    else if (content.includes('ZAR') || content.includes(' R ')) parsedCurrency = 'ZAR';
  }

  if (parsedAmount) {
    fieldChecks.push({
      field: 'Transaction Amount',
      value: `${parsedCurrency || ''} ${parsedAmount}`.trim(),
      status: 'clean',
      detail: 'Parsed transaction value.'
    });
  } else {
    fieldChecks.push({
      field: 'Transaction Amount',
      value: 'Not found',
      status: 'warning',
      detail: 'Missing standard structured amount notation.'
    });
    riskScore += 15;
  }

  // 3. Balance Arithmetic Integrity Check (Old Bal + Amount = New Bal)
  const numClean = (s: string) => parseFloat(s.replace(/,/g, ''));
  const balMatches = content.match(/(?:bal(?:ance)?|available|avail\.?\s*bal)(?:\s*(?:is|:|=))?\s*(?:NGN|KES|GHS|ZAR|USD|₦|KSh|GH₵|R)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/gi);
  
  if (balMatches && balMatches.length >= 2 && parsedAmount) {
    try {
      const numbers = balMatches.map(m => {
        const match = m.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/);
        return match ? numClean(match[1]) : 0;
      });
      const creditVal = numClean(parsedAmount);
      // Check if numbers[0] + creditVal approx equals numbers[1] or vice versa
      const diff1 = Math.abs((numbers[0] + creditVal) - numbers[1]);
      const diff2 = Math.abs((numbers[1] + creditVal) - numbers[0]);
      if (diff1 > 1.0 && diff2 > 1.0) {
        threatFlags.push('MATHEMATICAL ARITHMETIC DISCREPANCY: The old balance, credit amount, and new balance in this SMS do not add up.');
        fieldChecks.push({
          field: 'Balance Arithmetic',
          value: 'Mismatch detected',
          status: 'danger',
          detail: 'Calculated balances do not match the credited amount. Scammers frequently make arithmetic errors in fake templates.'
        });
        riskScore += 45;
      } else {
        fieldChecks.push({
          field: 'Balance Arithmetic',
          value: 'Consistent',
          status: 'clean',
          detail: 'Balance arithmetic is mathematically consistent.'
        });
      }
    } catch {
      // ignore arithmetic parse failure
    }
  }

  // 4. Fake Reversal / Accidental Overpayment Threat
  const isReversalDemanded = /(?:sent by mistake|overpaid|refund me|mistakenly credited|transfer back|reverse (?:the )?funds|refund the difference|my boss will kill me)/i.test(normalized);
  if (isReversalDemanded) {
    threatFlags.push('REVERSAL SCAM PATTERN: Message contains urgent demands for a refund due to an alleged "mistaken transfer". Never refund funds until you physically verify balance with your bank.');
    fieldChecks.push({
      field: 'Reversal Claim',
      value: 'High Urgency Refund Request',
      status: 'danger',
      detail: 'Classic fake alert reversal scam. Criminals send a fake credit alert and then panic the victim into sending real money back.'
    });
    riskScore += 50;
  }

  // 5. NIBSS / M-Pesa Session Reference Check
  const hasNibssOrSession = /(?:session id|ref:|txid|transaction id|txn ref|nibss|m-pesa code|ref no)\s*[:=]?\s*([a-z0-9-]{8,36})/i.test(normalized);
  if (hasNibssOrSession) {
    fieldChecks.push({
      field: 'Transaction Reference',
      value: 'Present',
      status: 'clean',
      detail: 'Standard transaction reference / session ID format identified.'
    });
  } else {
    threatFlags.push('MISSING OFFICIAL TRANSACTION HASH: Authentic bank notifications always contain an automated audit session ID or NIBSS/M-Pesa code.');
    fieldChecks.push({
      field: 'Transaction Reference',
      value: 'Missing or malformed',
      status: 'warning',
      detail: 'Official financial institutions include an immutable transaction hash for interbank reconciliation.'
    });
    riskScore += 20;
  }

  // 6. Spelling, Grammar, and Formatting Flaws
  const hasGrammarFlaws = /(?:ur acc|am credited|your account has been credited with sum of|kindly release|plz confirm|congratulation your account)/i.test(normalized);
  if (hasGrammarFlaws) {
    threatFlags.push('INFORMAL / POOR GRAMMAR: Message uses informal slang or grammar unusual for automated core banking engines.');
    fieldChecks.push({
      field: 'Grammar & Tone',
      value: 'Informal / Irregular',
      status: 'warning',
      detail: 'Automated bank notification systems generate standardized, grammatically strict templates.'
    });
    riskScore += 25;
  }

  // Normalize final score
  riskScore = Math.min(riskScore, 100);

  const detectedBankName = matchedBank ? matchedBank.bank : 'General Financial Institution';
  const ussdCode = matchedBank ? matchedBank.ussdBalanceCode : '*384*746#';
  const ussdDialer = `tel:${encodeURIComponent(ussdCode)}`;

  if (riskScore >= 50) {
    return {
      verdict: 'likely-fake',
      riskScore,
      title: '🚨 HIGH RISK: LIKELY FAKE BANK ALERT',
      summary: `This SMS shows severe hallmarks of a fraudulent credit alert. DO NOT release goods, transfer refunds, or provide services based on this notification.`,
      senderHeader: rawSender || 'Unknown',
      detectedBank: detectedBankName,
      parsedAmount,
      parsedCurrency,
      ussdVerifyCode: ussdCode,
      ussdVerifyDialer: ussdDialer,
      threatFlags,
      fieldChecks,
      recommendationEn: `STOP! Do not release goods or refund money. Dial your bank's official balance check code (${ussdCode}) or open your official banking app directly. Only trust the cleared balance inside your own banking app.`,
      recommendationPidgin: `HOLD ON O! No give dem any market or send any money back! Dis credit alert na wash (419). Dial your bank USSD (${ussdCode}) or open your official bank app make you see your real balance first!`,
    };
  }

  if (riskScore >= 20) {
    return {
      verdict: 'suspicious',
      riskScore,
      title: '⚠️ SUSPICIOUS: UNVERIFIED TRANSACTION NOTIFICATION',
      summary: `Some elements of this notification are irregular or unverified. Verify your live account balance through your bank's official channels before proceeding.`,
      senderHeader: rawSender || 'Unknown',
      detectedBank: detectedBankName,
      parsedAmount,
      parsedCurrency,
      ussdVerifyCode: ussdCode,
      ussdVerifyDialer: ussdDialer,
      threatFlags,
      fieldChecks,
      recommendationEn: `Pause and verify your account balance independently using your bank USSD (${ussdCode}) or official mobile banking app. Never rely purely on an incoming SMS as proof of cleared payment.`,
      recommendationPidgin: `Dey careful! Shine your eye well well. Check your bank app or dial ${ussdCode} make you confirm whether the money land true true before you deliver goods.`,
    };
  }

  return {
    verdict: 'format-plausible',
    riskScore,
    title: '🟢 FORMAT APPEARS PLAUSIBLE (STILL REQUIRE APP CONFIRMATION)',
    summary: `The text formatting conforms to typical automated banking notices, but SMS spoofing can never be fully ruled out from text alone. Always confirm live balance in your official banking app.`,
    senderHeader: rawSender || 'Official Tag',
    detectedBank: detectedBankName,
    parsedAmount,
    parsedCurrency,
    ussdVerifyCode: ussdCode,
    ussdVerifyDialer: ussdDialer,
    threatFlags: [],
    fieldChecks,
    recommendationEn: `The layout matches standard templates. As a strict security policy, always confirm that funds appear as "Cleared / Available Balance" in your banking app before handing over high-value goods.`,
    recommendationPidgin: `The template look correct, but SMS fit be setup. Always open your bank app make you be 100% sure the money enter your available balance before you release goods.`,
  };
}
