'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { walletAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale } from '@/types';
import RevenueChart from '@/components/dashboard/sh/RevenueChart';
import IncomeMixGauge from '@/components/dashboard/sh/IncomeMixGauge';
import AddMemberModal from '@/components/dashboard/AddMemberModal';
import { ROLE_COLORS } from '@/lib/constants';

export default function StateHeadDashboard() {
  return (
    <Suspense fallback={null}>
      <StateHeadDashboardContent />
    </Suspense>
  );
}

function StateHeadDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [stateSales, setStateSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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

  useEffect(() => {
    if (searchParams.get('enroll') === 'true') setIsModalOpen(true);
  }, [searchParams]);

  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Loading State Analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {/* KYC Alert Banner */}
          {user.kycStatus !== 'approved' && (
            <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top duration-700 flex flex-col md:flex-row items-center justify-between gap-6 ${
              user.kycStatus === 'pending' 
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                : 'bg-[#34d399]/5 border-[#34d399]/20 text-[#34d399]'
            }`}>
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${
                  user.kycStatus === 'pending' ? 'bg-amber-500/10' : 'bg-[#34d399]/10'
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
                href="/sh/kyc"
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  user.kycStatus === 'pending'
                    ? 'bg-amber-500 text-[#0d0f14] hover:brightness-110'
                    : 'bg-[#34d399] text-[#0d0f14] hover:brightness-110'
                }`}
              >
                {user.kycStatus === 'pending' ? 'View Documents' : 'Complete KYC Now'}
              </a>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">State Head</h2>
              <p className="text-sm text-[#64748B] mt-1 font-medium opacity-70">Monitoring {user.state || 'N/A'} territory performance and compliance.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="relative z-50 bg-[#6029F1] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                 Enroll Member
              </button>
              <button className="bg-white border border-borderLight text-textDark px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
                  Export Report
              </button>
            </div>
          </div>

          <AddMemberModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            currentUser={user} 
            onSuccess={() => {
              // Refresh data or show success
            }} 
          />

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {[
               { label: 'Territory', value: user.state || 'N/A' },
               { label: 'Personal Sales', value: user.personalSalesCount.toString() },
               { label: 'Direct HBA Team', value: String(user.teamSize || 0) },
               { label: 'Total Earned', value: `₹${((wallet?.totalEarned || 0) / 100).toLocaleString('en-IN')}` },
               { label: 'Cap Amount', value: '₹10,00,000' },
             ].map((stat, i) => (
               <div key={i} className="bg-[#131241] border border-white/5 p-6 rounded-[24px] shadow-xl transition-all duration-300 hover:border-white/10 group">
                  <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-6 group-hover:text-[#60A5FA] transition-colors">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
               </div>
             ))}
          </div>

          {/* Top 10 HBA Sales in Territory */}
          <div className="bg-[#131241] border border-white/5 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 10 HBA Sales Performance</h3>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/1 border-b border-white/5">
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Rank</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">HBA Name</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest text-center">Unit Sales</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest text-right">Revenue Generated</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {[
                      { rank: 1, name: 'Sanjay Deshmukh', units: 450, revenue: 9000000 },
                      { rank: 2, name: 'Megha Patil', units: 380, revenue: 7600000 },
                      { rank: 3, name: 'Rahul Kulkarni', units: 310, revenue: 6200000 },
                      { rank: 4, name: 'Sunita Rao', units: 240, revenue: 4800000 },
                      { rank: 5, name: 'Vijay Chauhan', units: 190, revenue: 3800000 },
                    ].map((hba) => (
                      <tr key={hba.rank} className="hover:bg-white/1 transition-colors group">
                         <td className="px-8 py-5">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                              hba.rank === 1 ? 'bg-[#60A5FA] text-[#131241]' : 'bg-white/5 text-[#B5B8BD]'
                            }`}>
                              {hba.rank}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-[11px] font-bold text-white group-hover:text-[#60A5FA] transition-colors">{hba.name}</td>
                         <td className="px-8 py-5 text-[11px] font-bold text-emerald-400 text-center">{hba.units}</td>
                         <td className="px-8 py-5 text-[11px] font-black text-white text-right">₹{(hba.revenue / 100).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-9 bg-[#131241] border border-white/5 rounded-[24px] p-8 shadow-2xl">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role-Based Analytics</h3>
               </div>
               <RevenueChart />
            </div>

            <div className="lg:col-span-3 bg-[#131241] border border-white/5 rounded-[24px] p-8 shadow-2xl flex flex-col items-center">
               <h3 className="w-full text-sm font-bold text-white uppercase tracking-wider mb-8 text-left">Income Mix</h3>
               <IncomeMixGauge />
            </div>
          </div>

          {/* Activity & Promotion Pulse */}
          <div className="bg-[#131241] border border-white/5 rounded-[24px] p-8 shadow-2xl">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Activity & Promotion Pulse</h3>
             
             <div className="space-y-8 max-w-4xl">
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">
                      <span>Monthly Activity</span>
                      <span className="text-white">85%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#60A5FA] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: '85%' }} />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">
                      <span>Promotion Readiness</span>
                      <span className="text-white">60%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style={{ width: '60%' }} />
                   </div>
                </div>
             </div>

             <div className="mt-10 p-4 bg-white/2 border border-white/5 rounded-[12px] flex items-center gap-4">
                <div className="text-amber-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <p className="text-[11px] font-medium text-[#B5B8BD]">Current cycle activity is on track for payout and promotion review.</p>
             </div>
          </div>

          {/* Recent Ledger Transactions */}
          <div className="bg-[#131241] border border-white/5 rounded-[24px] shadow-2xl overflow-hidden">
             <div className="px-8 py-6 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-white/1 border-b border-white/5">
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Description</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Type</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Amount</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest text-right">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {!wallet?.ledger || wallet.ledger.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-xs font-bold text-muted uppercase tracking-widest">No recent transactions</td>
                      </tr>
                    ) : (
                      wallet.ledger.slice(0, 5).map((entry) => (
                        <tr key={entry._id} className="hover:bg-white/1 transition-colors">
                           <td className="px-8 py-4 text-[11px] font-bold text-white">{entry.description}</td>
                           <td className="px-8 py-4 text-[11px] font-bold text-[#B5B8BD] uppercase">{entry.type}</td>
                           <td className="px-8 py-4 text-[11px] font-bold text-emerald-400">₹{(entry.amount / 100).toLocaleString('en-IN')}</td>
                           <td className="px-8 py-4">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-sm ${
                                entry.status === 'final' ? 'bg-[#60A5FA]/20 text-[#60A5FA]' : 'bg-amber-400/20 text-amber-400'
                              }`}>
                                {entry.status.toUpperCase()}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-[11px] font-bold text-[#B5B8BD] text-right">{new Date(entry.date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
