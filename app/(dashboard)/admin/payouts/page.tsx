'use client';

import { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ExportDropdown from '@/components/dashboard/ExportDropdown';
import CountUp from '@/components/dashboard/CountUp';

export default function AdminPayouts() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Payout Center...</div>}>
      <PayoutContent />
    </Suspense>
  );
}

function PayoutContent() {
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
      <div className="space-y-8 pb-20">
        {/* Unified Header & Global Controls */}
        <div className="bg-[#131241] rounded-[2.5rem] p-10 shadow-2xl border border-white/[0.03] relative group">
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/5 blur-[120px] -mr-64 -mt-64 group-hover:bg-[#10b981]/10 transition-all duration-1000" />
          </div>
          
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.4em] mb-4">TREASURY / PAYOUT / SETTLEMENT</p>
              <h1 className="text-5xl font-black text-white font-display tracking-tight leading-[1.1]">Payout Command Center</h1>
              <p className="text-sm text-white/40 mt-6 leading-relaxed">
                Centralized gateway for final commission settlement and bank disbursements. Monitor network liabilities 
                and trigger T+3/T+5 settlement protocols with cryptographic integrity.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
               <button 
                 onClick={handleRunCycle}
                 disabled={processing}
                 className="flex-1 xl:flex-none bg-[#10b981] px-10 py-5 rounded-[22px] text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-[#10b981]/30 hover:bg-[#059669] hover:-translate-y-1 active:scale-95 transition-all duration-300"
               >
                  <div className={`w-2 h-2 rounded-full bg-white ${processing ? 'animate-ping' : ''}`} />
                  {processing ? 'EXECUTING PROTOCOL...' : 'RUN SETTLEMENT CYCLE'}
               </button>
               
               <button className="flex-1 xl:flex-none bg-white/5 border border-white/10 px-10 py-5 rounded-[22px] text-[11px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  Disbursement T+5
               </button>
               
               <div className="w-full xl:w-auto">
                 <ExportDropdown 
                   title="CureBharat Payout Report"
                   headers={['Name', 'Member ID', 'Role', 'Rank', 'Provisional', 'TDS (5%)', 'Net Payout', 'KYC Status']}
                   rows={data?.wallets.map(w => [
                     w.user?.name,
                     w.user?.memberId,
                     w.user?.role?.toUpperCase(),
                     w.user?.rank?.toUpperCase() || 'UNRANKED',
                     `Rs. ${(w.provisionalBalance / 100).toLocaleString()}`,
                     `Rs. ${((w.provisionalBalance * 0.05) / 100).toLocaleString()}`,
                     `Rs. ${((w.provisionalBalance * 0.95) / 100).toLocaleString()}`,
                     w.user?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'
                   ]) || []}
                   fileName={`Payout_Report_${new Date().toISOString().split('T')[0]}`}
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Settlement Analytics */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/[0.03]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-[100px] -mr-48 -mt-48 group-hover:bg-[#10b981]/10 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-8 rounded-full bg-[#10b981]" />
                       <h3 className="text-2xl font-black font-display uppercase tracking-tight">Active Cycle Intelligence</h3>
                    </div>
                    <div className="bg-black/30 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 text-white/40">
                       BUFFER: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Total Provisional</p>
                       <p className="text-3xl font-black tracking-tighter text-white tabular-nums">
                          ₹<CountUp end={(data?.summary.totalProvisional || 0) / 100} />
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Pending TDS (5%)</p>
                       <p className="text-3xl font-black tracking-tighter text-amber-400 tabular-nums">
                          ₹<CountUp end={(data?.summary.estimatedTDS || 0) / 100} />
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Net Disbursement</p>
                       <p className="text-3xl font-black tracking-tighter text-[#10b981] tabular-nums">
                          ₹<CountUp end={(data?.summary.netPayout || 0) / 100} />
                       </p>
                    </div>
                 </div>

                 <div className="mt-16 flex items-center gap-4 p-5 bg-white/[0.02] rounded-[20px] border border-white/5 w-fit">
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                       {data?.summary.walletCount || 0} Network Wallets Audit-Locked
                    </p>
                 </div>
              </div>
           </div>

           {/* Compliance Monitor */}
           <div className="lg:col-span-4 bg-[#131241] rounded-[2.5rem] p-12 text-white shadow-2xl border border-white/[0.03] relative overflow-hidden group">
              <h3 className="text-2xl font-black font-display mb-12 uppercase tracking-tight">Compliance Status</h3>
              <div className="space-y-10">
                 <div className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">VERIFIED KYC</p>
                          <p className="text-base font-black text-white mt-1">Ready for Payout</p>
                       </div>
                    </div>
                    <span className="text-xl font-black text-emerald-400 tabular-nums">
                       <CountUp end={data?.wallets.filter(w => w.user?.kycStatus === 'approved').length || 0} />
                    </span>
                 </div>
                 <div className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:-rotate-3 transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">PENDING ACTION</p>
                          <p className="text-base font-black text-white mt-1">Wallet Frozen</p>
                       </div>
                    </div>
                    <span className="text-xl font-black text-amber-400 tabular-nums">
                       <CountUp end={data?.wallets.filter(w => w.user?.kycStatus !== 'approved').length || 0} />
                    </span>
                 </div>
              </div>
              <div className="mt-14 p-6 bg-white/[0.03] rounded-[24px] border border-white/5 border-dashed">
                 <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] text-center leading-relaxed">
                    Verified identities are prioritized in the T+3 protocol.
                 </p>
              </div>
           </div>
        </div>

        {/* Member Settlement Ledger */}
        <div className="bg-[#131241] rounded-[2.5rem] shadow-2xl border border-white/[0.03] overflow-hidden">
           <div className="p-12 border-b border-white/5 flex flex-col md:flex-row gap-10 items-center bg-white/[0.01]">
              <div className="relative flex-1 group w-full">
                 <svg className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#10b981] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 <input
                   type="text"
                   placeholder="Search Payout Registry by ID, Name or Role..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] pl-20 pr-10 py-6 text-base text-white font-bold placeholder:text-white/10 focus:bg-white/[0.05] focus:border-[#10b981]/50 transition-all outline-none"
                 />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 bg-white/[0.02]">
                       <th className="px-12 py-8">MEMBER REGISTRY</th>
                       <th className="px-8 py-8">RANK / PROTOCOL</th>
                       <th className="px-8 py-8 text-right">PROVISIONAL</th>
                       <th className="px-8 py-8 text-right">TDS (5%)</th>
                       <th className="px-8 py-8 text-right">NET SETTLEMENT</th>
                       <th className="px-12 py-8 text-center">COMPLIANCE</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       Array(5).fill(0).map((_, i) => (
                         <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-12 py-12"><div className="h-10 bg-white/5 rounded-2xl w-full" /></td>
                         </tr>
                       ))
                    ) : filteredWallets.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="px-12 py-40 text-center text-white/10 font-black uppercase tracking-[0.4em] text-sm">
                             Payout Registry Empty
                          </td>
                       </tr>
                    ) : (
                       filteredWallets.map((wallet) => (
                          <tr 
                            key={wallet._id} 
                            onClick={() => window.location.href = `/admin/members/${wallet.user?._id}`}
                            className="hover:bg-white/[0.04] transition-colors group cursor-pointer border-b border-white/[0.02]"
                          >
                             <td className="px-12 py-10">
                                <div className="flex flex-col">
                                   <span className="text-base font-black text-white group-hover:text-[#10b981] transition-colors">{wallet.user?.name}</span>
                                   <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-[0.2em] mt-2">REG: {wallet.user?.memberId}</span>
                                </div>
                             </td>
                             <td className="px-8 py-10">
                                <div className="text-[11px] font-black text-white/40 uppercase tracking-widest">{wallet.user?.role}</div>
                                <div className="text-[10px] font-bold text-white/15 uppercase mt-2">{wallet.user?.rank || 'UNRANKED'}</div>
                             </td>
                             <td className="px-8 py-10 text-right text-sm font-black text-white/40 tabular-nums">
                                ₹{(wallet.provisionalBalance / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-8 py-10 text-right text-sm font-bold text-amber-500/30 tabular-nums">
                                ₹{(wallet.provisionalBalance * 0.05 / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-8 py-10 text-right text-base font-black text-[#10b981] tabular-nums">
                                ₹{(wallet.provisionalBalance * 0.95 / 100).toLocaleString('en-IN')}
                             </td>
                             <td className="px-12 py-10 text-center">
                                <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-[16px] text-[10px] font-black tracking-[0.2em] border transition-all duration-500 ${
                                   wallet.user?.kycStatus === 'approved' 
                                     ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.15)]' 
                                     : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                                }`}>
                                   <div className={`w-2 h-2 rounded-full ${wallet.user?.kycStatus === 'approved' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400'}`} />
                                   {wallet.user?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                                </div>
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
