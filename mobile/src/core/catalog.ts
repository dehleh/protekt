export type Category = 'Social' | 'Identity' | 'Email' | 'Messaging' | 'Money';
export const categories = ['All', 'Social', 'Identity', 'Email', 'Messaging', 'Money'] as const;
export const catalog: { id: string; name: string; category: Category; mark: string; color: string }[] = [
  { id: 'instagram', name: 'Instagram', category: 'Social', mark: 'IG', color: '#A63B7D' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', mark: 'Tk', color: '#172236' },
  { id: 'snapchat', name: 'Snapchat', category: 'Social', mark: 'Sc', color: '#8B6500' },
  { id: 'x', name: 'X', category: 'Social', mark: 'X', color: '#172236' },
  { id: 'facebook', name: 'Facebook', category: 'Social', mark: 'f', color: '#215DD2' },
  { id: 'google-account', name: 'Google Account', category: 'Identity', mark: 'G', color: '#3265B8' },
  { id: 'apple-account', name: 'Apple Account', category: 'Identity', mark: 'A', color: '#172236' },
  { id: 'gmail', name: 'Gmail', category: 'Email', mark: 'Gm', color: '#B53D32' },
  { id: 'outlook', name: 'Outlook', category: 'Email', mark: 'O', color: '#2168A5' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Messaging', mark: 'W', color: '#177C5B' },
  { id: 'telegram', name: 'Telegram', category: 'Messaging', mark: 'Tg', color: '#28799B' },
  { id: 'banking-app', name: 'Banking app', category: 'Money', mark: '₦', color: '#765629' },
  { id: 'mobile-money', name: 'Mobile money', category: 'Money', mark: '₦', color: '#765629' },
];
export const appTaskIds = ['sign-in', 'recovery', 'sessions'] as const;
export const appTasks = [
  { id: 'sign-in', title: 'Strengthen sign-in', body: 'Open this account’s security settings and enable two-step verification or a passkey where available.' },
  { id: 'recovery', title: 'Check recovery details', body: 'Make sure the recovery email and phone number still belong to you. Keep backup codes somewhere safe outside SHOMAR.' },
  { id: 'sessions', title: 'Review signed-in devices', body: 'In the official app, review active sessions and remove devices you do not recognise where this option is available.' },
] as const;
