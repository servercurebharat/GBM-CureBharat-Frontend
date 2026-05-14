'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletAPI, authAPI, dashboardAPI } from '@/lib/api';
import { IWallet, IUser, ILedgerEntry } from '@/types';
import toast from 'react-hot-toast';

export default function WithdrawalPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [requestAmount, setRequestAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, walletRes, summaryRes] = await Promise.all([
          authAPI.getMe(),
          walletAPI.getMyWallet(),
          dashboardAPI.getSummary()
        ]);

        if (userRes.data.success && userRes.data.data) setUser(userRes.data.data);
        if (walletRes.data.success && walletRes.data.data) setWallet(walletRes.data.data);
        if (summaryRes.data.success && summaryRes.data.data) setSummary(summaryRes.data.data);
      } catch (err) {
        console.error('Failed to fetch withdrawal data', err);
        toast.error('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleWithdrawal = async () => {
    const amount = parseFloat(requestAmount);
    if (!amount || amount < 500) {
      return toast.error('Minimum withdrawal is ₹500');
    }
    if (wallet && amount > wallet.finalBalance) {
      return toast.error('Insufficient balance');
    }

    try {
      setSubmitting(true);
      const res = await walletAPI.requestWithdrawal(amount * 100);
      if (res.data.success) {
        toast.success('Withdrawal request submitted successfully');
        setRequestAmount('0');
        // Refresh wallet
        const walletRes = await walletAPI.getMyWallet();
        if (walletRes.data.success && walletRes.data.data) setWallet(walletRes.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const withdrawalHistory = wallet?.ledger?.filter(item => item.type === 'withdrawal') || [];
  const balance = wallet?.finalBalance || 0;
  const tds = parseFloat(requestAmount) * 0.05;
  const netPayable = parseFloat(requestAmount) - tds;

  return (
    <DashboardLayout pageTitle="Withdrawal">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight text-white">Withdrawal Desk</h2>
          <p className="text-sm text-[#64748B] font-medium opacity-70">Manage and track your earning payouts and requested disbursements.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Available Balance', value: formatCurrency(balance), color: 'text-[#60A5FA]' },
             { label: 'MTD Revenue', value: formatCurrency(summary?.metrics?.mtdRevenue || 0), color: 'text-white' },
             { label: 'Total Revenue', value: formatCurrency(summary?.metrics?.totalRevenue || 0), color: 'text-white' },
             { label: 'KYC Status', value: user?.kycStatus?.toUpperCase() || 'PENDING', color: user?.kycStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
                <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</h4>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Request Desk */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[20px] shadow-2xl border border-white/5 flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Withdrawal Request Desk
                 </h3>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-lg border border-white/5">WALLET ID: {user?.memberId}</span>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">Eligible Balance</label>
                       <div className="relative">
                          <input type="text" readOnly value={formatCurrency(balance)} className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-[#64748B] outline-none" />
                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">Request Amount *</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">₹</span>
                          <input 
                            type="number" 
                            value={requestAmount}
                            onChange={(e) => setRequestAmount(e.target.value)}
                            className="w-full bg-white/2 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm font-bold text-white outline-none focus:border-[#60A5FA]/30 transition-all" 
                            min="500"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Bank Account Snapshot */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">Payout Account (KYC Verified)</label>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><rect x="4" y="8" width="16" height="9"></rect><path d="M6 20V8"></path><path d="M10 20V8"></path><path d="M14 20V8"></path><path d="M18 20V8"></path><path d="M12 3L2 8h20L12 3z"></path></svg>
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white">{user?.bankDetails?.bankName || 'No Bank Added'}</p>
                             <p className="text-[10px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">A/C: {user?.bankDetails?.accountNumber || '—'} • {user?.bankDetails?.ifscCode || '—'}</p>
                          </div>
                       </div>
                       {user?.kycStatus === 'approved' ? (
                         <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Verified</span>
                       ) : (
                         <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Pending KYC</span>
                       )}
                    </div>
                 </div>

                 {/* Financial Summary */}
                 <div className="bg-white/2 border border-white/5 rounded-2xl p-8 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-[#B5B8BD] uppercase tracking-wider">Gross Request</span>
                       <span className="text-white">{formatCurrency(parseFloat(requestAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-[#B5B8BD] uppercase tracking-wider flex items-center gap-2">TDS Deduction (5%) <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                       <span className="text-red-400">- {formatCurrency(tds || 0)}</span>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="text-sm font-bold text-white uppercase tracking-widest">Net Payable</span>
                       <span className="text-2xl font-bold text-[#60A5FA]">{formatCurrency(netPayable || 0)}</span>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setRequestAmount('0')}
                      className="flex-1 py-4 rounded-xl text-[11px] font-bold text-[#B5B8BD] border border-white/5 hover:bg-white/5 transition-all uppercase tracking-[0.2em]"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={handleWithdrawal}
                      disabled={submitting || user?.kycStatus !== 'approved' || balance < 500}
                      className="flex-[2] py-4 rounded-xl text-[11px] font-bold text-slate-900 bg-[#60A5FA] shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Processing...' : user?.kycStatus !== 'approved' ? 'KYC Required' : 'Submit Request'}
                    </button>
                 </div>
              </div>
           </div>

           {/* Sidebar Section */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Policy Snapshot */}
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8">Policy Snapshot</h3>
                 <div className="space-y-6">
                    {[
                      { label: 'Minimum Withdrawal', desc: '₹500.00 per transaction.', icon: 'info' },
                      { label: 'Processing Timelines', desc: 'Settlements are processed on weekly cycles.', icon: 'clock' },
                      { label: 'Statutory Deductions', desc: '5% TDS is mandatory for all SH commissions.', icon: 'bank' },
                    ].map((policy, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="mt-1 text-amber-400">
                            {policy.icon === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
                            {policy.icon === 'clock' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                            {policy.icon === 'bank' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><rect x="4" y="8" width="16" height="9"></rect><path d="M6 20V8"></path><path d="M10 20V8"></path><path d="M14 20V8"></path><path d="M18 20V8"></path><path d="M12 3L2 8h20L12 3z"></path></svg>}
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-white">{policy.label}</p>
                            <p className="text-[9px] text-[#64748B] font-medium leading-relaxed mt-0.5">{policy.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Security Hint */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
                 <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-3">Security Note</p>
                 <p className="text-[11px] text-[#64748B] leading-relaxed">
                   Withdrawals can only be sent to the KYC-verified bank account linked to your profile. Payouts are usually credited within 3-5 business days.
                 </p>
              </div>

           </div>
        </div>

        {/* Recent Withdrawal History */}
        <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Withdrawal History</h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-[0.2em]">
                       <th className="px-6 py-4">Transaction Details</th>
                       <th className="px-6 py-4">Date</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/2">
                    {withdrawalHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">No withdrawal history found</td>
                      </tr>
                    ) : (
                      withdrawalHistory.map((item, i) => (
                        <tr key={i} className="hover:bg-white/1 transition-colors">
                           <td className="px-6 py-6">
                              <p className="text-sm font-bold text-white">{item.description}</p>
                              <p className="text-[10px] text-[#64748B] font-bold mt-1 uppercase">ID: {item._id.slice(-8).toUpperCase()}</p>
                           </td>
                           <td className="px-6 py-6 text-xs font-bold text-[#B5B8BD]">{new Date(item.date).toLocaleDateString()}</td>
                           <td className="px-6 py-6">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                item.status === 'final' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                item.status === 'provisional' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {item.status}
                              </span>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <p className="text-sm font-bold text-white">{formatCurrency(Math.abs(item.amount))}</p>
                              <p className="text-[10px] text-red-400 font-bold mt-1 opacity-60">TDS: {formatCurrency(Math.abs(item.amount) * 0.05)}</p>
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
