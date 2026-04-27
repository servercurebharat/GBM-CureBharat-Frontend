'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api'; 
import { IUser } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function AdminKYC() {
  const [pendingUsers, setPendingUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingKYC();
      if (res.data.success) {
        setPendingUsers(res.data.data || []);
      }
    } catch (err) {
      addToast({ message: 'Failed to fetch pending KYC', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: 'approved' | 'rejected') {
    setProcessingId(id);
    try {
      const res = await adminAPI.updateKYCStatus(id, status);
      if (res.data.success) {
        addToast({ message: `KYC ${status} successfully`, type: 'success' });
        setPendingUsers(prev => prev.filter(u => u._id !== id));
        if (selectedUser?._id === id) setSelectedUser(null);
      }
    } catch (err: any) {
      addToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <DashboardLayout pageTitle="KYC Approval Vault">
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">Identity Verification</h2>
              <p className="text-sm text-muted mt-1 font-medium">Verify member documents to enable commission payouts</p>
           </div>
           <div className="bg-admin/10 border border-admin/20 px-4 py-2 rounded-xl text-admin text-[10px] font-black uppercase tracking-widest">
              {pendingUsers.length} Pending Requests
           </div>
        </div>

        <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white/[0.01] border-b border-white/[0.07]">
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Member</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Joined</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">State</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Documents</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest text-center">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                   {loading ? (
                     Array(3).fill(0).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                         <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-white/[0.05] rounded w-full" /></td>
                       </tr>
                     ))
                   ) : pendingUsers.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-20 text-center text-sm text-muted">No pending KYC requests found. All clear! ✨</td></tr>
                   ) : (
                     pendingUsers.map((u) => (
                       <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4">
                             <div className="text-sm font-bold text-white">{u.name}</div>
                             <div className="text-[10px] font-mono text-muted uppercase tracking-tighter mt-1">{u.memberId} · {u.mobile}</div>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-tighter">
                             {new Date(u.joiningDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-tighter">{u.state}</td>
                          <td className="px-6 py-4">
                             <button 
                               onClick={() => setSelectedUser(u)}
                               className="text-[10px] font-bold text-admin uppercase tracking-widest hover:underline"
                             >
                               View Identity Bundle
                             </button>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex justify-center gap-3">
                                <button 
                                  disabled={processingId === u._id}
                                  onClick={() => handleUpdateStatus(u._id, 'approved')}
                                  className="px-4 py-2 rounded-lg bg-sh/10 border border-sh/20 text-sh text-[10px] font-black uppercase tracking-widest hover:bg-sh/20 transition-all disabled:opacity-20"
                                >
                                  Approve
                                </button>
                                <button 
                                  disabled={processingId === u._id}
                                  onClick={() => handleUpdateStatus(u._id, 'rejected')}
                                  className="px-4 py-2 rounded-lg bg-hcm/10 border border-hcm/20 text-hcm text-[10px] font-black uppercase tracking-widest hover:bg-hcm/20 transition-all disabled:opacity-20"
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

        {/* Modal for detailed view */}
        {selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-[#0d0f14]/80 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
             <div className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="font-display text-xl font-bold text-white tracking-tight">{selectedUser.name}</h3>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Identity Bundle · {selectedUser.memberId}</p>
                   </div>
                   <button onClick={() => setSelectedUser(null)} className="text-muted hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <DocItem label="Aadhaar Number" val={selectedUser.kycDocuments?.aadhaarNumber || 'Not provided'} />
                   <DocItem label="PAN Number" val={selectedUser.kycDocuments?.panNumber || 'Not provided'} />
                   <DocItem label="Bank Name" val={selectedUser.kycDocuments?.bankName || 'Not provided'} />
                   <DocItem label="Account Number" val={selectedUser.kycDocuments?.accountNumber || 'Not provided'} />
                   <div className="col-span-2">
                      <DocItem label="IFSC Code" val={selectedUser.kycDocuments?.ifscCode || 'Not provided'} />
                   </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/[0.07]">
                   <button 
                     disabled={processingId === selectedUser._id}
                     onClick={() => handleUpdateStatus(selectedUser._id, 'approved')}
                     className="flex-1 py-4 rounded-2xl bg-sh text-[#0d0f14] font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                   >
                     Approve KYC
                   </button>
                   <button 
                     disabled={processingId === selectedUser._id}
                     onClick={() => handleUpdateStatus(selectedUser._id, 'rejected')}
                     className="flex-1 py-4 rounded-2xl bg-hcm text-[#0d0f14] font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                   >
                     Reject Application
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function DocItem({ label, val }: { label: string; val: string }) {
  return (
    <div className="space-y-1.5 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
       <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
       <p className="text-sm font-bold text-white tracking-tight truncate">{val}</p>
    </div>
  );
}
