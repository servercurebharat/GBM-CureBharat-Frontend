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
    <header
      className="h-[68px] flex items-center px-6 md:px-8 gap-6 sticky top-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Page Title */}
      <div className="flex-shrink-0">
        <h1
          className="text-[17px] font-bold tracking-tight"
          style={{ color: '#0c1029', letterSpacing: '-0.02em' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative hidden md:block">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3c0' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium outline-none transition-all"
          style={{
            background: '#f0f1f7',
            border: '1px solid transparent',
            color: '#1a1d2e',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid rgba(99, 102, 241, 0.3)';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.08)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid transparent';
            e.target.style.background = '#f0f1f7';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right Side Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notification Bell */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all relative"
          style={{ color: '#6b7294' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f1f7';
            e.currentTarget.style.color = '#1a1d2e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7294';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)' }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ color: '#6b7294' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f1f7';
            e.currentTarget.style.color = '#1a1d2e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7294';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* Divider */}
        <div className="h-8 w-[1px] mx-2" style={{ background: 'rgba(0, 0, 0, 0.08)' }} />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold leading-none" style={{ color: '#1a1d2e' }}>{user.name}</p>
            <p
              className="text-[10px] mt-1 font-bold uppercase tracking-wider"
              style={{ color }}
            >
              {ROLE_TAGS[user.role]}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl overflow-hidden shadow-sm"
            style={{ border: '2px solid rgba(99, 102, 241, 0.15)' }}
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt="User"
              className="w-full h-full object-cover"
            />
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
