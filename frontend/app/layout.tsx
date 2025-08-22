import { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Detoxir',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: [{ url: 'favicon.ico', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="favicon.ico" />
      </head>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
