'use client';

import { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import ExportDropdown from '@/components/dashboard/ExportDropdown';
import Link from 'next/link';
import CountUp from '@/components/dashboard/CountUp';

export default function AdminWalletLedgerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Ledger...</div>}>
      <LedgerContent />
    </Suspense>
  );
}

function LedgerContent() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('All');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [ledgerRes, summaryRes] = await Promise.all([
        adminAPI.getGlobalLedger({ page, limit: 15, type: type === 'All' ? undefined : type }),
        adminAPI.getAllProvisional()
      ]);
      
      if (ledgerRes.data.success) {
        setTransactions(ledgerRes.data.data);
        setTotal(ledgerRes.data.pagination.total);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data?.summary);
      }
    } catch (err) {
      console.error('Ledger fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [page, type]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  return (
    <DashboardLayout pageTitle="Wallet Ledger">
      <div className="space-y-8 pb-20">
        {/* Header & Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#131241] rounded-[2.5rem] p-8 border border-white/[0.03] shadow-2xl relative group">
           <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-3xl -mr-32 -mt-32" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">FINANCIALS / LEDGER / GLOBAL</p>
              <h1 className="text-4xl font-black text-white font-display tracking-tight">Wallet Ledger</h1>
           </div>
           
           <div className="relative z-10 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">FILTER</span>
                 <select 
                   value={type}
                   onChange={(e) => { setType(e.target.value); setPage(1); }}
                   className="bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold text-white outline-none hover:bg-white/10 transition-all cursor-pointer"
                 >
                    <option className="bg-[#131241]">All Types</option>
                    <option className="bg-[#131241]">Direct</option>
                    <option className="bg-[#131241]">Override</option>
                    <option className="bg-[#131241]">Withdrawal</option>
                 </select>
              </div>
              
              <button 
                onClick={fetchLedger} 
                className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black text-white/60 uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                Refresh
              </button>
              
              <ExportDropdown 
                title="Global Wallet Ledger"
                headers={['Date', 'Member Name', 'Member ID', 'Role', 'Description', 'Amount', 'Status']}
                rows={transactions.map(t => [
                  new Date(t.date).toLocaleDateString(),
                  t.user?.name,
                  t.user?.memberId,
                  t.user?.role?.toUpperCase(),
                  t.description,
                  `Rs. ${(t.amount / 100).toLocaleString()}`,
                  t.status?.toUpperCase()
                ])}
                fileName={`Ledger_${new Date().toISOString().split('T')[0]}`}
              />
           </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <LedgerStat 
             label="TOTAL PROVISIONAL" 
             value={formatCurrency(summary?.totalProvisional || 0)} 
             trend={`Across ${summary?.walletCount || 0} active wallets`} 
             icon="up" 
             color="text-emerald-400"
           />
           <LedgerStat 
             label="ESTIMATED TDS" 
             value={formatCurrency(summary?.estimatedTDS || 0)} 
             trend="2% Government Retention" 
             icon="swap" 
             color="text-amber-400"
           />
           <LedgerStat 
             label="NET PAYOUT LIABILITY" 
             value={formatCurrency(summary?.netPayout || 0)} 
             trend="Final settlement buffer" 
             icon="award" 
             color="text-[#10b981]"
           />
           <LedgerStat 
             label="NETWORK WALLETS" 
             value={summary?.walletCount || 0} 
             trend="Cumulative accounts" 
             icon="down" 
             color="text-blue-400"
           />
        </div>

        {/* Ledger Table Container */}
        <div className="bg-[#131241] rounded-[2.5rem] shadow-2xl border border-white/[0.03] overflow-hidden">
           <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-xl font-black font-display text-white flex items-center gap-3">
                 <div className="w-2 h-6 rounded-full bg-[#10b981]" />
                 Global Transaction Stream
              </h3>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                ENTRY {(page-1)*15 + 1} — {Math.min(page*15, total)} OF {total}
              </span>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                       <th className="px-10 py-6">TIMESTAMP</th>
                       <th className="px-6 py-6">PARTNER IDENTITY</th>
                       <th className="px-6 py-6">CATEGORY</th>
                       <th className="px-6 py-6">TRANSACTION DETAIL</th>
                       <th className="px-6 py-6 text-center">QUANTUM</th>
                       <th className="px-10 py-6 text-right">SETTLEMENT</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       Array(8).fill(0).map((_, i) => (
                         <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-10 py-10"><div className="h-6 bg-white/5 rounded-xl w-full" /></td>
                         </tr>
                       ))
                    ) : transactions.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="px-10 py-32 text-center text-white/10 font-black uppercase tracking-[0.3em] text-xs">
                             End of transaction stream
                          </td>
                       </tr>
                    ) : transactions.map((txn) => (
                       <tr 
                         key={txn._id} 
                         onClick={() => window.location.href = `/admin/members/${txn.user?._id}`}
                         className="hover:bg-white/[0.04] transition-colors group cursor-pointer border-b border-white/[0.02]"
                       >
                          <td className="px-10 py-8">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-white tabular-nums">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-white group-hover:text-[#10b981] transition-colors">{txn.user?.name}</span>
                                <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mt-1">{txn.user?.memberId}</span>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{txn.user?.role?.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-8">
                             <p className="text-xs font-medium text-white/60 leading-relaxed max-w-[300px] truncate group-hover:text-white transition-colors">{txn.description}</p>
                          </td>
                          <td className="px-6 py-8 text-center">
                             <span className={`text-sm font-black tabular-nums ${txn.amount < 0 ? 'text-rose-400' : 'text-[#10b981]'}`}>
                               {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                             </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest border transition-all duration-500 ${
                                txn.status === 'final' || txn.status === 'success' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' :
                                txn.status === 'provisional' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                                'bg-blue-400/10 text-blue-400 border-blue-400/30'
                             }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${txn.status === 'final' || txn.status === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
                                {txn.status?.toUpperCase()}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {/* Pagination */}
           <div className="px-10 py-8 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"/></svg>
                Previous Stream
              </button>
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center text-xs font-black text-white shadow-lg shadow-[#10b981]/20">{page}</div>
              </div>
              <button 
                disabled={page * 15 >= total}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 group"
              >
                Next Stream
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LedgerStat({ label, value, trend, icon, color }: any) {
  // Extract number from currency string if possible
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;

  return (
    <div className="bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/[0.03] relative group overflow-hidden transition-all hover:border-[#10b981]/30">
       <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#10b981]/10 transition-all duration-700" />
       <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{label}</p>
             <p className="text-3xl font-black font-display text-white mb-2 tracking-tighter">
                {typeof value === 'string' && value.includes('₹') ? (
                  <CountUp 
                    end={numericValue} 
                    formatter={(val) => `₹${val.toLocaleString('en-IN')}`} 
                  />
                ) : typeof value === 'number' ? (
                  <CountUp end={value} />
                ) : value}
             </p>
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{trend}</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${color} shadow-lg border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
             {icon === 'up' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
             {icon === 'down' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
             {icon === 'swap' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 10l5 5 5-5"></path><path d="M7 14l5-5 5 5"></path></svg>}
             {icon === 'award' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9V2h12v7"></path><path d="M12 2v7"></path><rect x="6" y="9" width="12" height="6" rx="2"></rect><path d="M10 15l-2 7 4-2 4 2-2-7"></path></svg>}
          </div>
       </div>
    </div>
  );
}
