import { checkThreatLedger } from '../../../lib/threat-ledger.ts';
import { BANK_PANIC_DIRECTORY } from '../../../lib/ussd-directory.ts';

/**
 * Production-ready Telco USSD Webhook Handler (*384*746#)
 * Compliant with Africa's Talking, Twilio, and telco USSD aggregator specs.
 * Enables zero-internet 2G button phone users to check scam accounts and freeze banks.
 */
export async function POST(req: Request) {
  try {
    let text = '';
    let phoneNumber = '';
    let sessionId = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      text = String(formData.get('text') || '').trim();
      phoneNumber = String(formData.get('phoneNumber') || '').trim();
      sessionId = String(formData.get('sessionId') || '').trim();
    } else {
      const body = (await req.json().catch(() => ({}))) as Record<string, any>;
      text = String(body.text || '').trim();
      phoneNumber = String(body.phoneNumber || '').trim();
      sessionId = String(body.sessionId || '').trim();
    }

    const segments = text ? text.split('*') : [];
    const step = segments[0] || '';

    // Root Menu
    if (segments.length === 0 || text === '') {
      const response = [
        'CON SHOMAR Protect (Pan-African Digital Trust)',
        '1. Check Account / Till Number',
        '2. Check Phone Number',
        '3. Emergency Bank Freeze Codes',
        '4. Vernacular Helpline',
      ].join('\n');
      return new Response(response, { headers: { 'Content-Type': 'text/plain' } });
    }

    // Option 1: Check Account Number or Till
    if (step === '1') {
      if (segments.length === 1) {
        return new Response(
          'CON Enter the 10-digit NUBAN account or M-Pesa Till number to verify:',
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      const target = segments[1].trim();
      const match = checkThreatLedger(target);
      if (match && match.flagged) {
        return new Response(
          `END 🛑 SHOMAR ALERT: ${target} is flagged in prior fraud reports! DO NOT TRANSFER FUNDS. Dial 3 for bank freeze.`,
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      return new Response(
        `END 🟢 SHOMAR: No scam records found for ${target}. Confirm recipient name before transferring.`,
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }

    // Option 2: Check Phone Number
    if (step === '2') {
      if (segments.length === 1) {
        return new Response(
          'CON Enter the phone number to check (e.g. 08021112233):',
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      const phone = segments[1].trim();
      const match = checkThreatLedger(phone);
      if (match && match.flagged) {
        return new Response(
          `END 🛑 SHOMAR ALERT: ${phone} has been reported for impersonation or fake receipts. Block this caller.`,
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      return new Response(
        `END 🟢 SHOMAR: No scam reports for ${phone}. Never share OTPs or passwords on calls.`,
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }

    // Option 3: Emergency Bank Freeze Directory
    if (step === '3') {
      if (segments.length === 1) {
        return new Response(
          [
            'CON SELECT YOUR COUNTRY:',
            '1. Nigeria 🇳🇬',
            '2. Kenya 🇰🇪',
            '3. Ghana 🇬🇭',
            '4. South Africa 🇿🇦',
          ].join('\n'),
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }

      const countryChoice = segments[1];
      if (countryChoice === '1') {
        return new Response(
          [
            'END 🚨 NIGERIA EMERGENCY FREEZE:',
            'Access: *901*911#',
            'GTBank: *737*51*74#',
            'Zenith: *966*911#',
            'FirstBank: *894*911#',
            'UBA: *919*911#',
            'OPay: *955*1310#',
            'Moniepoint: *5573*911#',
          ].join('\n'),
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      if (countryChoice === '2') {
        return new Response(
          [
            'END 🚨 KENYA EMERGENCY FREEZE:',
            'M-Pesa SIM Lock: *100*100#',
            'Equity Bank: *247#',
            'KCB Bank: *522#',
            'Co-op Bank: *667#',
            'Safaricom Support: Call 234',
          ].join('\n'),
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      if (countryChoice === '3') {
        return new Response(
          [
            'END 🚨 GHANA EMERGENCY FREEZE:',
            'MTN MoMo: *170# (My Wallet -> Reset PIN)',
            'Telecel Cash: *110#',
            'GCB Bank: *422#',
            'MoMo Fraud Helpline: 100',
          ].join('\n'),
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }
      if (countryChoice === '4') {
        return new Response(
          [
            'END 🚨 SOUTH AFRICA FREEZE:',
            'Capitec: *120*3279#',
            'FNB: *120*321#',
            'Standard Bank: *120*2345#',
            'Nedbank: *120*001#',
          ].join('\n'),
          { headers: { 'Content-Type': 'text/plain' } }
        );
      }

      return new Response('END Invalid country selection. Try again with *384*746#.', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Option 4: Vernacular Helpline
    if (step === '4') {
      return new Response(
        [
          'END 💬 SHOMAR VERNACULAR HELPLINE:',
          'Pidgin: No share your PIN or OTP give anybody!',
          'Hausa: Kada ka taba ba kowa lambar sirri ko OTP!',
          'Yoruba: Ma se fi PIN tabi koodu re han enikeni!',
          'Igbo: Enyela onye ọ bụla PIN ma ọ bụ koodu gị!',
          'Web: protect.shomar.io',
        ].join('\n'),
        { headers: { 'Content-Type': 'text/plain' } }
      );
    }

    return new Response('END Unknown option. Please redial *384*746#.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return new Response('END Service temporarily unavailable. Please try again.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
