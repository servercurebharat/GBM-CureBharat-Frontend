import type { Metadata } from 'next';
import { Questrial } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const questrial = Questrial({ 
  subsets: ['latin'],
  variable: '--font-questrial',
  weight: '400',
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
    <html lang="en" className={questrial.variable}>
      <body className="bg-[#0d0f14] text-[#e8eaf0] font-sans antialiased overflow-x-hidden">
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
