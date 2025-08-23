// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "./_shared/Header";
import Footer from "./_shared/Footer";

export const metadata: Metadata = {
  title: "Detoxir",
  manifest: "/manifest.json",
  icons: {
    icon: "/detoxir/logo.webp",
    apple: [{ url: "/detoxir/logo.webp", sizes: "180x180" }],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        {/* 上の metadata.icons と重複しても動きますが、どちらか片方でOK */}
        <link rel="apple-touch-icon" sizes="180x180" href="/detoxir/logo.webp" />
      </head>

      {/* 画面全体を「上=Header / 中=main / 下=Footer」の3段にする */}
      <body
        className="antialiased bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
        style={{
          minHeight: "100dvh",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#F1F5F9',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F1F5F9',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F1F5F9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
