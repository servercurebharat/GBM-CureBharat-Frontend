'use client';

import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-white/[0.05] rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-hcc border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold text-white tracking-widest uppercase">CureBharat</p>
          <p className="text-[10px] text-muted mt-1 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar role={user.role} user={user} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-hcc/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Topbar pageTitle={pageTitle} user={user} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-1">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
