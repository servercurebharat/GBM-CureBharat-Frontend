'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, adminAPI } from '@/lib/api';
import { IUser } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function IndividualKYCReview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToast } = useToast();
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
      addToast({ message: 'Failed to load user KYC details', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(status: 'approved' | 'rejected') {
    setProcessing(true);
    try {
      const res = await adminAPI.updateKYCStatus(id, status);
      if (res.data.success) {
        addToast({ message: `Application ${status} successfully`, type: 'success' });
        router.push('/admin/kyc');
      }
    } catch (err: any) {
      addToast({ message: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Review KYC">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout pageTitle="Review KYC">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-slate-800">User Not Found</h2>
          <button onClick={() => router.back()} className="mt-4 text-blue-500 font-bold underline">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={`Review - ${user.name}`}>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
           <button onClick={() => router.back()} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800">
             ← Back to KYC List
           </button>
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
             user.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
           }`}>{user.kycStatus}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                 <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">{user.name[0]}</div>
                    <div>
                       <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                       <p className="text-slate-500 font-medium">{user.memberId} · {user.role.toUpperCase()}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoBlock label="Mobile" value={user.mobile} />
                    <InfoBlock label="State" value={user.state || 'N/A'} />
                 </div>
              </div>

              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Verification Documents & Live Capture</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <DocCard title="Live Verification Selfie" val="Captured Face" url={user.kycDocuments?.selfieUrl} onPreview={setSelectedImage} />
                    </div>
                    <DocCard title="Aadhaar Front" val={user.kycDocuments?.aadhaarNumber || '---'} url={user.kycDocuments?.aadhaarFrontUrl} onPreview={setSelectedImage} />
                    <DocCard title="Aadhaar Back" val={user.kycDocuments?.aadhaarNumber || '---'} url={user.kycDocuments?.aadhaarBackUrl} onPreview={setSelectedImage} />
                    <DocCard title="PAN Card" val={user.kycDocuments?.panNumber || '---'} url={user.kycDocuments?.panUrl} onPreview={setSelectedImage} />
                    <DocCard title="Bank Proof" val={user.kycDocuments?.bankName || '---'} url={user.kycDocuments?.bankProofUrl} onPreview={setSelectedImage} />
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl">
                 <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-10">Administrative Actions</h3>
                 <div className="space-y-4">
                    <button disabled={processing} onClick={() => handleUpdateStatus('approved')} className="w-full py-5 rounded-2xl bg-emerald-500 text-slate-900 font-black text-[11px] uppercase tracking-widest transition-all hover:bg-emerald-400">Approve & Activate</button>
                    <button disabled={processing} onClick={() => handleUpdateStatus('rejected')} className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/10">Reject Application</button>
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
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" />
          <div 
            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 m-4 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20"
            >
              ✕
            </button>
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={selectedImage} 
                alt="Document Preview" 
                className="w-full h-full object-contain bg-black/20"
              />
            </div>
            <p className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Click anywhere outside to close preview</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

function DocCard({ title, val, url, onPreview }: { title: string; val: string; url?: string, onPreview: (url: string) => void }) {
  return (
    <div 
      onClick={() => url && onPreview(url)} 
      className={`p-4 rounded-2xl border transition-all ${url ? 'bg-slate-50 border-slate-100 hover:border-blue-400 cursor-pointer group' : 'bg-rose-50/30 border-rose-100'}`}
    >
      <div className="flex items-center gap-4">
         <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {url ? <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <span className="text-rose-400">❌</span>}
         </div>
         <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-xs font-bold text-slate-800 truncate">{val}</p>
            {url ? (
              <p className="text-[8px] font-black text-blue-500 uppercase mt-1">Click to Preview</p>
            ) : (
              <p className="text-[8px] font-black text-rose-500 uppercase mt-1">Image Missing</p>
            )}
         </div>
      </div>
    </div>
  );
}
