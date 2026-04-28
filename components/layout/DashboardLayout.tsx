'use client';

import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_COLORS } from '@/lib/constants';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function DashboardLayout({
  children,
  pageTitle
}: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#f4f6fb' }}>
        <div className="relative w-14 h-14">
          <div className="absolute top-0 left-0 w-full h-full border-[3px] border-[#e8eaf0] rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-[3px] border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold tracking-widest uppercase" style={{ color: '#1a1d2e' }}>Cure Bharat</p>
          <p className="text-[11px] mt-1.5 font-medium tracking-wider" style={{ color: '#6b7294' }}>Securing session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f6fb' }}>
      {/* Sidebar */}
      <Sidebar role={user.role} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar pageTitle={pageTitle} user={user} />

        {/* Content — White Background */}
        <main
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ background: '#f4f6fb' }}
        >
          <div className="dashboard-page max-w-[1440px] mx-auto px-6 md:px-8 py-6 md:py-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
