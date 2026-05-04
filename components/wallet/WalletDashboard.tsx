'use client';

import { useEffect, useState } from 'react';
import WalletCard from '@/components/ui/WalletCard';
import { walletAPI } from '@/lib/api';
import { ILedgerEntry } from '@/types';
import { toast } from 'react-hot-toast';

const TYPE_CONFIG: Record<string, { label: string, color: string, icon: string }> = {
  direct: { label: 'Direct Commission', color: 'text-emerald-400', icon: '💰' },
  override: { label: 'Override Income', color: 'text-blue-400', icon: '📈' },
  leadership: { label: 'Leadership Bonus', color: 'text-purple-400', icon: '🏆' },
  withdrawal: { label: 'Withdrawal', color: 'text-rose-400', icon: '🏧' },
  tds_deduction: { label: 'TDS Deduction', color: 'text-amber-400', icon: '📋' },
};

interface WalletDashboardProps {
  color: string;
  withdrawalPath: string;
}

export default function WalletDashboard({ color, withdrawalPath }: WalletDashboardProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchWallet = async () => {
    try {
      const res = await walletAPI.getMyWallet();
      if (res.data.success) {
        setWallet(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const filteredLedger = wallet?.ledger?.filter((entry: ILedgerEntry) => {
    if (filter === 'all') return true;
    if (filter === 'income') return ['direct', 'override', 'leadership'].includes(entry.type);
    if (filter === 'withdrawal') return entry.type === 'withdrawal';
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Wallet Card and Breakdown */}
        <div className="lg:col-span-4 space-y-8">
          {loading ? (
             <div className="h-64 bg-[#131241] rounded-[2rem] animate-pulse border border-white/5" />
          ) : (
            <WalletCard
              provisionalBalance={(wallet?.provisionalBalance || 0) / 100}
              finalBalance={(wallet?.finalBalance || 0) / 100}
              totalEarned={(wallet?.totalEarned || 0) / 100}
              totalWithdrawn={(wallet?.totalWithdrawn || 0) / 100}
              color={color}
              onWithdraw={() => window.location.href = withdrawalPath}
            />
          )}

          {/* Income Breakdown Card */}
          <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16" />
             <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-8">Earnings Breakdown</h3>
             
             <div className="space-y-6">
                <BreakdownRow 
                  label="Direct (Personal)" 
                  value={(wallet?.earningsBreakdown?.direct || 0) / 100} 
                  barColor="bg-emerald-400" 
                  percentage={wallet?.totalEarned > 0 ? (wallet?.earningsBreakdown?.direct / wallet?.totalEarned * 100) : 0}
                />
                <BreakdownRow 
                  label="Override (Team)" 
                  value={(wallet?.earningsBreakdown?.override || 0) / 100} 
                  barColor="bg-blue-400" 
                  percentage={wallet?.totalEarned > 0 ? (wallet?.earningsBreakdown?.override / wallet?.totalEarned * 100) : 0}
                />
                <BreakdownRow 
                  label="Leadership (SH)" 
                  value={(wallet?.earningsBreakdown?.leadership || 0) / 100} 
                  barColor="bg-purple-400" 
                  percentage={wallet?.totalEarned > 0 ? (wallet?.earningsBreakdown?.leadership / wallet?.totalEarned * 100) : 0}
                />
             </div>

             <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Provisional</span>
                  <span className="text-xl font-bold font-display">₹{((wallet?.provisionalBalance || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-8">
          <div className="bg-[#131241] rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col h-full min-h-[600px]">
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.01]">
               <div>
                  <h2 className="text-xl font-black text-white font-display uppercase tracking-tight">Transaction History</h2>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Audit-ready income records</p>
               </div>

               <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
                  <FilterButton active={filter === 'income'} onClick={() => setFilter('income')}>Income</FilterButton>
                  <FilterButton active={filter === 'withdrawal'} onClick={() => setFilter('withdrawal')}>Payouts</FilterButton>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {loading ? (
                <div className="py-20 text-center text-white/20 font-black uppercase tracking-[0.2em] text-[10px]">Updating Ledger...</div>
              ) : filteredLedger.length === 0 ? (
                <div className="py-32 text-center">
                   <div className="text-5xl mb-6 opacity-10">📂</div>
                   <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px]">No records found in this cycle</p>
                   <p className="text-white/10 font-bold uppercase tracking-widest text-[9px] mt-2 italic">Earnings will appear here after team activity</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredLedger.map((entry: any, i: number) => (
                    <div key={i} className="py-8 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-all group rounded-[1.5rem]">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {TYPE_CONFIG[entry.type]?.icon || '💰'}
                         </div>
                         <div>
                            <p className="text-sm font-black text-white/90 leading-tight mb-2 tracking-tight">{entry.description}</p>
                            <div className="flex items-center gap-4">
                               <span className={`text-[9px] font-black uppercase tracking-widest ${TYPE_CONFIG[entry.type]?.color}`}>
                                  {TYPE_CONFIG[entry.type]?.label || entry.type}
                               </span>
                               <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                                  {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </span>
                               {entry.cycleMonth && (
                                 <>
                                   <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5`} style={{ color }}>CYCLE: {entry.cycleMonth}</span>
                                 </>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="text-right">
                         <p className={`text-xl font-black font-display tracking-tighter ${entry.amount >= 0 ? 'text-[#34d399]' : 'text-rose-500'}`}>
                            {entry.amount >= 0 ? '+' : ''}₹{(Math.abs(entry.amount) / 100).toLocaleString('en-IN')}
                         </p>
                         <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.15em] border ${
                            entry.status === 'provisional' 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20'
                         }`}>
                            {entry.status}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, barColor, percentage }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-bold text-white">₹{value.toLocaleString('en-IN')}</p>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} transition-all duration-1000`} 
            style={{ width: `${Math.max(percentage, 2)}%` }} 
          />
       </div>
    </div>
  );
}

function FilterButton({ active, children, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-white/40 hover:text-white/60'
      }`}
    >
      {children}
    </button>
  );
}
