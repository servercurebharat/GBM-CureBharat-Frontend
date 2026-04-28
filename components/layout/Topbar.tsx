'use client';

import { IUser, Role } from '@/types';
import { useAuth } from '@/lib/auth';
import { ROLE_COLORS, ROLE_TAGS } from '@/lib/constants';



interface TopbarProps {
  pageTitle: string;
  user: IUser;
}

export default function Topbar({ pageTitle, user }: TopbarProps) {
  const { logout } = useAuth();
  const color = ROLE_COLORS[user.role];

  return (
    <header className="h-[70px] bg-[#131241] border-b border-white/5 flex items-center px-8 gap-8 sticky top-0 z-50">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tighter uppercase">
          {pageTitle}
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-auto relative hidden md:block">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder="Global search..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-[#60A5FA]/30 transition-all placeholder:text-[#64748B]"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center text-[#B5B8BD] hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[#B5B8BD] hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none">{user.name}</p>
            <p className="text-[10px] text-[#B5B8BD] mt-1 uppercase tracking-wider font-bold">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/10 shadow-sm ring-1 ring-white/5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
}

function getCurrentCycleMonth(): string {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
}
