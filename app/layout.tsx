import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'CureBharat MLM Platform',
  description: 'Premium wellness insurance MLM management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable}`}>
      <body className="bg-[#0d0f14] text-[#e8eaf0] font-sans antialiased overflow-x-hidden">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
