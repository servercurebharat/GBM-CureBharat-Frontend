'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import WalletCard from '@/components/ui/WalletCard';
import MiniBarChart from '@/components/ui/MiniBarChart';
import RankProgressBar from '@/components/ui/RankProgressBar';
import TeamMemberTable from '@/components/ui/TeamMemberTable';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { walletAPI, usersAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale, ITreeNode } from '@/types';
import { HCM_MONTHLY_PERFORMANCE } from '@/lib/mockData';
import AddMemberModal from '@/components/dashboard/AddMemberModal';

export default function HcmDashboard() {
  return (
    <Suspense fallback={null}>
      <HcmDashboardContent />
    </Suspense>
  );
}

function HcmDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [teamMembers, setTeamMembers] = useState<ITreeNode[]>([]);
  const [teamSales, setTeamSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  const color = '#f87171'; // HCM Red

  useEffect(() => {
    async function fetchData() {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const [walletRes, downlineRes, salesRes] = await Promise.all([
          walletAPI.getMyWallet(),
          usersAPI.getDownline(user._id),
          salesAPI.getAll({ page: 1, limit: 10 }), // This gets user's own sales or team sales depending on backend impl
        ]);

        if (walletRes.data.success) setWallet(walletRes.data.data || null);
        
        // Transform ITreeNode children to a flat list for the activity monitor if needed, 
        // or just use direct children
        if (downlineRes.data.success && downlineRes.data.data?.children) {
          setTeamMembers(downlineRes.data.data.children);
        }

        if (salesRes.data.success) setTeamSales(salesRes.data.data || []);
      } catch (err) {
        console.error('HCM Dashboard data fetch failed', err);
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

  // Calculate stats from real data
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2024-05"
  
  const overrideThisMonth = wallet?.ledger
    ? wallet.ledger
        .filter(e => e.type === 'override' && e.cycleMonth === currentMonth)
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const activeHCCs = teamMembers.filter(m => m.status === 'active').length;
  
  // Total team sales this month (sum of children's sales)
  const teamSalesCountThisMonth = teamMembers.reduce((sum, m) => sum + (m.personalSalesCount || 0), 0);

  // HCM → HBA promotion: target values
  const hcmPromotionSalesProgress = Math.min(user.personalSalesCount, 12);
  const hcmPromotionRecruitProgress = Math.min(teamMembers.length, 12);

  return (
    <DashboardLayout pageTitle="Manager Dashboard">
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
            <div className="w-10 h-10 border-4 border-hcm border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">Synchronizing Team Data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10 stagger-children">
          {/* KYC Alert Banner - Premium Redesign */}
          {user.kycStatus !== 'approved' && (
            <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 shadow-2xl animate-in slide-in-from-top-4 duration-1000 flex flex-col md:flex-row items-center justify-between gap-8 ${
              user.kycStatus === 'pending' 
                ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] border-[#FCD34D]/30 text-white' 
                : 'bg-gradient-to-br from-[#F87171] to-[#EF4444] border-[#FCA5A5]/30 text-white'
            }`}>
              {/* Decorative Glass Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 blur-2xl -ml-24 -mb-24 rounded-full" />

              <div className="relative z-10 flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner">
                  {user.kycStatus === 'pending' ? '⏳' : '🛡️'}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight leading-none mb-2">
                    {user.kycStatus === 'pending' ? 'Verification In Progress' : 'Action Required: Verify KYC'}
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90 leading-relaxed max-w-md">
                    {user.kycStatus === 'pending' 
                      ? 'Our compliance team is currently auditing your documents. This usually takes 24-48 hours.' 
                      : 'Your manager account is currently in provisional mode. Complete KYC to unlock full team overrides and rewards.'}
                  </p>
                </div>
              </div>
              
              <Link 
                href="/hcm/kyc"
                className="relative z-10 px-10 py-4 rounded-2xl bg-white text-[#0d0f14] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20 text-center"
              >
                {user.kycStatus === 'pending' ? 'Check Status' : 'Verify Now'}
              </Link>
            </div>
          )}

          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
            <div>
              <h2 className="font-display text-3xl font-black text-slate-900 tracking-tight">
                Welcome, {user.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-muted mt-1 font-medium">
                You are an active <span className="text-hcm font-bold tracking-tight">Health Care Manager</span> managing {teamMembers.length} HCCs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/hcm/team-monitor" className="px-5 py-2.5 rounded-xl bg-hcm/10 border border-hcm/20 text-hcm text-xs font-bold uppercase tracking-widest hover:bg-hcm/20 transition-all">
                Monitor Team
              </Link>
              <Link href="/hcm/override-ledger" className="px-5 py-2.5 rounded-xl bg-hcm text-[#0d0f14] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-hcm/10">
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
                <p className="text-[10px] text-red-400/70 mt-0.5">You need minimum 1 personal sale + 1 HCC recruitment this month to remain active</p>
              </div>
            </div>
          )}

          {/* Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-slide-up stagger-children">
            <StatCard
              label="Manager Override"
              value={`₹${(overrideThisMonth / 100).toLocaleString('en-IN')}`}
              change="Provisional this cycle"
              color={color}
            />
            <StatCard
              label="Active HCCs"
              value={`${activeHCCs}/${teamMembers.length}`}
              change={`${teamMembers.length - activeHCCs} inactive`}
              color={color}
            />
            <StatCard
              label="Team Volume"
              value={String(teamSalesCountThisMonth)}
              change="Total unit sales"
              color={color}
            />
            <StatCard
              label="Goal to HBA"
              value={`${Math.round((hcmPromotionSalesProgress / 12 + hcmPromotionRecruitProgress / 12) / 2 * 100)}%`}
              change={`${12 - hcmPromotionRecruitProgress} more HCCs needed`}
              color={color}
            />
            <StatCard
              label="Cap Amount"
              value="₹2,00,000"
              change="Manager Earnings Limit"
              color="#fbbf24"
            />
          </div>

          {/* Top 10 HCC Sales Performance */}
          <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
             <div className="px-8 py-6 border-b border-white/[0.07] flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-hcm/10 flex items-center justify-center text-hcm border border-hcm/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Top 10 HCC Performance</h3>
                </div>
                <Link href="/hcm/team-monitor" className="text-[10px] font-black text-hcm uppercase tracking-widest hover:underline">Monitor All</Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Pos</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Counselor (HCC)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Unit Sales</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Revenue</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {[
                      { rank: 1, name: 'Deepak Verma', units: 42, revenue: 840000 },
                      { rank: 2, name: 'Anjali Singh', units: 38, revenue: 760000 },
                      { rank: 3, name: 'Rohan Mehta', units: 31, revenue: 620000 },
                      { rank: 4, name: 'Surbhi Goel', units: 28, revenue: 560000 },
                      { rank: 5, name: 'Amitabh Jha', units: 22, revenue: 440000 },
                    ].map((hcc) => (
                      <tr key={hcc.rank} className="hover:bg-white/[0.02] transition-all group">
                         <td className="px-8 py-5">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                              hcc.rank === 1 ? 'bg-hcm text-white' : 'bg-white/5 text-white/40'
                            }`}>
                              {hcc.rank}
                            </span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="text-sm font-bold text-white group-hover:text-hcm transition-colors">{hcc.name}</div>
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-tighter mt-0.5">HEALTH COUNSELOR</div>
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-emerald-400 text-center">{hcc.units}</td>
                         <td className="px-8 py-5 text-sm font-black text-white text-right">₹{(hcc.revenue / 100).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          {/* Row 2: Wallet + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
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

              {/* Referral Tool */}
              <div className="bg-[#131241] rounded-2xl p-8 border border-white/[0.07] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f87171]/5 blur-3xl -mr-16 -mt-16" />
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Manager Referral Link</h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Manager ID</p>
                    <p className="text-lg font-mono font-bold text-[#f87171]">{user.memberId}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}/register?ref=${user.memberId}`;
                      navigator.clipboard.writeText(link);
                      alert('Manager referral link copied!');
                    }}
                    className="w-full py-4 rounded-xl bg-[#f87171] text-[#0d0f14] font-black text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#f87171]/10"
                  >
                    Copy Referral Link
                  </button>
                </div>
              </div>

              {/* Rank Progress */}
              <RankProgressBar
                currentRank="HCM"
                nextRank="HBA"
                currentSales={user.personalSalesCount}
                targetSales={12}
                currentRecruits={teamMembers.length}
                targetRecruits={12}
                color={color}
              />
            </div>

            <div className="lg:col-span-7 space-y-8">
              <MiniBarChart
                data={HCM_MONTHLY_PERFORMANCE}
                color={color}
                title="Monthly Revenue & Override Trend"
              />

              {/* HCC Activity Monitor */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Direct HCC Monitor</h3>
                  <Link href="/hcm/team-monitor" className="text-[10px] font-bold text-hcm uppercase tracking-widest hover:underline">View All</Link>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {teamMembers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                       <p className="text-xs text-muted font-bold uppercase tracking-widest">No direct HCCs recruited yet</p>
                    </div>
                  ) : (
                    teamMembers.slice(0, 5).map((member) => (
                      <div key={member._id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{member.name}</div>
                          <div className="text-[10px] text-muted font-mono">{member.memberId}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-bold ${member.personalSalesCount > 0 ? 'text-white' : 'text-red-400'}`}>
                            {member.personalSalesCount}
                          </div>
                          <div className="text-[9px] text-muted uppercase tracking-wider">Total</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          member.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {member.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Sales Feed */}
          <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl animate-slide-up">
            <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Recent Team Activity</h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{teamSales.length} total entries</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {teamSales.length === 0 ? (
                <div className="px-6 py-12 text-center">
                   <p className="text-xs text-muted font-bold uppercase tracking-widest">No recent sales recorded</p>
                </div>
              ) : (
                teamSales.slice(0, 6).map((sale) => (
                  <div key={sale._id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-hcm/10 border border-hcm/20 flex items-center justify-center text-hcm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-bold truncate">{sale.customerName}</div>
                      <div className="text-[10px] text-muted mt-0.5 flex items-center gap-2">
                        <span className="font-medium">by {sale.seller.name}</span>
                        <span className="opacity-20">•</span>
                        <span>{sale.plan.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-hcm">₹{(sale.amount / 100).toLocaleString('en-IN')}</div>
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
      )}
    </DashboardLayout>
  );
}
