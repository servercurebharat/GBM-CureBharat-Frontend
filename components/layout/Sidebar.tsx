'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role, IUser } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  count?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<Role, NavSection[]> = {
  admin: [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/admin', icon: 'grid' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'bar-chart' },
    ]},
    { label: 'Members', items: [
      { label: 'All Members', href: '/admin/members', icon: 'users' },
      { label: 'KYC Approval', href: '/admin/kyc', icon: 'shield' },
      { label: 'Ranks', href: '/admin/ranks', icon: 'award' },
    ]},
    { label: 'Finance', items: [
      { label: 'Payouts', href: '/admin/payouts', icon: 'dollar' },
      { label: 'Tax Reports', href: '/admin/tax-reports', icon: 'file-text' },
      { label: 'Commission', href: '/admin/commission-config', icon: 'settings' },
    ]},
    { label: 'E-Pin', items: [
      { label: 'Generate', href: '/admin/epins', icon: 'key' },
    ]},
  ],
  sh: [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/sh', icon: 'grid' },
      { label: 'State Revenue', href: '/sh/revenue', icon: 'bar-chart' },
    ]},
    { label: 'Network', items: [
      { label: 'State Tree', href: '/sh/state-tree', icon: 'git-branch' },
    ]},
  ],
  hba: [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/hba', icon: 'grid' },
    ]},
    { label: 'Network', items: [
      { label: 'My Tree', href: '/hba/network', icon: 'git-branch' },
    ]},
    { label: 'Finance', items: [
      { label: 'Override Income', href: '/hba/override-income', icon: 'layers' },
    ]},
  ],
  hcm: [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/hcm', icon: 'grid' },
    ]},
    { label: 'Team', items: [
      { label: 'Monitor', href: '/hcm/team-monitor', icon: 'activity' },
    ]},
  ],
  hcc: [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/hcc', icon: 'grid' },
    ]},
    { label: 'Sales', items: [
      { label: 'New Sale', href: '/hcc/new-sale', icon: 'plus-circle' },
      { label: 'History', href: '/hcc/sales', icon: 'list' },
    ]},
    { label: 'Finance', items: [
      { label: 'My Wallet', href: '/hcc/wallet', icon: 'wallet' },
      { label: 'Withdraw', href: '/hcc/withdraw', icon: 'arrow-up' },
    ]},
    { label: 'E-Pin', items: [
      { label: 'My Pins', href: '/hcc/epins', icon: 'key' },
    ]},
    { label: 'Account', items: [
      { label: 'KYC Status', href: '/hcc/kyc', icon: 'shield' },
    ]},
  ],
};

const ROLE_COLORS: Record<Role, string> = {
  admin: '#8b7cf8',
  sh: '#34d399',
  hba: '#fbbf24',
  hcm: '#f87171',
  hcc: '#60a5fa',
};

export default function Sidebar({ role, user }: { role: Role; user: IUser }) {
  const pathname = usePathname();
  const sections = NAV_CONFIG[role];
  const color = ROLE_COLORS[role];

  return (
    <aside className="w-[260px] min-h-screen bg-surface border-r border-white/[0.07] flex flex-col flex-shrink-0 z-20">
      <div className="px-6 py-8">
        <div className="font-display text-2xl font-bold text-white tracking-tighter">
          Cure<span style={{ color }}>Bharat</span>
        </div>
        <div className="text-[10px] text-muted mt-1 font-bold uppercase tracking-[0.2em] opacity-50">
          Management System
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] px-4 mb-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    text-sm transition-all duration-200 relative group
                    ${isActive
                      ? 'text-white font-bold'
                      : 'text-muted hover:text-white hover:bg-white/[0.03]'
                    }
                  `}
                  style={isActive ? {
                    backgroundColor: `${color}15`,
                    color,
                    boxShadow: `0 4px 20px -5px ${color}20`
                  } : {}}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {getIcon(item.icon, isActive ? color : undefined)}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-display"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate uppercase tracking-tight">{user.name}</div>
            <div className="text-[10px] text-muted font-mono">{user.memberId}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function getIcon(name: string, color: string = 'currentColor'): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    'bar-chart': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>,
    users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    award: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
    dollar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    'file-text': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    key: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2l.79.79m.35 1.35l.79.79m.35 1.35l.79.79m.35 1.35l.79.79M16.5 10.5l-3 3"></path></svg>,
    'git-branch': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>,
    layers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    'plus-circle': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
    list: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
    wallet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>,
    'arrow-up': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>,
  };

  return icons[name] || icons.grid;
}
