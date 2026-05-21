'use client';

import { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, walletAPI } from '@/lib/api';
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
  const [loading, setLoading]           = useState(true);
  const [data, setData]                 = useState<{ wallets: any[]; summary: any } | null>(null);
  const [requests, setRequests]         = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState<'requests' | 'provisional' | 'frozen'>('requests');
  const [processing, setProcessing]     = useState(false);
  const [actionModal, setActionModal]   = useState<{ id: string; name: string; amount: number; requestId: string } | null>(null);
  const [actionType, setActionType]     = useState<'approve' | 'reject' | 'freeze'>('approve');
  const [remarks, setRemarks]           = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getAllProvisional();
      if (res.data.success) setData(res.data.data || null);
    } catch { toast.error('Failed to fetch payout data'); }
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await walletAPI.getAllWithdrawalRequests('all');
      if (res.data.success) setRequests(res.data.data || []);
    } catch { toast.error('Failed to fetch withdrawal requests'); }
    finally { setRequestsLoading(false); }
  };

  useEffect(() => { fetchData(); fetchRequests(); }, []);

  const handleRunCycle = async () => {
    const month = new Date().toISOString().slice(0, 7);
    if (!confirm(`Run Payout Cycle for ${month}? This finalizes all provisional commissions.`)) return;
    setProcessing(true);
    try {
      const res = await adminAPI.triggerPayoutCycle(month);
      if (res.data.success) { toast.success(res.data.message || 'Cycle processed!'); fetchData(); }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cycle failed');
    } finally { setProcessing(false); }
  };

  const openAction = (req: any, type: 'approve' | 'reject' | 'freeze') => {
    setActionModal({ id: req._id, name: req.user?.name, amount: req.netAmount, requestId: req.requestId });
    setActionType(type);
    setRemarks('');
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      const res = await walletAPI.updateWithdrawalStatus(actionModal.id, actionType, remarks);
      if (res.data.success) {
        toast.success(`Request ${actionType}d successfully`);
        setActionModal(null);
        fetchRequests(); fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setActionLoading(false); }
  };

  const handleUnfreeze = async (walletId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unfreeze the wallet of ${userName}?`)) return;
    setActionLoading(true);
    try {
      const res = await walletAPI.unfreezeWallet(walletId);
      if (res.data.success) {
        toast.success(`Account of ${userName} unfrozen successfully`);
        fetchRequests(); fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unfreeze account');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const frozenWallets   = data?.wallets.filter(w => (w as any).frozen) || [];

  const filteredWallets = (data?.wallets || []).filter(w =>
    w.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.user?.memberId?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.memberId?.toLowerCase().includes(search.toLowerCase()) ||
    r.requestId?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtCurr = (paise: number) =>
    `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout pageTitle="Payout Management">
      <div className="space-y-6 pb-20">

        {/* Header */}
        <div className="bg-[#131241] rounded-[2rem] p-8 shadow-2xl border border-white/[0.03] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Treasury / Payout / Settlement</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Payout Command Center</h1>
              <p className="text-xs text-white/30 mt-2">Approve, reject, or freeze withdrawal requests. Monitor all network liabilities.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleRunCycle} disabled={processing}
                className="px-6 py-3 rounded-2xl bg-emerald-500 text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50">
                <div className={`w-2 h-2 rounded-full bg-white ${processing ? 'animate-ping' : ''}`} />
                {processing ? 'Executing...' : 'Run Settlement Cycle'}
              </button>
              <ExportDropdown
                title="Payout Report"
                headers={['Name', 'Member ID', 'Role', 'Provisional', 'TDS (5%)', 'Net Payout', 'KYC Status']}
                rows={data?.wallets.map(w => [
                  w.user?.name, w.user?.memberId, w.user?.role?.toUpperCase(),
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

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Requests', value: pendingRequests.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', tab: 'requests' as const },
            { label: 'Ready for Payout', value: data?.wallets.filter(w => w.user?.kycStatus === 'approved').length || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', tab: 'provisional' as const },
            { label: 'Wallet Frozen', value: frozenWallets.length, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', tab: 'frozen' as const },
            { label: 'Total Provisional', value: `₹${((data?.summary?.totalProvisional || 0) / 100).toLocaleString('en-IN')}`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', tab: null },
          ].map((stat, i) => (
            <button key={i}
              onClick={() => stat.tab && setActiveTab(stat.tab)}
              className={`bg-[#131241] rounded-2xl p-5 border text-left transition-all shadow-xl ${stat.tab ? 'hover:border-white/20 cursor-pointer hover:scale-[1.02]' : 'cursor-default'} ${activeTab === stat.tab ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5'}`}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-2xl font-black tabular-nums ${stat.color}`}>
                {typeof stat.value === 'number' ? <CountUp end={stat.value} /> : stat.value}
              </p>
              {stat.tab && <p className="text-[9px] font-bold text-white/20 mt-1">Click to view →</p>}
            </button>
          ))}
        </div>

        {/* Tab + Search */}
        <div className="bg-[#131241] rounded-[2rem] shadow-2xl border border-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-white/5 flex-wrap">
            <div className="flex gap-2">
              {([
                { id: 'requests',    label: 'Withdrawal Requests', badge: pendingRequests.length },
                { id: 'provisional', label: 'Provisional Wallets', badge: null },
                { id: 'frozen',      label: 'Frozen Accounts',    badge: frozenWallets.length },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                  }`}>
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="bg-amber-500 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search by name, ID..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all" />
            </div>
          </div>

          {/* ── TAB: Withdrawal Requests ── */}
          {activeTab === 'requests' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em] border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5">Request ID</th>
                    <th className="px-6 py-5">Member</th>
                    <th className="px-6 py-5 text-right">Gross Amount</th>
                    <th className="px-6 py-5 text-right">TDS (5%)</th>
                    <th className="px-6 py-5 text-right">Net Payout</th>
                    <th className="px-6 py-5 text-center">KYC</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requestsLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse"><td colSpan={8} className="px-8 py-5"><div className="h-8 bg-white/5 rounded-xl w-full" /></td></tr>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan={8} className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs">No withdrawal requests found</td></tr>
                  ) : filteredRequests.map(req => (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-blue-400 font-mono">{req.requestId}</span>
                        <p className="text-[9px] text-white/20 mt-0.5">{new Date(req.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-white">{req.user?.name}</p>
                        <p className="text-[9px] font-bold text-emerald-400/70 uppercase">{req.user?.memberId} · {req.user?.role?.toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-white/60 tabular-nums">{fmtCurr(req.grossAmount)}</td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-rose-400/70 tabular-nums">-{fmtCurr(req.tdsAmount)}</td>
                      <td className="px-6 py-5 text-right text-sm font-black text-emerald-400 tabular-nums">{fmtCurr(req.netAmount)}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${req.user?.kycStatus === 'approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
                          {req.user?.kycStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${
                          req.status === 'pending'   ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                          req.status === 'success'   ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          'text-rose-400 bg-rose-400/10 border-rose-400/20'
                        }`}>{req.status?.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openAction(req, 'approve')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                              Approve
                            </button>
                            <button onClick={() => openAction(req, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                              Reject
                            </button>
                            <button onClick={() => openAction(req, 'freeze')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all">
                              Freeze
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-white/20 font-bold">{req.remarks || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB: Provisional Wallets ── */}
          {activeTab === 'provisional' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em] border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5">Member</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5 text-right">Provisional</th>
                    <th className="px-6 py-5 text-right">TDS (5%)</th>
                    <th className="px-6 py-5 text-right">Net Settlement</th>
                    <th className="px-6 py-5 text-center">KYC Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-5"><div className="h-8 bg-white/5 rounded-xl" /></td></tr>
                  )) : filteredWallets.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs">No provisional wallets</td></tr>
                  ) : filteredWallets.map(wallet => (
                    <tr key={wallet._id} onClick={() => window.location.href = `/admin/members/${wallet.user?._id}`}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{wallet.user?.name}</p>
                        <p className="text-[9px] font-bold text-emerald-400/60 uppercase">{wallet.user?.memberId}</p>
                      </td>
                      <td className="px-6 py-5 text-[10px] font-black text-white/40 uppercase">{wallet.user?.role}</td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-white/50 tabular-nums">{fmtCurr(wallet.provisionalBalance)}</td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-amber-400/60 tabular-nums">{fmtCurr(wallet.provisionalBalance * 0.05)}</td>
                      <td className="px-6 py-5 text-right text-sm font-black text-emerald-400 tabular-nums">{fmtCurr(wallet.provisionalBalance * 0.95)}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${
                          wallet.user?.kycStatus === 'approved'
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                            : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        }`}>
                          {wallet.user?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB: Frozen Accounts ── */}
          {activeTab === 'frozen' && (
            <div className="p-8">
              {frozenWallets.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl mx-auto mb-4">🔒</div>
                  <p className="text-white/20 font-black uppercase tracking-widest text-xs">No frozen accounts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {frozenWallets.map((wallet: any) => (
                    <div key={wallet._id} className="flex items-center justify-between p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">🔒</div>
                        <div>
                          <p className="text-sm font-black text-white">{wallet.user?.name}</p>
                          <p className="text-[9px] font-bold text-rose-400/70 uppercase">{wallet.user?.memberId} · {wallet.user?.role?.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-black text-rose-400">{fmtCurr(wallet.finalBalance)}</p>
                          <p className="text-[9px] text-white/20">{(wallet as any).frozenReason || 'Admin action'}</p>
                        </div>
                        <button
                          onClick={() => handleUnfreeze(wallet._id, wallet.user?.name)}
                          disabled={actionLoading}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          Unfreeze
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#131241] w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 mx-auto ${
              actionType === 'approve' ? 'bg-emerald-500/10 text-emerald-400' :
              actionType === 'reject'  ? 'bg-rose-500/10 text-rose-400' :
                                         'bg-amber-500/10 text-amber-400'
            }`}>
              {actionType === 'approve' ? '✓' : actionType === 'reject' ? '✕' : '🔒'}
            </div>

            <h3 className="text-lg font-black text-white text-center mb-1 capitalize">{actionType} Request</h3>
            <p className="text-xs text-white/40 text-center mb-6">
              {actionType === 'approve' && `Approve payout of ${fmtCurr(actionModal.amount)} (net) to ${actionModal.name}?`}
              {actionType === 'reject'  && `Reject request ${actionModal.requestId} from ${actionModal.name}? Amount will be refunded.`}
              {actionType === 'freeze'  && `Freeze ${actionModal.name}'s wallet? All pending requests will be put on hold.`}
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Remarks (optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={actionType === 'approve' ? 'e.g. Payment transferred via NEFT' : 'e.g. KYC mismatch'}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} disabled={actionLoading}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[11px] font-black text-white/60 uppercase tracking-widest hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleAction} disabled={actionLoading}
                className={`flex-1 py-3 rounded-xl text-[11px] font-black text-white uppercase tracking-widest transition-all disabled:opacity-50 ${
                  actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' :
                  actionType === 'reject'  ? 'bg-rose-600 hover:bg-rose-500' :
                                             'bg-amber-600 hover:bg-amber-500'
                }`}>
                {actionLoading ? 'Processing...' : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
