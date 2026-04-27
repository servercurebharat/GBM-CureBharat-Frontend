'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletAPI } from '@/lib/api';
import { IWallet, ILedgerEntry } from '@/types';

export default function HbaOverrideIncome() {
  const [ledger, setLedger] = useState<ILedgerEntry[]>([]);
  const [stats, setStats] = useState({ thisMonth: 0, total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      try {
        const res = await walletAPI.getMyWallet();
        if (res.data.success) {
          const wallet: IWallet = res.data.data;
          const overrides = wallet.ledger.filter(entry => entry.type === 'override');
          setLedger(overrides);
          
          const now = new Date();
          const currentCycle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          
          setStats({
            thisMonth: overrides.filter(e => e.cycleMonth === currentCycle).reduce((acc, curr) => acc + curr.amount, 0),
            total: wallet.totalEarned,
            pending: wallet.provisionalBalance
          });
        }
      } catch (err) {
        console.error('Failed to fetch ledger', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  const formatAmount = (val: number) =>
    `₹${(val / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout pageTitle="HBA Override Statement">
       <div className="space-y-8 pb-20">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">Associate Overrides</h2>
                <p className="text-sm text-muted mt-1 font-medium">Monitoring 40% dividends from your direct Manager network earnings</p>
             </div>
             <button className="bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05]">
                Export Report
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
             <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Cycle Dividends</p>
                <h4 className="text-2xl font-display font-bold text-hba">{formatAmount(stats.thisMonth)}</h4>
             </div>
             <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Unsettled Volume</p>
                <h4 className="text-2xl font-display font-bold text-amber-500">{formatAmount(stats.pending)}</h4>
             </div>
             <div className="bg-surface border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Lifetime HBA Bonus</p>
                <h4 className="text-2xl font-display font-bold text-sh">{formatAmount(stats.total)}</h4>
             </div>
          </div>

          <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-white/[0.01] border-b border-white/[0.07]">
                         <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Transaction Date</th>
                         <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Source Manager (HCM)</th>
                         <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Network Activity</th>
                         <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Override</th>
                         <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest text-center">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.04]">
                      {loading ? (
                         Array(5).fill(0).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-white/[0.05] rounded w-full" /></td>
                           </tr>
                         ))
                      ) : ledger.length === 0 ? (
                         <tr><td colSpan={5} className="px-6 py-20 text-center text-sm text-muted font-bold uppercase tracking-widest">No HBA overrides recorded yet</td></tr>
                      ) : (
                         ledger.map((entry) => (
                            <tr key={entry._id} className="hover:bg-white/[0.01] transition-colors">
                               <td className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-tighter">
                                  {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                               </td>
                               <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-white uppercase tracking-tight">
                                     {entry.sourceUserId?.name || 'HCM Network'}
                                  </div>
                                  <div className="text-[9px] font-mono text-muted uppercase tracking-tighter">{entry.sourceUserId?.memberId}</div>
                               </td>
                               <td className="px-6 py-4 text-[10px] text-muted font-medium uppercase tracking-tight max-w-xs truncate">
                                  {entry.description}
                               </td>
                               <td className="px-6 py-4 text-sm font-black text-hba tracking-tighter">
                                  +{formatAmount(entry.amount)}
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex justify-center">
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${entry.status === 'provisional' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-sh/10 text-sh border border-sh/20'}`}>
                                       {entry.status}
                                    </span>
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
