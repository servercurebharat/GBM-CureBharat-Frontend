'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import WalletCard from '@/components/ui/WalletCard';
import { useAuth } from '@/lib/auth';
import { walletAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale } from '@/types';

export default function StateHeadDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [stateSales, setStateSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [walletRes, salesRes] = await Promise.all([
          walletAPI.getMyWallet(),
          salesAPI.getAll({ page: 1, limit: 10 }),
        ]);
        
        if (walletRes.data.success) setWallet(walletRes.data.data || null);
        if (salesRes.data.success) setStateSales(salesRes.data.data || []);
      } catch (err) {
        console.error('SH dashboard data fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const color = '#34d399'; // SH Emerald

  return (
    <DashboardLayout pageTitle="State Operations Control">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-sh border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-white tracking-tight">
                {user.state} Region Overview
              </h2>
              <p className="text-sm text-muted mt-1 font-medium">
                Monitoring 2% leadership bonus and state-wide network performance
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded-xl bg-sh/10 border border-sh/20 text-sh text-xs font-bold uppercase tracking-widest hover:bg-sh/20 transition-all">
                Export State Ledger
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Leadership Bonus (2%)"
              value={`₹${((wallet?.provisionalBalance || 0) / 100).toLocaleString('en-IN')}`}
              change="From state-wide volume"
              color={color}
            />
            <StatCard
              label="State Team Size"
              value={String(user.teamSize)}
              change="Total members in region"
              color={color}
            />
            <StatCard
              label="New Policies Today"
              value="14"
              change="+22% vs yesterday"
              color={color}
            />
            <StatCard
              label="Active HBAs"
              value="06"
              change="Direct state downline"
              color={color}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Wallet Section */}
            <div className="lg:col-span-5 space-y-8">
               {wallet && (
                <WalletCard
                  provisionalBalance={wallet.provisionalBalance / 100}
                  finalBalance={wallet.finalBalance / 100}
                  totalEarned={wallet.totalEarned / 100}
                  totalWithdrawn={wallet.totalWithdrawn / 100}
                  color={color}
                  onWithdraw={() => alert('Withdrawal request')}
                />
              )}

              {/* State Performance Breakdown */}
              <div className="bg-surface border border-white/[0.07] rounded-3xl p-6 shadow-xl">
                 <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Revenue Mix</h4>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-sh/10 border border-sh/20 flex items-center justify-center text-sh font-bold">2%</div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-white">Leadership Dividends</div>
                          <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Main State Income</div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-bold text-white">85%</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-50">
                       <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold">🛒</div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-white">Personal Sales</div>
                          <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Direct Commissions</div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-bold text-white">15%</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* State Sales Log */}
            <div className="lg:col-span-7 space-y-8">
               <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
                  <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">State Sales Feed</h3>
                    <button className="text-[10px] font-bold text-sh uppercase tracking-widest hover:underline">Full Report</button>
                  </div>
                  <div className="divide-y divide-white/[0.04] overflow-y-auto max-h-[600px] custom-scrollbar">
                    {stateSales.map((sale) => (
                      <div key={sale._id} className="px-6 py-4 flex items-center gap-5 hover:bg-white/[0.02] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-sh/10 border border-sh/20 flex items-center justify-center text-sh font-bold group-hover:scale-110 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div className="flex-1 min-w-0 text-[10px]">
                          <div className="text-sm text-white font-bold truncate tracking-tight">{sale.customerName}</div>
                          <div className="flex items-center gap-2 text-muted mt-0.5">
                             <span className="font-bold text-sh uppercase tracking-tighter">{sale.seller.memberId}</span>
                             <span className="opacity-20">•</span>
                             <span className="font-medium truncate">{sale.seller.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-black text-sh tracking-tighter">₹{(sale.amount / 100).toLocaleString('en-IN')}</div>
                           <div className="text-[10px] text-muted font-bold mt-0.5 uppercase tracking-widest">{sale.cycleMonth}</div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
