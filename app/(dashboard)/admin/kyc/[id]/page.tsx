'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, adminAPI } from '@/lib/api';
import { IUser } from '@/types';
import { toast } from 'react-hot-toast';

export default function IndividualKYCReview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await usersAPI.getById(id);
      if (res.data.success) {
        setUser(res.data.data || null);
      }
    } catch (err) {
      toast.error('Failed to load user KYC details');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(status: 'approved' | 'rejected') {
    setProcessing(true);
    try {
      const res = await adminAPI.updateKYCStatus(id, status);
      if (res.data.success) {
        toast.success(`Application ${status} successfully`);
        router.push('/admin/kyc');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Review KYC">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout pageTitle="Review KYC">
        <div className="text-center py-20 bg-[#131241] rounded-[2rem] border border-white/[0.03] max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4">User Not Found</h2>
          <button onClick={() => router.back()} className="text-xs font-black text-[#10b981] uppercase tracking-widest underline">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={`Review - ${user.name}`}>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
           <button onClick={() => router.back()} className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-[#10b981] transition-colors">
             ← Back to KYC List
           </button>
           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
             user.kycStatus === 'approved' ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20' : 'bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20'
           }`}>{user.kycStatus}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left Section: Details */}
           <div className="lg:col-span-7 space-y-6">
              {/* Member Card */}
              <div className="bg-[#131241] rounded-[2rem] p-8 shadow-xl border border-white/[0.03]">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-[#10b981]">
                      {user.name[0]}
                    </div>
                    <div>
                       <h1 className="text-2xl font-bold text-white font-display tracking-tight leading-none mb-2">{user.name}</h1>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{user.memberId} · {user.role.toUpperCase()}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                    <InfoBlock label="Mobile Number" value={user.mobile} />
                    <InfoBlock label="State / Region" value={user.state || 'N/A'} />
                 </div>
              </div>

              {/* Document Review Bundle */}
              <div className="bg-[#131241] rounded-[2rem] p-8 shadow-xl border border-white/[0.03]">
                 <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Verification Documents & Live Capture</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                       <DocCard title="Live Verification Selfie" val="Captured Face Identity" url={user.kycDocuments?.selfieUrl} onPreview={setSelectedImage} />
                    </div>
                    <DocCard title="Aadhaar Front" val={user.kycDocuments?.aadhaarNumber || 'Not Uploaded'} url={user.kycDocuments?.aadhaarFrontUrl} onPreview={setSelectedImage} />
                    <DocCard title="Aadhaar Back" val={user.kycDocuments?.aadhaarNumber || 'Not Uploaded'} url={user.kycDocuments?.aadhaarBackUrl} onPreview={setSelectedImage} />
                    <DocCard title="PAN Card" val={user.kycDocuments?.panNumber || 'Not Uploaded'} url={user.kycDocuments?.panUrl} onPreview={setSelectedImage} />
                    <DocCard title="Bank Proof (Passbook/Cheque)" val={user.kycDocuments?.bankName || 'Not Uploaded'} url={user.kycDocuments?.bankProofUrl} onPreview={setSelectedImage} />
                 </div>
              </div>
           </div>

           {/* Right Section: Decision Actions */}
           <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03] relative overflow-hidden">
                 {/* Glowing ambient decoration */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-[#10b981]/10 to-transparent blur-2xl pointer-events-none" />

                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 relative z-10">Administrative Actions</h3>
                 <div className="space-y-3 relative z-10">
                    <button 
                      disabled={processing} 
                      onClick={() => handleUpdateStatus('approved')} 
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black text-[10px] uppercase tracking-widest transition-all hover:brightness-110 shadow-lg shadow-[#10b981]/10 active:scale-[0.98] disabled:opacity-50"
                    >
                       {processing ? 'Processing...' : 'Approve & Activate'}
                    </button>
                    <button 
                      disabled={processing} 
                      onClick={() => handleUpdateStatus('rejected')} 
                      className="w-full py-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                       Reject Application
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Premium Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute inset-0 bg-[#0b0a24]/90 backdrop-blur-xl" />
          <div 
            className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 m-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all z-20"
            >
              ✕
            </button>
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={selectedImage} 
                alt="Document Preview" 
                className="w-full h-full object-contain bg-black/10"
              />
            </div>
            <p className="mt-4 text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Click anywhere outside to close preview</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</p>
       <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function DocCard({ title, val, url, onPreview }: { title: string; val: string; url?: string, onPreview: (url: string) => void }) {
  return (
    <div 
      onClick={() => url && onPreview(url)} 
      className={`p-4 rounded-xl border transition-all ${
        url 
          ? 'bg-white/[0.02] border-white/5 hover:border-[#10b981]/40 cursor-pointer group' 
          : 'bg-rose-500/5 border-rose-500/10'
      }`}
    >
      <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-lg bg-black/20 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {url ? (
              <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <span className="text-xs">❌</span>
            )}
         </div>
         <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">{title}</p>
            <p className="text-xs font-bold text-white truncate">{val}</p>
            {url ? (
              <p className="text-[8px] font-black text-[#60A5FA] uppercase mt-1">Click to Preview</p>
            ) : (
              <p className="text-[8px] font-black text-rose-500 uppercase mt-1">Missing</p>
            )}
         </div>
      </div>
    </div>
  );
}
