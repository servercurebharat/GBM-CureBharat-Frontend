'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminManualAdjustmentsPage() {
  const [form, setForm] = useState({ memberId: '', amount: '', type: 'credit' as 'credit' | 'debit', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchingMember, setSearchingMember] = useState(false);
  const [foundMember, setFoundMember] = useState<any>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await adminAPI.getAdjustmentHistory({ page: 1, limit: 10 });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch adjustment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const lookupMember = async () => {
    if (!form.memberId) return;
    setSearchingMember(true);
    try {
      // We can use the usersAPI.getAll with search if we don't have a direct lookup by memberId
      const res = await usersAPI.getAll({ search: form.memberId, limit: 1 });
      if (res.data.success && res.data.data.length > 0) {
        setFoundMember(res.data.data[0]);
      } else {
        setFoundMember(null);
        toast.error('Member not found');
      }
    } catch (err) {
      toast.error('Error searching member');
    } finally {
      setSearchingMember(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId || !form.amount || !form.reason) {
      return toast.error('Please fill all fields');
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.createManualAdjustment({
        memberId: form.memberId,
        amount: parseFloat(form.amount),
        type: form.type,
        reason: form.reason
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Success');
        setForm({ memberId: '', amount: '', type: 'credit', reason: '' });
        setFoundMember(null);
        fetchHistory();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(paise) / 100);
  };

  return (
    <DashboardLayout pageTitle="Manual Adjustments">
      <div className="space-y-6 pb-20">
        {/* Header Section */}
        <div className="bg-[#131241] rounded-[2rem] p-8 mb-8 border border-white/[0.03] shadow-xl text-white">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">CUREBHARAT / ADMIN / MANUAL ADJUSTMENTS</p>
                 <h1 className="text-3xl font-bold font-display text-white">Manual Adjustments</h1>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[9px] font-black uppercase tracking-widest">
                 Audit Locked
              </div>
           </div>
           <p className="text-sm text-white/50 font-medium max-w-2xl leading-relaxed">Apply manual credit or debit corrections to member wallets with full audit traceability.</p>
        </div>

        {/* Top Stats - Currently Static for UI consistency, but can be made dynamic later if needed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <AdjStat label="TOTAL CREDITS" value="₹2.4L" sub="Current quarter" icon="up" color="text-[#34d399]" />
           <AdjStat label="TOTAL DEBITS" value="₹0.8L" sub="System reversals" icon="down" color="text-[#f87171]" />
           <AdjStat label="PENDING ADJ" value="0" sub="All clear" icon="check" color="text-[#60A5FA]" />
           <AuditStatus label="AUDIT STATUS" value="CLEAN" sub="Last check: 2h ago" icon="shield" color="text-[#6029F1]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left Column: Create Adjustment Form */}
           <div className="lg:col-span-5 bg-[#131241] rounded-[2rem] p-10 text-white shadow-xl border border-white/[0.03]">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-[#6029F1]/10 flex items-center justify-center text-[#6029F1]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                 </div>
                 <h3 className="text-xl font-bold font-display">New Adjustment</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-3">Member ID</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input 
                            type="text" 
                            placeholder="Enter Member ID..."
                            value={form.memberId}
                            onChange={(e) => setForm({...form, memberId: e.target.value.toUpperCase()})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:border-[#6029F1]/50 transition-all"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={lookupMember}
                        disabled={searchingMember}
                        className="bg-white/10 px-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        {searchingMember ? '...' : 'Verify'}
                      </button>
                    </div>
                    {foundMember && (
                      <div className="mt-2 px-4 py-2 bg-[#34d399]/10 rounded-xl border border-[#34d399]/20 flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#34d399] uppercase">{foundMember.name}</span>
                        <span className="text-[9px] font-bold text-white/40 uppercase">{foundMember.role}</span>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       type="button"
                       onClick={() => setForm({...form, type: 'credit'})}
                       className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.type === 'credit' ? 'bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399]' : 'bg-white/5 border-white/10 text-white/20'}`}
                    >
                       + Credit
                    </button>
                    <button 
                       type="button"
                       onClick={() => setForm({...form, type: 'debit'})}
                       className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.type === 'debit' ? 'bg-[#f87171]/10 border-[#f87171]/40 text-[#f87171]' : 'bg-white/5 border-white/10 text-white/20'}`}
                    >
                       − Debit
                    </button>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-3">Amount (₹)</label>
                    <input 
                       type="number" 
                       placeholder="0.00"
                       value={form.amount}
                       onChange={(e) => setForm({...form, amount: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-display font-black text-white outline-none focus:border-[#6029F1]/50 transition-all"
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-3">Adjustment Reason</label>
                    <textarea 
                       placeholder="Detail the reason for this manual correction..."
                       rows={4}
                       value={form.reason}
                       onChange={(e) => setForm({...form, reason: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white outline-none focus:border-[#6029F1]/50 transition-all resize-none"
                    />
                 </div>

                 <button 
                    disabled={submitting || !foundMember}
                    className="w-full bg-[#6029F1] hover:brightness-110 py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#6029F1]/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {submitting ? 'Authorizing...' : 'Authorize Adjustment'}
                 </button>
              </form>
           </div>

           {/* Right Column: History */}
           <div className="lg:col-span-7 bg-[#131241] rounded-[2rem] shadow-xl border border-white/[0.03] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-xl font-bold font-display text-white">Adjustment History</h3>
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Audit Log</span>
              </div>
              
              <div className="divide-y divide-white/5 min-h-[400px]">
                 {loadingHistory ? (
                   <div className="p-20 text-center text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Syncing Audit Logs...</div>
                 ) : history.length === 0 ? (
                   <div className="p-20 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">No adjustments recorded yet</div>
                 ) : history.map((adj) => (
                    <div key={adj._id} className="p-8 hover:bg-white/[0.02] transition-all group">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                adj.amount > 0 ? 'bg-[#34d399]/5 border-[#34d399]/20 text-[#34d399]' : 'bg-[#f87171]/5 border-[#f87171]/20 text-[#f87171]'
                             }`}>
                                {adj.amount > 0 ? '+' : '−'}
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-[#60A5FA] transition-colors">{adj.user?.name}</h4>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{adj.user?.memberId} · #{adj._id?.slice(-8).toUpperCase()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-xl font-bold font-display ${adj.amount > 0 ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                                {formatCurrency(adj.amount)}
                             </p>
                             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                {new Date(adj.date).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                       <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                          <p className="text-xs text-white/40 font-medium">"{adj.description.replace('Manual Adjustment: ', '')}"</p>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Auth by: Admin</p>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="p-8 text-center bg-white/[0.01]">
                 <button className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest hover:underline">View Full Audit Trail</button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AdjStat({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-3xl font-bold font-display mb-2 text-white">{value}</p>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
       <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 ${color}`}>
          {icon === 'up' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
          {icon === 'down' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>}
          {icon === 'check' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
       </div>
    </div>
  );
}

function AuditStatus({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          <p className="text-3xl font-bold font-display text-white">{value}</p>
       </div>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
       <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 ${color}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
       </div>
    </div>
  );
}
