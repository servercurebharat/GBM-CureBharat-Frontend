'use client';

import { useState, useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import { IUser } from '@/types';
import { ROLE_TAGS } from '@/lib/constants';
import { exportToCSV } from '@/lib/utils/export';
import toast from 'react-hot-toast';

export default function FinanceHubSection({ user }: { user: IUser }) {
  const [data, setData] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'ledger'>('logs');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, withdrawalRes] = await Promise.all([
        walletAPI.getMyWallet(),
        walletAPI.getMyWithdrawals()
      ]);
      if (walletRes.data.success) setData(walletRes.data.data);
      if (withdrawalRes.data.success) setWithdrawals(withdrawalRes.data.data || []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const ledger = data?.ledger;
    if (!ledger || ledger.length === 0) return;
    
    const headers = ['Description', 'Type', 'Date', 'Amount', 'Status'];
    const rows = ledger.map((entry: any) => [
      entry.description,
      entry.type.toUpperCase(),
      new Date(entry.date).toLocaleDateString(),
      entry.amount / 100,
      entry.status.toUpperCase()
    ]);

    exportToCSV(headers, rows, 'CureBharat_Finance_Ledger');
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = parseFloat(withdrawAmount) * 100;
    if (!amountPaise || amountPaise <= 0) return toast.error('Invalid amount');
    
    try {
      const res = await walletAPI.requestWithdrawal(amountPaise);
      if (res.data.success) {
        toast.success('Withdrawal request submitted!');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  if (loading && !data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const currentEarnings = data ? (data.provisionalBalance + data.finalBalance) : 0;
  const walletPercentage = data ? Math.min((currentEarnings / data.capAmount) * 100, 100) : 0;

  // Filter ledger for commission logs
  const commissionLogs = data?.ledger?.filter((entry: any) => 
    ['direct', 'override', 'leadership'].includes(entry.type)
  ) || [];

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{user.role} / Finance Hub</p>
          <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Finance & Payouts</h2>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
           </button>
           <button 
             onClick={() => setShowWithdrawModal(true)}
             className="px-8 py-3 bg-[#131241] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1e1c5c] transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Request Payout
           </button>
        </div>
      </div>

      {/* Top Cards (Dark) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12" />
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Sales</p>
           <h4 className="text-2xl font-black text-white mb-2">{formatCurrency(data?.totalSalesValue || 0)}</h4>
           <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black">
              <span>+12.4%</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
           </div>
        </div>

        {/* Total Commission */}
        <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Commission</p>
           <h4 className="text-2xl font-black text-white mb-2">{formatCurrency(data?.totalEarned || 0)}</h4>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross <span className="text-emerald-400">↗</span></p>
        </div>

        {/* Total Earnings */}
        <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 col-span-1 md:col-span-2">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Earnings Breakdown</p>
           <div className="grid grid-cols-3 gap-4">
              <div>
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Direct</p>
                 <p className="text-lg font-black text-white">{formatCurrency(data?.earningsBreakdown?.direct || 0)}</p>
              </div>
              <div>
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Override</p>
                 <p className="text-lg font-black text-blue-400">{formatCurrency(data?.earningsBreakdown?.override || 0)}</p>
              </div>
              <div>
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Leadership</p>
                 <p className="text-lg font-black text-emerald-400">{formatCurrency(data?.earningsBreakdown?.leadership || 0)}</p>
              </div>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 flex overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${(data?.earningsBreakdown?.direct / data?.totalEarned) * 100 || 0}%` }} />
              <div className="h-full bg-blue-400 transition-all" style={{ width: `${(data?.earningsBreakdown?.override / data?.totalEarned) * 100 || 0}%` }} />
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(data?.earningsBreakdown?.leadership / data?.totalEarned) * 100 || 0}%` }} />
           </div>
        </div>

        {/* Net Wallet */}
        <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 col-span-1 md:col-span-2">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Available for Withdrawal</p>
           <div className="flex justify-between items-end">
              <div>
                 <h4 className="text-3xl font-black text-white">{formatCurrency(data?.finalBalance || 0)}</h4>
                  <div className="flex items-center gap-1.5 mt-2">
                     <p className="text-[10px] font-bold text-slate-500">Provisional: {formatCurrency(data?.provisionalBalance || 0)}</p>
                     <div className="group relative">
                        <svg className="text-slate-500 hover:text-slate-300 cursor-help transition-colors" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#131241] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-[9px] font-medium text-slate-300 leading-normal text-left">
                           Commissions remain provisional during the active cycle. Settled and moved to Available Balance on the 5th of every month.
                        </div>
                     </div>
                  </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
              </div>
           </div>
        </div>
      </div>

      {/* Middle Cards (White) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</p>
              <h5 className="text-lg font-black text-slate-800">{data?.pendingPayouts?.count || 0} Requests</h5>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5">{formatCurrency(data?.pendingPayouts?.value || 0)}</p>
           </div>
        </div>

        {/* Successful */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Successful Payouts</p>
              <h5 className="text-lg font-black text-slate-800">{data?.successfulPayouts?.count || 0} Trans.</h5>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5">{formatCurrency(data?.successfulPayouts?.value || 0)}</p>
           </div>
        </div>

        {/* TDS */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TDS Deducted (5%)</p>
              <h5 className="text-lg font-black text-slate-800">{formatCurrency(data?.totalTDS || 0)}</h5>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5">FY 2024-25</p>
           </div>
        </div>

        {/* Net Wallet */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Wallet Balance</p>
              <h5 className="text-lg font-black text-slate-800">{formatCurrency(data?.finalBalance || 0)}</h5>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5">Available for Payout</p>
           </div>
        </div>
      </div>

      {/* Tabs & Table Section */}
      <div className="bg-[#131241] rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
         {/* Tabs */}
         <div className="flex border-b border-white/5 px-8 pt-6">
            {[
              { id: 'logs', label: 'Commission Logs' },
              { id: 'ledger', label: 'Wallet Ledger' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
         </div>

         {/* Table */}
         <div className="p-4">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <th className="px-6 py-5">Transaction Detail</th>
                        <th className="px-6 py-5">Type / Source</th>
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5 text-right">Amount (₹)</th>
                        <th className="px-6 py-5 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {activeTab === 'logs' ? (
                       commissionLogs.length === 0 ? (
                         <tr><td colSpan={5} className="px-6 py-20 text-center text-xs font-bold text-slate-600 uppercase tracking-widest">No commission logs found</td></tr>
                       ) : (
                         commissionLogs.map((entry: any, i: number) => (
                           <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-6">
                                 <p className="text-[11px] font-black text-white">{entry.description}</p>
                                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ref: #{entry._id?.slice(-8).toUpperCase()}</p>
                              </td>
                              <td className="px-6 py-6">
                                 <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-md uppercase tracking-widest border border-blue-400/20">
                                    {entry.type}
                                 </span>
                              </td>
                              <td className="px-6 py-6 text-xs font-bold text-slate-400">
                                 {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-6 text-right text-xs font-black text-emerald-400">
                                 +{formatCurrency(entry.amount)}
                              </td>
                              <td className="px-6 py-6 text-center">
                                 <span className={`text-[8px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${
                                   entry.status === 'final' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                                 }`}>
                                    {entry.status}
                                 </span>
                              </td>
                           </tr>
                         ))
                       )
                     ) : (
                       data?.ledger?.map((entry: any, i: number) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-6">
                               <p className="text-[11px] font-bold text-white">{entry.description}</p>
                            </td>
                            <td className="px-6 py-6">
                               <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${
                                 entry.amount > 0 ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                               }`}>
                                  {entry.type}
                               </span>
                            </td>
                            <td className="px-6 py-6 text-xs font-bold text-slate-400">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="px-6 py-6 text-right text-xs font-black" style={{ color: entry.amount > 0 ? '#34d399' : '#f87171' }}>
                               {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                            </td>
                            <td className="px-6 py-6 text-center">
                               <span className={`text-[8px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${entry.status === 'final' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-blue-400/10 text-blue-400'}`}>
                                  {entry.status}
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#131241] w-full max-w-md rounded-[32px] p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-white mb-2">Request Payout</h3>
              <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed">Submit your withdrawal request. Note that 5% TDS will be deducted as per government norms.</p>
              
              <form onSubmit={handleWithdraw} className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Amount to Withdraw (₹)</label>
                    
                    {/* Quick Percent Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map(pct => {
                        const pctAmt = ((data?.finalBalance || 0) * pct / 100 / 100).toFixed(2);
                        const isSelected = withdrawAmount === pctAmt;
                        return (
                          <button
                            key={pct}
                            type="button"
                            disabled={(data?.finalBalance || 0) <= 0}
                            onClick={() => setWithdrawAmount(pctAmt)}
                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-white'
                            } disabled:opacity-30`}
                          >
                            {pct}%
                          </button>
                        );
                      })}
                    </div>

                    <input 
                      required
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={(data?.finalBalance || 0) <= 0}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner disabled:opacity-50"
                      placeholder={(data?.finalBalance || 0) <= 0 ? "No withdrawable balance" : "Enter amount or pick % above"}
                    />
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Final Balance: {formatCurrency(data?.finalBalance || 0)}</span>
                    </div>
                 </div>

                 {(data?.finalBalance || 0) <= 0 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <p className="text-[9px] font-semibold leading-relaxed text-slate-300">
                        <strong className="text-amber-400 block mb-0.5 uppercase font-black tracking-wider">Settlement Cycle Pending</strong>
                        Your commissions are currently <span className="text-white font-black">Provisional</span>. The next settlement cycle runs on the <span className="text-amber-400 font-black">5th of the month</span>, transferring them to your withdrawable Final Balance.
                      </p>
                    </div>
                 )}

                 {withdrawAmount && (
                   <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TDS Deduction (5%)</span>
                         <span className="text-xs font-bold text-rose-400">- ₹{(parseFloat(withdrawAmount) * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Net Payout Amount</span>
                         <span className="text-sm font-black text-emerald-400">₹{(parseFloat(withdrawAmount) * 0.95).toFixed(2)}</span>
                      </div>
                   </div>
                 )}

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowWithdrawModal(false)}
                      className="flex-1 py-4 rounded-2xl border border-white/10 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={(data?.finalBalance || 0) <= 0}
                      className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all disabled:opacity-30 disabled:hover:bg-blue-600"
                    >
                       Confirm
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
