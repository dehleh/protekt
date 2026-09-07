export type AppCategory = 'Social' | 'Identity' | 'Email' | 'Messaging' | 'Money';

export type ProtectedApp = {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  setupHref?: string;
};

export const appCategories: Array<AppCategory | 'All'> = ['All', 'Social', 'Identity', 'Email', 'Messaging', 'Money'];

export const protectedApps: ProtectedApp[] = [
  { id: 'instagram', name: 'Instagram', category: 'Social', description: 'Profile, direct messages, and creator access.', setupHref: 'https://help.instagram.com/566810106808145' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', description: 'Profile, direct messages, and creator access.', setupHref: 'https://support.tiktok.com/en/account-and-privacy/account-information/account-safety' },
  { id: 'snapchat', name: 'Snapchat', category: 'Social', description: 'Account access, messages, and public stories.', setupHref: 'https://help.snapchat.com/hc/en-us/articles/7012304746644' },
  { id: 'x', name: 'X', category: 'Social', description: 'Profile, direct messages, and public posts.', setupHref: 'https://help.x.com/en/safety-and-security/account-security-tips' },
  { id: 'facebook', name: 'Facebook', category: 'Social', description: 'Profile, Messenger access, and pages.', setupHref: 'https://www.facebook.com/help/213481848684090' },
  { id: 'google-account', name: 'Google Account', category: 'Identity', description: 'The recovery key for Gmail, YouTube, and other services.', setupHref: 'https://myaccount.google.com/security' },
  { id: 'apple-account', name: 'Apple Account', category: 'Identity', description: 'The identity behind iCloud, App Store, and iPhone access.', setupHref: 'https://support.apple.com/en-us/102543' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Messaging', description: 'Messages, calls, groups, and two-step verification.', setupHref: 'https://faq.whatsapp.com/1920866721452534/?locale=en_US' },
  { id: 'telegram', name: 'Telegram', category: 'Messaging', description: 'Messages, channels, groups, and active sessions.', setupHref: 'https://telegram.org/faq#security' },
  { id: 'gmail', name: 'Gmail', category: 'Email', description: 'Mail, recovery messages, and account reset links.', setupHref: 'https://support.google.com/accounts/answer/46526' },
  { id: 'outlook', name: 'Outlook', category: 'Email', description: 'Mail, recovery messages, and Microsoft account access.', setupHref: 'https://support.microsoft.com/account-billing/how-to-help-keep-your-microsoft-account-secure-f8b3d74c-9f9b-4d8e-9f8c-1a1f5c0f3f36' },
  { id: 'banking-app', name: 'Banking app', category: 'Money', description: 'Payments, transfers, and account alerts. Choose your bank separately.', },
  { id: 'mobile-money', name: 'Mobile money app', category: 'Money', description: 'Wallet balance, transfers, and payment approvals. Choose your provider separately.', },
];
