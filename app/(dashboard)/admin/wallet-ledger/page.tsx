'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { exportToCSV } from '@/lib/utils/export';

export default function AdminWalletLedgerPage() {
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

  const handleExport = () => {
    if (!transactions || transactions.length === 0) return;
    
    const headers = ['Date', 'Member Name', 'Member ID', 'Role', 'Description', 'Amount', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.user?.name,
      t.user?.memberId,
      t.user?.role?.toUpperCase(),
      t.description,
      t.amount / 100,
      t.status?.toUpperCase()
    ]);

    exportToCSV(headers, rows, 'CureBharat_Global_Ledger');
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  return (
    <DashboardLayout pageTitle="Wallet Ledger">
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / ADMIN / WALLET LEDGER</p>
           <h1 className="text-3xl font-bold text-[#000000] font-display">Wallet Ledger</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
           <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-6">Filter Section</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">LEDGER TYPE</p>
                 <select 
                   value={type}
                   onChange={(e) => { setType(e.target.value); setPage(1); }}
                   className="w-full bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                 >
                    <option>All</option>
                    <option>Direct</option>
                    <option>Override</option>
                    <option>Withdrawal</option>
                 </select>
              </div>
              <div className="lg:col-span-3 flex justify-end">
                 <div className="flex gap-3">
                    <button onClick={fetchLedger} className="bg-white/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">Refresh</button>
                    <button className="bg-black/40 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Export PDF</button>
                    <button onClick={handleExport} className="bg-[#6029F1] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6029F1]/20">Download CSV</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <LedgerStat 
             label="TOTAL PROVISIONAL" 
             value={formatCurrency(summary?.totalProvisional || 0)} 
             trend={`Across ${summary?.walletCount || 0} wallets`} 
             icon="up" 
           />
           <LedgerStat 
             label="ESTIMATED TDS" 
             value={formatCurrency(summary?.estimatedTDS || 0)} 
             trend="5% Retention Pool" 
             icon="swap" 
           />
           <LedgerStat 
             label="NET PAYOUT LIABILITY" 
             value={formatCurrency(summary?.netPayout || 0)} 
             trend="Scheduled for cycle" 
             icon="award" 
           />
           <LedgerStat 
             label="TOTAL WALLETS" 
             value={summary?.walletCount || 0} 
             trend="Active with balance" 
             icon="down" 
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Ledger Entries Table */}
           <div className="lg:col-span-12 bg-[#131241] rounded-[2rem] shadow-xl border border-white/[0.03] overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-xl font-bold font-display text-white">Global Ledger Entries</h3>
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                   Showing {(page-1)*15 + 1}-{Math.min(page*15, total)} of {total} entries
                 </span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="px-8 py-5">TXN DATE</th>
                          <th className="px-4 py-5">MEMBER</th>
                          <th className="px-4 py-5">ROLE</th>
                          <th className="px-4 py-5">DESCRIPTION</th>
                          <th className="px-4 py-5 text-center">AMOUNT</th>
                          <th className="px-8 py-5 text-right">STATUS</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {loading ? (
                         <tr><td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-white/20 uppercase animate-pulse">Fetching global ledger data...</td></tr>
                       ) : transactions.length === 0 ? (
                         <tr><td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-white/20 uppercase">No transactions found</td></tr>
                       ) : transactions.map((txn) => (
                          <tr key={txn._id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-8 py-6 text-white/40 font-bold text-[10px] tracking-tight">
                               {new Date(txn.date).toLocaleDateString()}
                             </td>
                             <td className="px-4 py-6">
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-white">{txn.user?.name}</span>
                                   <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{txn.user?.memberId}</span>
                                </div>
                             </td>
                             <td className="px-4 py-6 text-xs font-bold text-white/40 uppercase tracking-widest">{txn.user?.role}</td>
                             <td className="px-4 py-6 text-xs font-medium text-white/60">{txn.description}</td>
                             <td className="px-4 py-6 text-center text-sm font-black text-white">
                               <span className={txn.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                                 {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                               </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                                   txn.status === 'final' || txn.status === 'success' ? 'bg-[#009966]/10 text-[#009966] border-[#009966]/30' :
                                   txn.status === 'provisional' ? 'bg-[#E65C00]/10 text-[#E65C00] border-[#E65C00]/30' :
                                   'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                                }`}>
                                   {txn.status?.toUpperCase()}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="px-8 py-5 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                   className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                 >
                   {'< Previous'}
                 </button>
                 <div className="flex gap-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Page {page}</span>
                 </div>
                 <button 
                   disabled={page * 15 >= total}
                   onClick={() => setPage(p => p + 1)}
                   className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                 >
                   {'Next >'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LedgerStat({ label, value, trend, icon }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group overflow-hidden">
       <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 relative z-10">{label}</p>
       <p className="text-2xl font-bold font-display mb-2 relative z-10">{value}</p>
       <p className="text-[10px] font-bold text-white/20 relative z-10">{trend}</p>
       <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40">
          {icon === 'up' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
          {icon === 'down' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
          {icon === 'swap' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 10l5 5 5-5"></path><path d="M7 14l5-5 5 5"></path></svg>}
          {icon === 'award' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7"></path><path d="M12 2v7"></path><rect x="6" y="9" width="12" height="6" rx="2"></rect><path d="M10 15l-2 7 4-2 4 2-2-7"></path></svg>}
       </div>
    </div>
  );
}
