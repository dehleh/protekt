import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHOMAR Protect — Your everyday digital safety',
  description: 'Check suspicious messages and links, follow account-recovery guidance, and take simple steps to protect your digital life.',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  themeColor: '#0000FF',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={
          {
            '--font-geist-sans': "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            '--font-geist-mono': 'Consolas, monospace',
            fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
