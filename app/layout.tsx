import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CureBharat GBM Platform',
  description: 'Premium wellness insurance GBM management system',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-[#0d0f14] text-[#e8eaf0] font-sans antialiased overflow-x-hidden">
        {/* Cashfree JS SDK — loaded after page is interactive */}
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="afterInteractive"
        />
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
