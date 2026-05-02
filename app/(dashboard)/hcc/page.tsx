'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import RankProgressBar from '@/components/ui/RankProgressBar';
import WalletCard from '@/components/ui/WalletCard';
import { useAuth } from '@/lib/auth';
import { walletAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale } from '@/types';

export default function HCCDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [recentSales, setRecentSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [walletRes, salesRes] = await Promise.all([
          walletAPI.getMyWallet(),
          salesAPI.getAll({ page: 1, limit: 5 }),
        ]);
        
        if (walletRes.data.success) setWallet(walletRes.data.data || null);
        if (salesRes.data.success) setRecentSales(salesRes.data.data || []);
      } catch (err) {
        console.error('Dashboard data fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const color = '#60a5fa'; // HCC Blue

  return (
    <DashboardLayout pageTitle="My Business Workspace">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-hcc border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Loading Analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {/* KYC Alert Banner - Redesigned for Premium Visibility */}
          {user.kycStatus !== 'approved' && (
            <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 shadow-2xl animate-in slide-in-from-top-4 duration-1000 flex flex-col md:flex-row items-center justify-between gap-8 ${
              user.kycStatus === 'pending' 
                ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] border-[#FCD34D]/30 text-white' 
                : 'bg-gradient-to-br from-[#60A5FA] to-[#2563EB] border-[#93C5FD]/30 text-white'
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
                      : 'Your account is currently in provisional mode. Complete KYC to unlock full commission withdrawals and rank rewards.'}
                  </p>
                </div>
              </div>
              
              <a 
                href="/hcc/kyc"
                className="relative z-10 px-10 py-4 rounded-2xl bg-white text-[#0d0f14] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20"
              >
                {user.kycStatus === 'pending' ? 'Check Status' : 'Verify Now'}
              </a>
            </div>
          )}

          {/* Header Greeting */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black text-slate-900 tracking-tight">
                Welcome, {user.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-muted mt-1 font-medium">
                You are currently an active <span className="text-hcc font-bold tracking-tight">Health Care Consultant</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded-xl bg-hcc/10 border border-hcc/20 text-hcc text-xs font-bold uppercase tracking-widest hover:bg-hcc/20 transition-all">
                Download Brochure
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-hcc text-[#0d0f14] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-hcc/10">
                New Sale +
              </button>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Provisional Earnings"
              value={`₹${((wallet?.provisionalBalance || 0) / 100).toLocaleString('en-IN')}`}
              change="Settlement on 5th"
              color={color}
            />
            <StatCard
              label="Total Policies"
              value={String(user.personalSalesCount)}
              change="All-time personal sales"
              color={color}
            />
            <StatCard
              label="Team Recruits"
              value={String(user.teamSize)}
              change="Total direct downline"
              color={color}
            />
            <StatCard
              label="Cycle Progress"
              value={String(user.personalSalesThisMonth)}
              change="Sales this cycle"
              color={color}
            />
          </div>

          {/* Detailed Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Rank and Performance */}
            <div className="lg:col-span-7 space-y-8">
              <RankProgressBar
                currentRank="HCC"
                nextRank="HCM"
                currentSales={user.personalSalesCount}
                targetSales={12}
                currentRecruits={user.teamSize}
                targetRecruits={12}
                color={color}
              />

              {/* Recent Activity List */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                    Recent Policy Sales
                  </h3>
                  <button className="text-[10px] font-bold text-hcc uppercase tracking-widest hover:underline">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {recentSales.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="text-4xl mb-4 opacity-20">📂</div>
                      <p className="text-xs text-muted font-bold uppercase tracking-widest">No sales recorded this cycle</p>
                      <p className="text-[10px] text-muted mt-1">Start by clicking 'New Sale' button above</p>
                    </div>
                  ) : (
                    recentSales.map((sale) => (
                      <div key={sale._id} className="px-6 py-4 flex items-center gap-5 hover:bg-white/[0.02] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-hcc/10 border border-hcc/20 flex items-center justify-center text-hcc font-bold group-hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-bold truncate tracking-tight">
                            {sale.customerName}
                          </div>
                          <div className="text-[10px] text-muted font-medium mt-0.5 flex items-center gap-2">
                            <span className="uppercase tracking-tighter">{sale.plan.name}</span>
                            <span className="opacity-20">•</span>
                            <span className="font-mono">{sale.policyId}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-sh tracking-tighter">
                            ₹{(sale.amount / 100).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-muted font-bold mt-0.5">
                            {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Wallet and Quick Tools */}
            <div className="lg:col-span-5 space-y-8">
              {wallet && (
                <WalletCard
                  provisionalBalance={wallet.provisionalBalance / 100}
                  finalBalance={wallet.finalBalance / 100}
                  totalEarned={wallet.totalEarned / 100}
                  totalWithdrawn={wallet.totalWithdrawn / 100}
                  color={color}
                  onWithdraw={() => {
                    alert('Withdrawal request feature coming soon!');
                  }}
                />
              )}

              {/* Referral Tool */}
              <div className="bg-[#131241] rounded-2xl p-8 border border-white/[0.07] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#60a5fa]/5 blur-3xl -mr-16 -mt-16" />
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Referral Network Tool</h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Your Referral Code</p>
                    <p className="text-lg font-mono font-bold text-[#60a5fa]">{user.memberId}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}/register?ref=${user.memberId}`;
                      navigator.clipboard.writeText(link);
                      alert('Referral link copied to clipboard!');
                    }}
                    className="w-full py-4 rounded-xl bg-[#60a5fa] text-[#0d0f14] font-black text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#60a5fa]/10"
                  >
                    Copy Referral Link
                  </button>
                  
                  <p className="text-[9px] text-white/20 font-bold uppercase text-center leading-relaxed">
                    Share this link to onboard new members directly into your team.
                  </p>
                </div>
              </div>

              {/* Pin Management Shortcut */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-hcc/5 blur-3xl -mr-16 -mt-16 group-hover:bg-hcc/10 transition-colors" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2l.79.79m.35 1.35l.79.79m.35 1.35l.79.79m.35 1.35l.79.79M16.5 10.5l-3 3"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">E-Pin Wallet</h4>
                    <p className="text-[10px] text-muted font-medium uppercase tracking-widest">Activation Inventory</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-4 mb-6">
                  <div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Available Pins</div>
                    <div className="text-2xl font-display font-bold text-white mt-1">04</div>
                  </div>
                  <button className="text-[10px] font-black text-[#0d0f14] bg-white px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-white/90 transition-all">
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-2.5 rounded-xl border border-white/[0.07] text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05] transition-all">
                    Transfer Pin
                  </button>
                  <button className="py-2.5 rounded-xl border border-white/[0.07] text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05] transition-all">
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
