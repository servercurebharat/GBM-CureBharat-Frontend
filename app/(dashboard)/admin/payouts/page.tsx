'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function AdminPayouts() {
  const [data, setData] = useState<{ wallets: any[]; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [cycleMonth, setCycleMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchProvisional();
  }, []);

  async function fetchProvisional() {
    setLoading(true);
    try {
      const res = await adminAPI.getAllProvisional();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      addToast({ message: 'Failed to fetch payout data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRunPayout() {
    if (confirmText !== 'CONFIRM') return;
    
    setProcessing(true);
    try {
      const res = await adminAPI.triggerPayoutCycle(cycleMonth);
      if (res.data.success) {
        addToast({ message: `Payout cycle for ${cycleMonth} completed!`, type: 'success' });
        setShowConfirm(false);
        setConfirmText('');
        fetchProvisional();
      }
    } catch (err: any) {
      addToast({ message: err.response?.data?.message || 'Cycle failed', type: 'error' });
    } finally {
      setProcessing(false);
    }
  }

  const formatAmount = (val: number) =>
    `₹${(val / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout pageTitle="Payout Approval Engine">
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">Earnings Settlement</h2>
              <p className="text-sm text-muted mt-1 font-medium">Finalize provisional earnings and initiate bank transfers</p>
           </div>
           <div className="flex gap-3">
              <input 
                type="month" 
                value={cycleMonth}
                onChange={(e) => setCycleMonth(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-admin/50"
              />
              <button 
                onClick={() => setShowConfirm(true)}
                disabled={!data || data.wallets.length === 0 || processing}
                className="bg-hcm text-[#0d0f14] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-20 transition-all shadow-lg shadow-hcm/10"
              >
                Run Payout Cycle
              </button>
           </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
           <SummaryCard label="Total Provisional" val={formatAmount(data?.summary.totalProvisional || 0)} color="#8b7cf8" />
           <SummaryCard label="Estimated TDS" val={formatAmount(data?.summary.estimatedTDS || 0)} color="#f87171" />
           <SummaryCard label="Net Payable" val={formatAmount(data?.summary.netPayout || 0)} color="#34d399" />
           <SummaryCard label="Active Wallets" val={String(data?.summary.walletCount || 0)} color="#60a5fa" />
        </div>

        <div className="bg-hcm/5 border border-hcm/20 rounded-2xl p-4 flex items-center gap-4">
           <span className="text-xl">⚠️</span>
           <p className="text-[10px] font-bold text-hcm uppercase tracking-widest leading-relaxed">
             This operation will move all provisional earnings to final balances for the selected cycle. 
             This action is irreversible and triggers TDS ledger entries.
           </p>
        </div>

        {/* Detailed Table */}
        <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white/[0.01] border-b border-white/[0.07]">
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Member</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Rank</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Provisional</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Est. TDS</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Net Payout</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">PAN</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                   {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-white/[0.05] rounded w-full" /></td>
                        </tr>
                      ))
                   ) : data?.wallets.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-20 text-center text-sm text-muted uppercase tracking-widest font-bold">No provisional earnings to settle</td></tr>
                   ) : (
                     data?.wallets.map((w: any) => (
                       <tr key={w._id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                             <div className="text-sm font-bold text-white">{w.user.name}</div>
                             <div className="text-[10px] font-mono text-muted uppercase tracking-tighter">{w.user.memberId}</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[9px] font-black uppercase tracking-widest">
                                {w.user.rank}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{formatAmount(w.provisionalBalance)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-hcm">{formatAmount(w.provisionalBalance * 0.05)}</td>
                          <td className="px-6 py-4 text-sm font-black text-sh">{formatAmount(w.provisionalBalance * 0.95)}</td>
                          <td className="px-6 py-4 text-[10px] font-mono text-muted uppercase">{w.user.kycDocuments?.panNumber || 'NO PAN'}</td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-[#0d0f14]/90 backdrop-blur-xl" onClick={() => !processing && setShowConfirm(false)} />
             <div className="relative w-full max-w-md bg-surface border border-hcm/20 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                   <div className="w-20 h-20 bg-hcm/10 border border-hcm/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">❗</div>
                   <h3 className="font-display text-2xl font-bold text-white tracking-tight">Destructive Action</h3>
                   <p className="text-sm text-muted mt-2 font-medium">
                     You are about to finalize payouts for <b>{cycleMonth}</b>. All provisional earnings will become final.
                   </p>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-muted uppercase tracking-widest text-center">Type <span className="text-white">CONFIRM</span> to proceed</p>
                   <input 
                     type="text"
                     value={confirmText}
                     onChange={(e) => setConfirmText(e.target.value)}
                     placeholder="Type here..."
                     className="w-full bg-surface2 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white outline-none focus:border-hcm/50"
                   />
                   <button 
                     disabled={confirmText !== 'CONFIRM' || processing}
                     onClick={handleRunPayout}
                     className="w-full py-5 rounded-2xl bg-hcm text-[#0d0f14] font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-20 shadow-2xl shadow-hcm/20"
                   >
                     {processing ? 'Processing Cycle...' : 'Authorize Settlement'}
                   </button>
                   <button 
                     disabled={processing}
                     onClick={() => setShowConfirm(false)}
                     className="w-full py-2 text-[10px] font-bold text-muted uppercase tracking-widest hover:text-white"
                   >
                     Cancel
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, val, color }: any) {
  return (
    <div className="bg-surface border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden group">
       <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" style={{ backgroundColor: color, borderRadius: '0 0 0 100%' }} />
       <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
       <h4 className="text-xl font-display font-bold text-white" style={{ color }}>{val}</h4>
    </div>
  );
}
