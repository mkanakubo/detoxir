import './globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased`}>
          <Toaster position="top-center" />
          {children}
      </body>
    </html>
  );
}
