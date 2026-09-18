export type RecoveryStep = { title: string; body: string; action?: { label: string; href: string }; secondary?: { label: string; href: string } };
export type RecoveryGuide = { id: string; title: string; description: string; icon: 'message' | 'mail' | 'wallet' | 'phone' | 'link'; urgent: string; steps: RecoveryStep[]; source: { label: string; href: string } };

export const guides: RecoveryGuide[] = [
  { id: 'whatsapp', title: 'My WhatsApp was taken over', description: 'Regain access and warn your contacts.', icon: 'message', urgent: 'Keep all verification codes private. Only enter them inside the official WhatsApp app.', source: { label: 'WhatsApp Help Centre', href: 'https://faq.whatsapp.com/1131652977717250/?locale=en_US' }, steps: [
    { title: 'Register your number again', body: 'Open the official WhatsApp app and register your own phone number. Follow its verification prompts to regain access.', action: { label: 'Read WhatsApp recovery instructions', href: 'https://faq.whatsapp.com/1131652977717250/?locale=en_US' } },
    { title: 'Follow any recovery waiting period', body: 'If an unfamiliar two-step PIN blocks access, use the recovery options and waiting period shown by WhatsApp. Do not pay anyone claiming they can bypass this.' },
    { title: 'Warn the people who know you', body: 'Through another trusted channel, tell contacts to ignore unusual messages or money requests from your account.' },
    { title: 'Check linked devices and secure access', body: 'Once you are back in, review Linked devices and remove unfamiliar sessions. Enable two-step verification and add a recovery email you control.' },
  ] },
  { id: 'email', title: 'Someone accessed my email', description: 'Secure the account that connects everything.', icon: 'mail', urgent: 'Use a device you trust. Email access can also give someone a route into your other accounts.', source: { label: 'Google Account Help', href: 'https://support.google.com/accounts/answer/6294825' }, steps: [
    { title: 'Secure your sign-in', body: 'For a Google account, change your password if you still have access. If locked out, use official account recovery. For other providers, use their official recovery page.', action: { label: 'Google account recovery', href: 'https://accounts.google.com/signin/recovery' } },
    { title: 'Review access and settings', body: 'Check recent security events, signed-in devices, recovery details, and email forwarding. Remove changes and sessions you do not recognise.', action: { label: 'Google security settings', href: 'https://myaccount.google.com/security' } },
    { title: 'Secure connected accounts', body: 'Change reused passwords and review accounts that use this email for recovery. Tell your bank if financial information may be exposed.' },
    { title: 'Strengthen future sign-ins', body: 'Enable two-step verification or a passkey. Keep recovery options current and store backup codes somewhere safe outside this app.' },
  ] },
  { id: 'payment', title: 'I sent money to a suspected scammer', description: 'Contact your bank and preserve the details.', icon: 'wallet', urgent: 'Contact your bank or payment provider immediately through its official app or a number you already trust. Recovery is not guaranteed.', source: { label: 'CBN consumer guidance', href: 'https://www.cbn.gov.ng/supervision/cpdconedu.html' }, steps: [
    { title: 'Report the transaction now', body: 'Ask your bank or provider to investigate the suspected fraud and explain any available recall or account-protection options. Do not use a number from the suspicious message.' },
    { title: 'Keep the evidence', body: 'Save the transaction reference, amount, date, recipient details, and relevant messages. Ask for a complaint reference. Keep these records privately.' },
    { title: 'Prevent further loss', body: 'Stop further payments. If account details were exposed, ask your provider how to secure access. Avoid anyone requesting a fee to recover your money.' },
    { title: 'Follow up with your provider', body: 'Track your complaint through your provider. If unresolved, consult the current CBN complaints procedure.', action: { label: 'Read the CBN complaints procedure', href: 'https://www.cbn.gov.ng/Out/2022/CCD/CBN%20How%20to%20Lodge%20a%20Complaint.pdf' } },
  ] },
  { id: 'phone', title: 'My phone is lost or stolen', description: 'Use native recovery and secure your accounts.', icon: 'phone', urgent: 'Prioritise your physical safety. Do not confront a suspected thief or follow a location yourself.', source: { label: 'Apple and Google recovery guidance', href: 'https://support.apple.com/en-ie/120837' }, steps: [
    { title: 'Use the official device finder', body: 'Try Google Find Hub or Apple Find My from another trusted device. Locate or mark the phone as lost where available. This depends on prior setup and device support.', action: { label: 'Android: Find Hub', href: 'https://android.com/find' }, secondary: { label: 'iPhone: Find My', href: 'https://www.icloud.com/find' } },
    { title: 'Contact your mobile provider and bank', body: 'Ask your mobile provider about suspending the SIM and replacing it. Tell your bank the phone is missing, especially if it was unlocked.' },
    { title: 'Review sensitive account access', body: 'Use a trusted device to review email, messaging, and banking sessions. Follow your device maker’s instructions before changing finder settings or erasing the phone.' },
    { title: 'Keep ownership and incident records', body: 'Keep your purchase record and device identifier for appropriate reporting. On iPhone, do not remove the device from Find My; this removes Activation Lock.', action: { label: 'Apple stolen-device guidance', href: 'https://support.apple.com/en-ie/120837' }, secondary: { label: 'Google recovery guidance', href: 'https://support.google.com/android/answer/6160491' } },
  ] },
];

export const protectionTasks = [
  { id: 'email-2fa', title: 'Add a second step to email sign-in', description: 'Use two-step verification or a passkey on the email account you use for recovery.', category: 'Email', minutes: 3, href: 'https://myaccount.google.com/security', action: 'Open Google security' },
  { id: 'whatsapp-pin', title: 'Set your WhatsApp security PIN', description: 'In WhatsApp, open Settings → Account → Two-step verification. Add a recovery email you control.', category: 'WhatsApp', minutes: 2, href: 'https://faq.whatsapp.com/506595211487528/?locale=en_US', action: 'See WhatsApp instructions' },
  { id: 'recovery', title: 'Check your recovery options', description: 'Make sure your recovery phone and email still belong to you. Keep backup codes outside this app.', category: 'Accounts', minutes: 3, href: 'https://myaccount.google.com/security', action: 'Review recovery options' },
  { id: 'finder', title: 'Prepare for a missing phone', description: 'Check that your device finder is enabled and that you can sign in from another trusted device.', category: 'Device', minutes: 4, href: 'https://support.google.com/android/answer/3265955', action: 'Android setup guide', alternate: { href: 'https://support.apple.com/en-us/102648', label: 'iPhone setup guide' } },
  { id: 'lock', title: 'Strengthen your phone’s screen lock', description: 'Use a strong screen lock, keep the operating system updated, and hide sensitive notification previews.', category: 'Device', minutes: 2 },
  { id: 'bank', title: 'Save your bank’s official support details', description: 'Find the contact details inside your bank’s official app. Keep a copy somewhere you can reach if your phone goes missing.', category: 'Money', minutes: 2 },
] as const;

export const examples = [
  { label: 'A suspicious message', mode: 'message' as const, text: 'Congratulations! You have been selected for a business grant. Pay a processing fee of ₦5,000 to claim your reward. Act now — today only!' },
  { label: 'An account warning', mode: 'message' as const, text: 'URGENT: Your account will be blocked within 30 minutes. Send your OTP to our support agent immediately to keep your account active.' },
  { label: 'An investment offer', mode: 'message' as const, text: 'Join our investment group for guaranteed returns. Double your money this week with a one-time deposit. Act now!' },
  { label: 'Social commerce vendor', mode: 'vendor' as const, text: 'Flash sale 70% off brand new iPhone 15 Pro Max! DM to order on WhatsApp. Strictly payment before delivery, no pay on delivery accepted. Transfer ₦180,000 to OPay account 8012345678 to lock price.' },
];
