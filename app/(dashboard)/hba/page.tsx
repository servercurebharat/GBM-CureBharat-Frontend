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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
            <div>
              <h2 className="font-display text-3xl font-bold text-black tracking-tight">
                Welcome, {user.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-muted mt-1 font-medium">
                You are an active <span className="text-hba font-bold tracking-tight">Health Business Associate</span> managing {networkMembers.length} HCMs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/hba/network" className="px-5 py-2.5 rounded-xl bg-hba/10 border border-hba/20 text-hba text-xs font-bold uppercase tracking-widest hover:bg-hba/20 transition-all">
                View Network
              </Link>
              <Link href="/hba/override-income" className="px-5 py-2.5 rounded-xl bg-hba text-[#0d0f14] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-hba/10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-slide-up stagger-children">
            <StatCard
              label="Override Income"
              value={`₹${(overrideThisMonth / 100).toLocaleString('en-IN')}`}
              change="Provisional this cycle"
              color={color}
            />
            <StatCard
              label="Active HCMs"
              value={String(activeHCMs).padStart(2, '0')}
              change={`${networkMembers.length} total network managers`}
              color={color}
            />
            <StatCard
              label="Team Size"
              value={String(user.teamSize)}
              change="Total direct & indirect"
              color={color}
            />
            <StatCard
              label="Current Rank"
              value="HBA"
              change="Health Business Associate"
              color={color}
            />
            <StatCard
              label="Cap Amount"
              value="₹5,00,000"
              change="Personal Earnings Limit"
              color="#fbbf24"
            />
          </div>

          {/* Top 10 HCM Sales Performance */}
          <div className="bg-surface border border-white/[0.07] rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
             <div className="px-8 py-6 border-b border-white/[0.07] flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-hba/10 flex items-center justify-center text-hba border border-hba/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider">Top 10 HCM Performers</h3>
                </div>
                <Link href="/hba/team-performance" className="text-[10px] font-black text-hba uppercase tracking-widest hover:underline">Full Analytics</Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                        <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Pos</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">HCM Lead</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-center">Policies</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">Volume</th>
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
                         <td className="px-8 py-5">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                              hcm.rank === 1 ? 'bg-hba text-white' : 'bg-white/5 text-muted'
                            }`}>
                              {hcm.rank}
                            </span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="text-sm font-bold text-black group-hover:text-hba transition-colors">{hcm.name}</div>
                            <div className="text-[9px] font-black text-muted uppercase tracking-tighter mt-0.5">TEAM LEADER</div>
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-emerald-600 text-center">{hcm.units}</td>
                         <td className="px-8 py-5 text-sm font-black text-black text-right">₹{(hcm.revenue / 100).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          {/* Wallet + Chart + Team */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
            {/* Left: Wallet */}
            <div className="lg:col-span-5 space-y-8">
              {wallet && (
                <WalletCard
                  provisionalBalance={wallet.provisionalBalance / 100}
                  finalBalance={wallet.finalBalance / 100}
                  totalEarned={wallet.totalEarned / 100}
                  totalWithdrawn={wallet.totalWithdrawn / 100}
                  color={color}
                  onWithdraw={() => alert('Withdrawal request feature coming soon!')}
                />
              )}

              {/* Recent Override Income */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider">Recent Override Ledger</h3>
                  <Link href="/hba/override-income" className="text-[10px] font-bold text-hba uppercase tracking-widest hover:underline">View All</Link>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {wallet?.ledger?.filter(e => e.type === 'override').length === 0 ? (
                    <div className="px-6 py-10 text-center text-muted text-xs font-bold uppercase tracking-widest">No override income recorded</div>
                  ) : (
                    wallet?.ledger?.filter(e => e.type === 'override').slice(0, 5).map((entry) => (
                      <div key={entry._id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-black font-medium truncate">{entry.description}</p>
                          <p className="text-[10px] text-muted mt-0.5">{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600">+₹{(entry.amount / 100).toLocaleString('en-IN')}</span>
                          <div className="mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${entry.status === 'final' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
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
            <div className="lg:col-span-7 space-y-8">
              <MiniBarChart
                data={HBA_MONTHLY_PERFORMANCE}
                color={color}
                title="Monthly Revenue & Override Trend"
              />

              {/* Recent Personal Sales */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider">Recent Personal Sales</h3>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{user.personalSalesThisMonth} this month</span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {recentSales.length === 0 ? (
                    <div className="px-6 py-10 text-center text-muted text-xs font-bold uppercase tracking-widest">No recent personal sales</div>
                  ) : (
                    recentSales.map((sale) => (
                      <div key={sale._id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-hba/10 border border-hba/20 flex items-center justify-center text-hba">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-black font-bold truncate">{sale.customerName}</div>
                          <div className="text-[10px] text-muted mt-0.5 flex items-center gap-2">
                            <span>{sale.plan.name}</span>
                            <span className="opacity-20">•</span>
                            <span className="font-mono">{sale.policyId}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-hba">₹{(sale.amount / 100).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-muted font-medium mt-0.5">
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
