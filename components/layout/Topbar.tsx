'use client';

import { IUser, Role } from '@/types';
import { useAuth } from '@/lib/auth';

const ROLE_COLORS: Record<Role, string> = {
  admin: '#8b7cf8',
  sh: '#34d399',
  hba: '#fbbf24',
  hcm: '#f87171',
  hcc: '#60a5fa',
};

const ROLE_TAG: Record<Role, string> = {
  admin: 'ADMINISTRATOR',
  sh: 'STATE HEAD',
  hba: 'HBA',
  hcm: 'HCM',
  hcc: 'HCC',
};

interface TopbarProps {
  pageTitle: string;
  user: IUser;
}

export default function Topbar({ pageTitle, user }: TopbarProps) {
  const { logout } = useAuth();
  const color = ROLE_COLORS[user.role];

  return (
    <header className="h-[70px] bg-surface/50 backdrop-blur-xl border-b border-white/[0.07] flex items-center px-8 gap-4 flex-shrink-0 sticky top-0 z-10">
      <h1 className="font-display text-lg font-bold text-white tracking-tight">
        {pageTitle}
      </h1>

      <div className="ml-auto flex items-center gap-4">
        {/* Cycle indicator */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] px-4 py-2 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-sh animate-pulse" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Cycle: {getCurrentCycleMonth()}
          </span>
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.06] transition-all relative group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-white"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-surface" style={{ backgroundColor: color }} />
        </button>

        {/* Role tag */}
        <div
          className="hidden sm:block text-[10px] font-bold px-4 py-2 rounded-full border tracking-[0.1em]"
          style={{
            backgroundColor: `${color}10`,
            borderColor: `${color}30`,
            color,
          }}
        >
          {ROLE_TAG[user.role]}
        </div>

        {/* Profile/Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-[11px] font-bold text-muted hover:text-white px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/[0.05]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          LOGOUT
        </button>
      </div>
    </header>
  );
}

function getCurrentCycleMonth(): string {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
}
