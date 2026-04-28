'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role, IUser } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';

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


export default function Sidebar({ role, user }: { role: Role; user: IUser }) {
  const pathname = usePathname();
  const sections = NAV_CONFIG[role];
  const color = ROLE_COLORS[role];

  return (
    <aside className="w-[260px] min-h-screen bg-[#131241] border-r border-white/5 flex flex-col flex-shrink-0 z-20">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#60A5FA] to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/20">
           <span className="text-white text-[11px] font-bold tracking-tighter">CB</span>
        </div>
        <div>
          <div className="font-bold text-base text-white uppercase tracking-tighter">
            Cure <span className="text-[#60A5FA]">Bharat</span>
          </div>
          <p className="text-[10px] text-[#94a3b8] mt-1 uppercase tracking-wider font-bold">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                    text-sm transition-all duration-200 relative group
                    ${isActive
                      ? 'text-white font-bold bg-indigo-600 shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {getIcon(item.icon, isActive ? '#ffffff' : '#94a3b8')}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.count && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-50 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.15em]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          System Status
        </button>
        <button 
          onClick={() => { /* logout logic */ }}
          className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.15em]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
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
  };

  return icons[name] || icons.grid;
}
