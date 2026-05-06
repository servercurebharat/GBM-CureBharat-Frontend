'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminPayouts() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ wallets: any[]; summary: any } | null>(null);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getAllProvisional();
      if (res.data.success) {
        setData(res.data.data || null);
      }
    } catch (err) {
      toast.error('Failed to fetch payout data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunCycle = async () => {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (!confirm(`Are you sure you want to run the Payout Cycle for ${month}? This will finalize all provisional commissions.`)) return;

    setProcessing(true);
    try {
      const res = await adminAPI.triggerPayoutCycle(month);
      if (res.data.success) {
        toast.success(res.data.message || 'Payout cycle processed successfully');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cycle processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const filteredWallets = data?.wallets.filter(w => 
    w.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    w.user?.memberId.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <DashboardLayout pageTitle="Payout Management">
      <div className="space-y-6 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CUREBHARAT / ADMIN / PAYOUT MANAGEMENT</p>
              <h1 className="text-3xl font-black text-slate-800 font-display">Payout Command Center</h1>
           </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-4">
           <button 
             onClick={handleRunCycle}
             disabled={processing}
             className="bg-[#60A5FA] px-6 py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-[#60A5FA]/20 hover:brightness-110 active:scale-95 transition-all"
           >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              {processing ? 'Processing...' : 'Run T+3 Cycle'}
           </button>
           <button className="bg-[#009966] px-6 py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-[#009966]/20 hover:brightness-110 active:scale-95 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Disbursement T+5
           </button>
           <button className="bg-[#131241] px-6 py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10 hover:brightness-110 active:scale-95 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export Report
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Summary Stats */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-hcc/5 blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-12">
                    <h3 className="text-xl font-black font-display uppercase tracking-tight">Cycle Summary</h3>
                    <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                       Cycle: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-8">
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Provisional</p>
                       <p className="text-3xl font-black tracking-tighter">₹{((data?.summary.totalProvisional || 0) / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Pending TDS (5%)</p>
                       <p className="text-3xl font-black tracking-tighter text-[#fbbf24]">₹{((data?.summary.estimatedTDS || 0) / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Net Disbursement</p>
                       <p className="text-3xl font-black tracking-tighter text-[#34d399]">₹{((data?.summary.netPayout || 0) / 100).toLocaleString('en-IN')}</p>
                    </div>
                 </div>

                 <div className="mt-12 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#34d399] animate-pulse" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                       {data?.summary.walletCount || 0} Member Wallets loaded and ready for settlement
                    </p>
                 </div>
              </div>
           </div>

           {/* Quick Analytics */}
           <div className="lg:col-span-4 bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden">
              <h3 className="text-xl font-black font-display mb-8 uppercase tracking-tight">Wallet Status</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-hcc/10 flex items-center justify-center text-hcc">📜</div>
                       <span className="text-xs font-bold text-white/60">Approved KYC</span>
                    </div>
                    <span className="text-sm font-black">{data?.wallets.filter(w => w.user?.kycStatus === 'approved').length || 0}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-hcm/10 flex items-center justify-center text-hcm">⏳</div>
                       <span className="text-xs font-bold text-white/60">Pending KYC</span>
                    </div>
                    <span className="text-sm font-black text-hcm">{data?.wallets.filter(w => w.user?.kycStatus !== 'approved').length || 0}</span>
                 </div>
              </div>
              <p className="mt-10 text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed">
                 * KYC approved members will be moved to settlement automatically on cycle completion.
              </p>
           </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1">
                 <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 <input
                   type="text"
                   placeholder="Search Member ID or Name..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-hcc/20 transition-all outline-none"
                 />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50">
                       <th className="px-10 py-6">Member</th>
                       <th className="px-6 py-6">Role / Rank</th>
                       <th className="px-6 py-6">Provisional</th>
                       <th className="px-6 py-6">TDS (5%)</th>
                       <th className="px-6 py-6">Net Payout</th>
                       <th className="px-10 py-6 text-center">KYC</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {loading ? (
                       Array(5).fill(0).map((_, i) => (
                         <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-10 py-8"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                         </tr>
                       ))
                    ) : filteredWallets.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                             No pending payouts found ✨
                          </td>
                       </tr>
                    ) : (
                       filteredWallets.map((wallet) => (
                          <tr key={wallet._id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-10 py-6">
                                <div className="text-sm font-black text-slate-800">{wallet.user?.name}</div>
                                <div className="text-[10px] font-mono font-bold text-hcc uppercase mt-0.5">{wallet.user?.memberId}</div>
                             </td>
                             <td className="px-6 py-6">
                                <div className="text-[10px] font-black text-slate-500 uppercase">{wallet.user?.role}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{wallet.user?.rank}</div>
                             </td>
                             <td className="px-6 py-6 text-sm font-black text-slate-800">
                                ₹{(wallet.provisionalBalance / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-6 py-6 text-sm font-bold text-slate-400">
                                ₹{(wallet.provisionalBalance * 0.05 / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-6 py-6 text-sm font-black text-sh">
                                ₹{(wallet.provisionalBalance * 0.95 / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-10 py-6 text-center">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest border ${
                                   wallet.user?.kycStatus === 'approved' 
                                     ? 'bg-sh/10 text-sh border-sh/20' 
                                     : 'bg-hcm/10 text-hcm border-hcm/20'
                                }`}>
                                   {wallet.user?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                                </span>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
