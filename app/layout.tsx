import type { Metadata } from 'next';
import { Questrial, Syne } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const questrial = Questrial({
  subsets: ['latin'],
  variable: '--font-questrial',
  weight: ['400'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'CureBharat MLM Platform',
  description: 'Premium wellness insurance MLM management system',
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
    <html lang="en" className={`${questrial.variable} ${syne.variable}`}>
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
