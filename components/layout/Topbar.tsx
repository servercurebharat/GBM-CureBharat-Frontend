'use client';

import { IUser, Role } from '@/types';
import { useAuth } from '@/lib/auth';
import { ROLE_COLORS, ROLE_TAGS } from '@/lib/constants';



interface TopbarProps {
  pageTitle: string;
  user: IUser;
}

export default function Topbar({ pageTitle, user }: TopbarProps) {
  return (
    <header className="h-[90px] bg-[#131241] flex items-center px-10 gap-6 flex-shrink-0 z-20">
      {/* Left: Logo Section */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 flex items-center justify-center flex-shrink-0 overflow-hidden group cursor-pointer transition-all hover:scale-105 active:scale-95 relative -top-1">
           <img src="/image.png" alt="CureBharat Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col justify-center">
           <div className="font-display text-2xl font-black text-white tracking-[0.2em] leading-none uppercase">
             CUREBHARAT
           </div>
           <div className="text-[9px] font-black text-white/20 tracking-[0.4em] uppercase mt-2">
             Wellness Private Limited
           </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-end px-8">
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Global search..." 
            className="w-full bg-white rounded-md pl-10 pr-4 py-2 text-sm text-textDark font-medium placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-admin/50 transition-shadow"
          />
        </div>
      </div>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-5 ml-auto">
        <button className="text-white hover:text-admin transition-colors relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-hcm border-2 border-topbarBg" />
        </button>
        <button className="text-white hover:text-admin transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        <button className="text-white hover:text-admin transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </button>
        <div className="w-8 h-8 rounded-lg bg-surface2 border border-white/[0.1] flex items-center justify-center font-bold text-xs text-white uppercase ml-2 overflow-hidden shadow-sm">
           {user.name.slice(0, 1)}
        </div>
      </div>
    </header>
  );
}

function getCurrentCycleMonth(): string {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
}
