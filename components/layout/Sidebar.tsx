'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role, IUser } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';

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
    ]},
    { label: 'Network', items: [
      { label: 'Users', href: '/admin/members', icon: 'users' },
      { label: 'User Details', href: '/admin/user-details', icon: 'user-search' },
      { label: 'Hierarchy Tree', href: '/admin/hierarchy', icon: 'git-branch' },
    ]},
    { label: 'Finance', items: [
      { label: 'Commission Engine', href: '/admin/commission-config', icon: 'settings' },
      { label: 'Payout Management', href: '/admin/payouts', icon: 'dollar' },
      { label: 'Wallet Ledger', href: '/admin/wallet-ledger', icon: 'wallet' },
      { label: 'Manual Adjustments', href: '/admin/manual-adjustments', icon: 'sliders' },
    ]},
    { label: 'Rules', items: [
      { label: 'Activity Rules', href: '/admin/activity-rules', icon: 'activity' },
      { label: 'Promotion Rules', href: '/admin/promotion-rules', icon: 'tag' },
    ]},
    { label: 'Compliance', items: [
      { label: 'KYC Management', href: '/admin/kyc', icon: 'shield' },
      { label: 'Audit Trail', href: '/admin/audit-trail', icon: 'clipboard' },
    ]},
    { label: 'Administration', items: [
      { label: 'Role Manager', href: '/admin/role-manager', icon: 'users-cog' },
      { label: 'Reports', href: '/admin/tax-reports', icon: 'file-text' },
      { label: 'State Performance', href: '/admin/state-performance', icon: 'map' },
    ]},
    { label: 'Products', items: [
      { label: 'Plans & Products', href: '/admin/plans', icon: 'package' },
      { label: 'Ranks', href: '/admin/ranks', icon: 'award' },
    ]},
    { label: 'E-Pin', items: [
      { label: 'Generate', href: '/admin/epins', icon: 'key' },
    ]},
  ],
  sh: [
    { label: 'Main', items: [
      { label: 'Dashboard', href: '/sh', icon: 'grid' },
      { label: 'Profile', href: '/sh/profile', icon: 'user' },
      { label: 'KYC', href: '/sh/kyc', icon: 'shield' },
    ]},
    { label: 'Network', items: [
      { label: 'Network Tree', href: '/sh/state-tree', icon: 'git-branch' },
      { label: 'Direct Team', href: '/sh/direct-team', icon: 'users' },
      { label: 'Team Performance', href: '/sh/team-performance', icon: 'bar-chart' },
    ]},
    { label: 'Sales', items: [
      { label: 'Sales Entry', href: '/sh/sales-entry', icon: 'plus-circle' },
      { label: 'My Sales', href: '/sh/my-sales', icon: 'list' },
    ]},
    { label: 'Finance', items: [
      { label: 'Wallet', href: '/sh/wallet', icon: 'wallet' },
      { label: 'Withdrawal', href: '/sh/withdrawal', icon: 'clock' },
      { label: 'Income Breakdown', href: '/sh/income', icon: 'pie-chart' },
      { label: 'Promotion Tracker', href: '/sh/ranks', icon: 'target' },
    ]},
    { label: 'System', items: [
      { label: 'Notification', href: '/sh/notifications', icon: 'bell' },
      { label: 'Support', href: '/sh/support', icon: 'help-circle' },
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

const ROLE_COLORS_LOCAL: Record<Role, string> = {
  admin: '#6029F1',
  sh: '#34d399',
  hba: '#fbbf24',
  hcm: '#f87171',
  hcc: '#60a5fa',
};

export default function Sidebar({ role, user }: { role: Role; user: IUser }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const sections = NAV_CONFIG[role];
  const color = ROLE_COLORS[role];

  return (
    <aside className="w-[260px] min-h-screen bg-[#131241] flex flex-col flex-shrink-0 z-20 border-r border-white/[0.05]">
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar pb-10">
        {sections.flatMap(section => section.items).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm transition-all duration-200 relative group
                ${isActive
                  ? 'bg-[#6029F1] text-white font-bold shadow-lg shadow-[#6029F1]/20'
                  : 'text-muted hover:text-white hover:bg-white/[0.03]'
                }
              `}
            >
              <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {getIcon(item.icon, isActive ? '#FFFFFF' : undefined)}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-white transition-colors group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          <span className="font-bold uppercase tracking-widest text-[10px]">System Status</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-hcm hover:text-red-400 transition-colors group border-t border-white/[0.05] pt-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="font-bold uppercase tracking-widest text-[10px]">Logout</span>
        </button>
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
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    'pie-chart': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
    target: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
    bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    'help-circle': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    package: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    'user-search': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M11 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>,
    sliders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>,
    tag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
    clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
    'users-cog': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><circle cx="19" cy="11" r="2"></circle><path d="M23 11h-2M19 9V7M17.5 9.5l1-1M17.5 12.5l1 1M21 13v-2M22.5 9.5l-1-1M22.5 12.5l-1 1"></path></svg>,
    map: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  };

  return icons[name] || icons.grid;
}
