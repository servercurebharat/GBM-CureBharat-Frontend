'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import WalletCard from '@/components/ui/WalletCard';
import MiniBarChart from '@/components/ui/MiniBarChart';
import TeamMemberTable from '@/components/ui/TeamMemberTable';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { walletAPI, usersAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale, ITreeNode } from '@/types';
import { HBA_MONTHLY_PERFORMANCE } from '@/lib/mockData';
import AddMemberModal from '@/components/dashboard/AddMemberModal';

export default function HbaDashboard() {
  return (
    <Suspense fallback={null}>
      <HbaDashboardContent />
    </Suspense>
  );
}

function HbaDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [networkMembers, setNetworkMembers] = useState<ITreeNode[]>([]);
  const [recentSales, setRecentSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  const color = '#3b82f6'; // HBA Blue

  useEffect(() => {
    async function fetchData() {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const [walletRes, downlineRes, salesRes] = await Promise.all([
          walletAPI.getMyWallet(),
          usersAPI.getDownline(user._id),
          salesAPI.getAll({ page: 1, limit: 5 }),
        ]);

        if (walletRes.data.success) setWallet(walletRes.data.data || null);
        if (downlineRes.data.success && downlineRes.data.data?.children) {
          setNetworkMembers(downlineRes.data.data.children);
        }
        if (salesRes.data.success) setRecentSales(salesRes.data.data || []);
      } catch (err) {
        console.error('HBA Dashboard data fetch failed', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?._id]);

  useEffect(() => {
    if (searchParams.get('enroll') === 'true') setIsModalOpen(true);
  }, [searchParams]);

  if (!user) return null;

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const totalNetworkVolume = networkMembers.reduce((sum, m) => sum + (m.personalSalesCount || 0) * 1000000, 0); // Mocking volume calc if not in node
  
  const overrideThisMonth = wallet?.ledger
    ? wallet.ledger
        .filter(e => e.type === 'override' && e.cycleMonth === currentMonth)
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const activeHCMs = networkMembers.filter(m => m.status === 'active').length;

  return (
    <DashboardLayout pageTitle="Business Associate Portal">
      {user && (
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={user}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
      {loading ? (
        <div className="flex items-center justify-center h-[60vh] animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-hba border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">Loading Network Analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10 stagger-children">
          {/* KYC Alert Banner */}
          {user.kycStatus !== 'approved' && (
            <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top duration-700 flex flex-col md:flex-row items-center justify-between gap-6 ${
              user.kycStatus === 'pending' 
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                : 'bg-[#fbbf24]/5 border-[#fbbf24]/20 text-[#fbbf24]'
            }`}>
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${
                  user.kycStatus === 'pending' ? 'bg-amber-500/10' : 'bg-[#fbbf24]/10'
                }`}>
                  {user.kycStatus === 'pending' ? '⏳' : '🛡️'}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                    {user.kycStatus === 'pending' ? 'KYC Verification Pending' : 'KYC Verification Required'}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mt-1">
                    {user.kycStatus === 'pending' 
                      ? 'Your documents are being reviewed by the administration.' 
                      : 'Complete your profile to enable commission withdrawals and rank rewards.'}
                  </p>
                </div>
              </div>
              <a 
                href="/hba/kyc"
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  user.kycStatus === 'pending'
                    ? 'bg-amber-500 text-[#0d0f14] hover:brightness-110'
                    : 'bg-[#fbbf24] text-white hover:brightness-110'
                }`}
              >
                {user.kycStatus === 'pending' ? 'View Documents' : 'Complete KYC Now'}
              </a>
            </div>
          )}

<<<<<<< HEAD
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
=======
          {/* Header Greeting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
>>>>>>> 27a04e873fec0d2ae5459746dba565864000010b
            <div>
              <h2 className="font-display text-4xl font-black text-slate-800 tracking-tight">
                Welcome, {user.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
                Authorized <span className="text-hba">Health Business Associate</span> • Managing {networkMembers.length} HCM Leads
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/hba/network" className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm">
                View Network
              </Link>
              <Link href="/hba/override-income" className="px-8 py-3.5 rounded-2xl bg-hba text-[#0d0f14] text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-hba/20">
                Override Ledger
              </Link>
            </div>
          </div>

          {/* Activity Compliance Banner */}
          {user.personalSalesThisMonth < 1 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex items-center gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Activity Warning</p>
                <p className="text-[10px] text-red-400/70 mt-0.5">You need minimum 1 personal sale + 1 HCM recruitment this month to remain active</p>
              </div>
            </div>
          )}

          {/* Core Stats */}
<<<<<<< HEAD
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-slide-up stagger-children">
=======
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
>>>>>>> 27a04e873fec0d2ae5459746dba565864000010b
            <StatCard
              label="My Total Balance"
              value={`₹${(((wallet?.provisionalBalance || 0) + (wallet?.finalBalance || 0)) / 100).toLocaleString('en-IN')}`}
              change="Cumulative Profit"
              color="#3b82f6"
            />
            <StatCard
              label="Available Payout"
              value={`₹${((wallet?.finalBalance || 0) / 100).toLocaleString('en-IN')}`}
              change="Ready to withdraw"
              color="#10b981"
            />
            <StatCard
              label="Cycle Overrides"
              value={`₹${((wallet?.earningsBreakdown?.override || 0) / 100).toLocaleString('en-IN')}`}
              change="Provisional this cycle"
              color="#f59e0b"
            />
            <StatCard
              label="Team Network"
              value={String(user.teamSize)}
              change={`${networkMembers.length} active managers`}
              color={color}
            />
            <StatCard
              label="Unit Sales"
              value={String(user.personalSalesThisMonth)}
              change="Personal production"
              color={color}
            />
          </div>

          {/* Top 10 HCM Sales Performance */}
<<<<<<< HEAD
          <div className="bg-surface border border-white/[0.07] rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
             <div className="px-8 py-6 border-b border-white/[0.07] flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-hba/10 flex items-center justify-center text-hba border border-hba/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
=======
          <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="px-10 py-8 border-b border-white/[0.07] flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-hba/10 flex items-center justify-center text-hba border border-hba/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-white uppercase tracking-wider">Top 10 HCM Performers</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Leading Regional Managers</p>
>>>>>>> 27a04e873fec0d2ae5459746dba565864000010b
                  </div>
                </div>
                <Link href="/hba/team-performance" className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-hba uppercase tracking-widest hover:bg-white/10 transition-all">Full Analytics</Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                        <th className="px-10 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Pos</th>
                        <th className="px-10 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">HCM Lead</th>
                        <th className="px-10 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Policies</th>
                        <th className="px-10 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Volume</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {[
                      { rank: 1, name: 'Anil Gupta', units: 124, revenue: 2480000 },
                      { rank: 2, name: 'Kavita Sharma', units: 98, revenue: 1960000 },
                      { rank: 3, name: 'Manoj Tiwari', units: 85, revenue: 1700000 },
                      { rank: 4, name: 'Priya Verma', units: 72, revenue: 1440000 },
                      { rank: 5, name: 'Sameer Khan', units: 65, revenue: 1300000 },
                    ].map((hcm) => (
                      <tr key={hcm.rank} className="hover:bg-white/[0.01] transition-all group">
                         <td className="px-10 py-6">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                              hcm.rank === 1 ? 'bg-hba text-white shadow-hba/20' : 'bg-white/5 text-white/30'
                            }`}>
                              {hcm.rank}
                            </span>
                         </td>
                         <td className="px-10 py-6">
                            <div className="text-sm font-bold text-white group-hover:text-hba transition-colors">{hcm.name}</div>
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-tighter mt-1">TEAM LEADER</div>
                         </td>
                         <td className="px-10 py-6 text-sm font-bold text-emerald-400 text-center">{hcm.units}</td>
                         <td className="px-10 py-6 text-sm font-black text-white text-right">₹{((hcm.revenue || 0) / 100).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

<<<<<<< HEAD
          {/* Wallet + Chart + Team */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
            {/* Left: Wallet */}
            <div className="lg:col-span-5 space-y-8">
=======
          {/* Financials & Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left: Wallet & Overrides */}
            <div className="lg:col-span-5 flex flex-col gap-10">
>>>>>>> 27a04e873fec0d2ae5459746dba565864000010b
              {wallet && (
                <div className="flex-1">
                  <WalletCard
                    provisionalBalance={(wallet?.provisionalBalance || 0) / 100}
                    finalBalance={(wallet?.finalBalance || 0) / 100}
                    totalEarned={(wallet?.totalEarned || 0) / 100}
                    totalWithdrawn={(wallet?.totalWithdrawn || 0) / 100}
                    color={color}
                    onWithdraw={() => alert('Withdrawal request feature coming soon!')}
                  />
                </div>
              )}

              {/* Recent Override Income */}
              <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col flex-1">
                <div className="px-10 py-8 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Recent Override Ledger</h3>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">Live Profit Tracking</p>
                  </div>
                  <Link href="/hba/override-income" className="px-4 py-2 rounded-lg bg-white/5 text-[10px] font-black text-hba uppercase tracking-widest hover:bg-white/10 transition-all">View All</Link>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {wallet?.ledger?.filter(e => e.type === 'override').length === 0 ? (
                    <div className="px-10 py-16 text-center">
                       <div className="text-5xl mb-6 opacity-10 grayscale">📜</div>
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No overrides this cycle</p>
                    </div>
                  ) : (
                    wallet?.ledger?.filter(e => e.type === 'override').slice(0, 5).map((entry) => (
                      <div key={entry._id} className="px-10 py-5 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-bold truncate tracking-tight">{entry.description}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-[#34d399] tracking-tighter">+₹{((entry.amount || 0) / 100).toLocaleString('en-IN')}</span>
                          <div className="mt-1">
                            <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border ${entry.status === 'final' ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                              {entry.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Chart + Recent Sales */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex-1">
                <MiniBarChart
                  data={HBA_MONTHLY_PERFORMANCE}
                  color={color}
                  title="Monthly Revenue & Override Trend"
                />
              </div>

              {/* Recent Personal Sales */}
              <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col flex-1">
                <div className="px-10 py-8 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Recent Personal Sales</h3>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">Individual Production</p>
                  </div>
                  <span className="px-4 py-2 rounded-lg bg-hba/10 text-[10px] font-black text-hba uppercase tracking-widest">{user.personalSalesThisMonth} this month</span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {recentSales.length === 0 ? (
                    <div className="px-10 py-16 text-center">
                       <div className="text-5xl mb-6 opacity-10 grayscale">📂</div>
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No sales recorded yet</p>
                    </div>
                  ) : (
                    recentSales.map((sale) => (
                      <div key={sale._id} className="px-10 py-5 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-hba/10 border border-hba/20 flex items-center justify-center text-hba group-hover:scale-110 transition-transform">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-bold truncate tracking-tight">{sale.customerName}</div>
                          <div className="text-[10px] text-white/30 mt-1 flex items-center gap-2 font-black uppercase tracking-widest">
                            <span>{sale.plan?.name || 'Standard Plan'}</span>
                            <span className="opacity-20">•</span>
                            <span className="font-mono">{sale.policyId}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black text-hba tracking-tighter">₹{((sale.amount || 0) / 100).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-white/20 font-black mt-1 uppercase tracking-widest">
                            {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="animate-slide-up">
            <TeamMemberTable
              members={networkMembers as any}
              color={color}
              title="HCM Network Overview"
              showTeamSize={true}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
