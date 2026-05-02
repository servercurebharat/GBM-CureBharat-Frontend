'use client';

import { useState, useRef, useEffect } from 'react';
import { usersAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function KYCManagement({ user, onUpdate }: { user: IUser; onUpdate: () => void }) {
  if (!user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const [formData, setFormData] = useState({
    aadhaarNumber: user?.kycDocuments?.aadhaarNumber || '',
    panNumber: user?.kycDocuments?.panNumber || '',
    bankName: user?.kycDocuments?.bankName || '',
    accountNumber: user?.kycDocuments?.accountNumber || '',
    ifscCode: user?.kycDocuments?.ifscCode || '',
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    aadhaarFront: user?.kycDocuments?.aadhaarFrontUrl || '',
    aadhaarBack: user?.kycDocuments?.aadhaarBackUrl || '',
    panCard: user?.kycDocuments?.panUrl || '',
    bankProof: user?.kycDocuments?.bankProofUrl || '',
    selfie: user?.kycDocuments?.selfieUrl || '',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    bankProof: null,
    selfie: null,
  });

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setFiles(prev => ({ ...prev, selfie: file }));
            setPreviews(prev => ({ ...prev, selfie: canvas.toDataURL('image/jpeg') }));
            
            // Stop camera
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setCameraActive(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (target: HTMLInputElement, field: string) => {
    const file = target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      if (formData.aadhaarNumber) data.append('aadhaarNumber', formData.aadhaarNumber);
      if (formData.panNumber) data.append('panNumber', formData.panNumber);
      if (formData.bankName) data.append('bankName', formData.bankName);
      if (formData.accountNumber) data.append('accountNumber', formData.accountNumber);
      if (formData.ifscCode) data.append('ifscCode', formData.ifscCode);

      if (files.aadhaarFront) data.append('aadhaarFront', files.aadhaarFront);
      if (files.aadhaarBack) data.append('aadhaarBack', files.aadhaarBack);
      if (files.panCard) data.append('panCard', files.panCard);
      if (files.bankProof) data.append('bankProof', files.bankProof);
      if (files.selfie) data.append('selfie', files.selfie);

      const res = await usersAPI.updateKYC(user._id, data);
      if (res.data.success) {
        alert('KYC Documents & Selfie submitted successfully!');
        onUpdate();
      } else {
        setError(res.data.message || 'Submission failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading documents');
    } finally {
      setLoading(false);
    }
  };

  const isApproved = user.kycStatus === 'approved';

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4 md:px-0 pb-20">
      {/* Premium Banner */}
      <div className={`relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] border-2 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-10 transition-all ${
        isApproved ? 'bg-gradient-to-br from-[#10b981] to-[#064e3b] border-[#34d399]/30 text-white' :
        user.kycStatus === 'pending' ? 'bg-gradient-to-br from-[#f59e0b] to-[#78350f] border-[#fbbf24]/30 text-white' :
        'bg-gradient-to-br from-[#3b82f6] to-[#1e3a8a] border-[#60a5fa]/30 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[120px] -mr-[250px] -mt-[250px] rounded-full" />
        
        <div className="relative z-10 flex items-center gap-10 text-center md:text-left flex-col md:flex-row">
           <div className="w-24 h-24 rounded-[2.5rem] bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center text-5xl">
              {isApproved ? '🛡️' : user.kycStatus === 'pending' ? '⏳' : '🚀'}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-3">Identity Pipeline</p>
              <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tighter leading-none mb-6">
                 {user.kycStatus === 'not_submitted' ? 'Secure Your Account' : user.kycStatus.replace('_', ' ')}
              </h2>
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                   ID: {user.memberId}
                </span>
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Step 0: Live Face Capture */}
        <div className="bg-[#131241]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[4rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg shadow-inner">01</div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Live Face Verification</h3>
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Take a selfie to match with your Aadhaar</p>
              </div>
           </div>

           <div className="flex flex-col items-center justify-center py-10">
              <div className="relative w-72 h-72 rounded-full border-4 border-blue-500/30 overflow-hidden bg-black/40 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : previews.selfie ? (
                  <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl">👤</div>
                )}
                
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40 rounded-full" />
                )}
              </div>

              <div className="mt-10 flex gap-4">
                {!isApproved && (
                  <>
                    {!cameraActive ? (
                      <button 
                        type="button" 
                        onClick={startCamera}
                        className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                      >
                        {previews.selfie ? 'Retake Selfie' : 'Open Camera'}
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={captureSelfie}
                        className="px-10 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                      >
                        Capture Snapshot
                      </button>
                    )}
                  </>
                )}
              </div>
           </div>
           <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Step 1: Documents */}
        <div className="bg-[#131241]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[4rem] p-8 md:p-14 shadow-2xl">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg shadow-inner">02</div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Identity Documents</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <InputField label="Aadhaar Number" placeholder="12-digit number" value={formData.aadhaarNumber} onChange={(v: string) => setFormData({...formData, aadhaarNumber: v})} disabled={isApproved} />
              <InputField label="PAN Card Number" placeholder="ABCDE1234F" value={formData.panNumber} onChange={(v: string) => setFormData({...formData, panNumber: v})} disabled={isApproved} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FileUploadZone label="Aadhaar Front" field="aadhaarFront" preview={previews.aadhaarFront} onChange={handleFileChange} disabled={isApproved} />
              <FileUploadZone label="Aadhaar Back" field="aadhaarBack" preview={previews.aadhaarBack} onChange={handleFileChange} disabled={isApproved} />
              <FileUploadZone label="PAN Card Photo" field="panCard" preview={previews.panCard} onChange={handleFileChange} disabled={isApproved} />
           </div>
        </div>

        {/* Step 2: Banking */}
        <div className="bg-[#131241]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[4rem] p-8 md:p-14 shadow-2xl">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg shadow-inner">03</div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Banking & Payouts</h3>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <InputField label="Bank Name" placeholder="e.g. HDFC Bank" value={formData.bankName} onChange={(v: string) => setFormData({...formData, bankName: v})} disabled={isApproved} />
              <InputField label="Account Number" placeholder="Account Number" value={formData.accountNumber} onChange={(v: string) => setFormData({...formData, accountNumber: v})} disabled={isApproved} />
              <InputField label="IFSC Code" placeholder="HDFC0001234" value={formData.ifscCode} onChange={(v: string) => setFormData({...formData, ifscCode: v})} disabled={isApproved} />
           </div>
           <div className="max-w-xl mx-auto">
              <FileUploadZone label="Bank Proof (Passbook/Cheque)" field="bankProof" preview={previews.bankProof} onChange={handleFileChange} disabled={isApproved} />
           </div>
        </div>

        {error && <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] text-red-400 text-center font-black text-xs uppercase tracking-widest">{error}</div>}

        {!isApproved && (
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-8 rounded-[3rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white font-black text-sm uppercase tracking-[0.5em] shadow-2xl disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? 'Transmitting Data...' : 'Submit Full Verification Bundle'}
          </button>
        )}
      </form>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, disabled }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-6">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] px-10 py-6 text-white font-bold placeholder:text-white/10 outline-none focus:border-[#60A5FA] transition-all text-lg shadow-inner"
      />
    </div>
  );
}

function FileUploadZone({ label, field, preview, onChange, disabled }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-6">{label}</label>
      <div className={`relative h-72 rounded-[3.5rem] border-2 border-dashed transition-all duration-500 group overflow-hidden ${
        preview ? 'border-transparent' : 'border-white/10 hover:border-blue-400/40 bg-white/[0.02]'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">Replace Image</span>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
             <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-blue-400 transition-all">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
             </div>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Drop {label}</p>
          </div>
        )}
        {!disabled && (
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => onChange(e.target, field)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
}
