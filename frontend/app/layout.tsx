// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./_shared/Header";
import Footer from "./_shared/Footer";

export const metadata: Metadata = {
  title: "Detoxir",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "favicon.ico", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        {/* 上の metadata.icons と重複しても動きますが、どちらか片方でOK */}
        <link rel="apple-touch-icon" sizes="180x180" href="favicon.ico" />
      </head>

      {/* 画面全体を「上=Header / 中=main / 下=Footer」の3段にする */}
      <body
        className="antialiased"
        style={{
          minHeight: "100dvh",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          background: "#1e1e1eff",
          color: "#fff",
        }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
