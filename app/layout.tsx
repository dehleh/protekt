import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHOMAR Protect — Your everyday digital safety',
  description: 'Check suspicious messages and links, follow account-recovery guidance, and take simple steps to protect your digital life.',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  themeColor: '#101f39',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{ '--font-geist-sans': "'Segoe UI', Arial, sans-serif", '--font-geist-mono': 'Consolas, monospace' } as React.CSSProperties}>{children}</body></html>;
}
