'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api'; 
import { IUser } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminKYC() {
  const [activeTab, setActiveTab] = useState<'kyc' | 'bank'>('kyc');
  const [pendingUsers, setPendingUsers] = useState<IUser[]>([]);
  const [pendingBankUsers, setPendingBankUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
    fetchPendingBank();
  }, []);

  async function fetchPending() {
    try {
      const res = await adminAPI.getPendingKYC();
      if (res.data.success) setPendingUsers(res.data.data || []);
    } catch (err) { toast.error('Failed to fetch pending KYC'); }
  }

  async function fetchPendingBank() {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingBankUpdates();
      if (res.data.success) setPendingBankUsers(res.data.data || []);
    } catch (err) { toast.error('Failed to fetch bank updates'); }
    finally { setLoading(false); }
  }

  async function handleUpdateStatus(id: string, status: 'approved' | 'rejected') {
    setProcessingId(id);
    try {
      const res = await adminAPI.updateKYCStatus(id, status);
      if (res.data.success) {
        toast.success(`KYC ${status} successfully`);
        setPendingUsers(prev => prev.filter(u => u._id !== id));
      }
    } catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setProcessingId(null); }
  }

  async function handleVerifyBank(id: string, status: 'verified' | 'rejected') {
    setProcessingId(id);
    try {
      const res = await adminAPI.verifyBankDetails(id, status);
      if (res.data.success) {
        toast.success(`Bank details ${status} successfully`);
        setPendingBankUsers(prev => prev.filter(u => u._id !== id));
      }
    } catch (err: any) { toast.error(err.response?.data?.message || 'Verification failed'); }
    finally { setProcessingId(null); }
  }

  return (
    <DashboardLayout pageTitle="KYC Management">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / ADMIN / COMPLIANCE</p>
              <h1 className="text-3xl font-bold text-white font-display">KYC & Compliance</h1>
           </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <KYCStat label="PENDING KYC" value={String(pendingUsers.length)} sub="Document review" icon="clock" color="text-[#fbbf24]" />
           <KYCStat label="BANK UPDATES" value={String(pendingBankUsers.length)} sub="Detail verification" icon="bolt" color="text-[#60A5FA]" />
           <KYCStat label="APPROVED TODAY" value="0" sub="Live stat" icon="check" color="text-[#34d399]" />
           <KYCStat label="REJECTION RATE" value="0%" sub="Avg across system" icon="x" color="text-[#f87171]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left Column: Table */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[2rem] shadow-xl border border-white/[0.03] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                 <div className="flex bg-black/40 p-1 rounded-xl">
                    <button 
                      onClick={() => setActiveTab('kyc')}
                      className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'kyc' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
                    >
                      KYC DOCUMENTS ({pendingUsers.length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('bank')}
                      className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'bank' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
                    >
                      BANK UPDATES ({pendingBankUsers.length})
                    </button>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                          <th className="px-8 py-5">MEMBER</th>
                          <th className="px-4 py-5">{activeTab === 'kyc' ? 'JOINED' : 'REQUESTED'}</th>
                          <th className="px-4 py-5">{activeTab === 'kyc' ? 'DOCUMENTS' : 'BANK INFO'}</th>
                          <th className="px-8 py-5 text-right">ACTIONS</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {loading ? (
                          Array(3).fill(0).map((_, i) => (
                             <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                             </tr>
                          ))
                       ) : (activeTab === 'kyc' ? pendingUsers : pendingBankUsers).length === 0 ? (
                          <tr><td colSpan={4} className="px-8 py-20 text-center text-sm text-white/20 font-bold uppercase tracking-widest">No pending {activeTab === 'kyc' ? 'KYC' : 'bank update'} requests ✨</td></tr>
                       ) : (
                          (activeTab === 'kyc' ? pendingUsers : pendingBankUsers).map((u) => (
                             <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">{u.name[0]}</div>
                                      <div>
                                         <div className="text-sm font-bold text-white">{u.name}</div>
                                         <div className="text-[9px] font-black text-white/20 uppercase tracking-tighter">{u.memberId}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-4 py-6 text-xs font-bold text-white/40 uppercase">{new Date(activeTab === 'kyc' ? u.createdAt : u.updatedAt).toLocaleDateString()}</td>
                                <td className="px-4 py-6">
                                   {activeTab === 'kyc' ? (
                                      <Link href={`/admin/kyc/${u._id}`} className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest hover:underline">View Bundle</Link>
                                   ) : (
                                       <div className="space-y-1">
                                          <div className="text-[10px] font-bold text-white tracking-tight">{u.bankDetails?.bankName}</div>
                                          <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">A/C: {u.bankDetails?.accountNumber}</div>
                                          <div className="text-[9px] font-bold text-[#B5B8BD]">IFSC: {u.bankDetails?.ifscCode}</div>
                                          {u.kycDocuments?.bankProofUrl && (
                                             <a 
                                                href={u.kycDocuments.bankProofUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[8px] font-black text-[#60A5FA] hover:text-blue-400 hover:underline uppercase tracking-wider mt-1"
                                             >
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                View Bank Proof
                                             </a>
                                          )}
                                       </div>
                                   )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                         disabled={processingId === u._id}
                                         onClick={() => activeTab === 'kyc' ? handleUpdateStatus(u._id, 'approved') : handleVerifyBank(u._id, 'verified')}
                                         className="px-4 py-2 rounded-lg bg-[#34d399]/10 text-[#34d399] text-[9px] font-black uppercase tracking-widest border border-[#34d399]/20 hover:bg-[#34d399]/20"
                                      >
                                         Approve
                                      </button>
                                      <button 
                                         disabled={processingId === u._id}
                                         onClick={() => activeTab === 'kyc' ? handleUpdateStatus(u._id, 'rejected') : handleVerifyBank(u._id, 'rejected')}
                                         className="px-4 py-2 rounded-lg bg-[#f87171]/10 text-[#f87171] text-[9px] font-black uppercase tracking-widest border border-[#f87171]/20 hover:bg-[#f87171]/20"
                                      >
                                         Reject
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Right Column: Analytics */}
           <div className="lg:col-span-4 space-y-6">               <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
                 <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-10">Verification Stats</h3>
                 <div className="flex flex-col items-center">
                    <div className="w-44 h-44 relative flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="10" opacity="0.05" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#6029F1" strokeWidth="10" strokeDasharray="264" strokeDashoffset="264" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold font-display">0%</span>
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">SYSTEM WIDE</span>
                       </div>
                    </div>
                    <div className="mt-10 space-y-4 w-full">
                       <StatRow label="Approved" value="0" color="bg-[#34d399]" />
                       <StatRow label="Pending KYC" value={String(pendingUsers.length)} color="bg-[#fbbf24]" />
                       <StatRow label="Pending Bank" value={String(pendingBankUsers.length)} color="bg-[#60A5FA]" />
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-[#6029F1] to-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/10">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                    <h3 className="text-sm font-bold font-display uppercase tracking-widest">Compliance Audit</h3>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed mb-6">Review bank account changes carefully to prevent unauthorized payout redirection. Verification status resets on every update.</p>
                 <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">AUDIT LOGS</button>
              </div>

              {/* Security Alert */}
              <div className="bg-gradient-to-br from-[#6029F1] to-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/10">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 className="text-sm font-bold font-display uppercase tracking-widest">Identity Audit</h3>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed mb-6">Automated scans have flagged <span className="text-white font-bold">12 suspicious IDs</span> for manual review. Check for duplicate PAN/Aadhaar entries.</p>
                 <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">RUN AUDIT NOW</button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KYCStat({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-3xl font-bold font-display mb-2">{value}</p>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
       <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 ${color}`}>
          {icon === 'clock' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
          {icon === 'check' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
          {icon === 'x' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
          {icon === 'bolt' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>}
       </div>
    </div>
  );
}

function StatRow({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}
