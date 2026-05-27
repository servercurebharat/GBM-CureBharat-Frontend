'use client';

import { useState, useRef } from 'react';
import { usersAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function KYCManagement({ user, onUpdate }: { user: IUser; onUpdate: () => void }) {
  if (!user) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const [formData, setFormData] = useState({
    aadhaarNumber: user?.kycDocuments?.aadhaarNumber || '',
    panNumber:     user?.kycDocuments?.panNumber || '',
    bankName:      user?.kycDocuments?.bankName || '',
    accountNumber: user?.kycDocuments?.accountNumber || '',
    ifscCode:      user?.kycDocuments?.ifscCode || '',
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    aadhaarFront: user?.kycDocuments?.aadhaarFrontUrl || '',
    aadhaarBack:  user?.kycDocuments?.aadhaarBackUrl || '',
    panCard:      user?.kycDocuments?.panUrl || '',
    bankProof:    user?.kycDocuments?.bankProofUrl || '',
    selfie:       user?.kycDocuments?.selfieUrl || '',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    aadhaarFront: null, aadhaarBack: null,
    panCard: null, bankProof: null, selfie: null,
  });

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Camera access denied.');
      setCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current, c = canvasRef.current;
      const ctx = c.getContext('2d');
      if (ctx) {
        c.width = v.videoWidth; c.height = v.videoHeight;
        ctx.drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(blob => {
          if (blob) {
            setFiles(p => ({ ...p, selfie: new File([blob!], 'selfie.jpg', { type: 'image/jpeg' }) }));
            setPreviews(p => ({ ...p, selfie: c.toDataURL('image/jpeg') }));
            (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            setCameraActive(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (target: HTMLInputElement, field: string) => {
    const file = target.files?.[0];
    if (file) {
      setFiles(p => ({ ...p, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(p => ({ ...p, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = new FormData();
      if (formData.aadhaarNumber) data.append('aadhaarNumber', formData.aadhaarNumber);
      if (formData.panNumber)     data.append('panNumber', formData.panNumber);
      if (formData.bankName)      data.append('bankName', formData.bankName);
      if (formData.accountNumber) data.append('accountNumber', formData.accountNumber);
      if (formData.ifscCode)      data.append('ifscCode', formData.ifscCode);
      if (files.aadhaarFront) data.append('aadhaarFront', files.aadhaarFront);
      if (files.aadhaarBack)  data.append('aadhaarBack',  files.aadhaarBack);
      if (files.panCard)      data.append('panCard',      files.panCard);
      if (files.bankProof)    data.append('bankProof',    files.bankProof);
      if (files.selfie)       data.append('selfie',       files.selfie);

      const res = await usersAPI.updateKYC(user._id, data);
      if (res.data.success) { alert('KYC submitted!'); onUpdate(); }
      else setError(res.data.message || 'Submission failed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload error');
    } finally { setLoading(false); }
  };

  const isApproved = user.kycStatus === 'approved';
  const statusConfig = {
    approved:      { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'APPROVED',       icon: '✓' },
    pending:       { bg: 'bg-amber-500/10  border-amber-500/20',    text: 'text-amber-400',   label: 'PENDING REVIEW', icon: '⏳' },
    not_submitted: { bg: 'bg-blue-500/10   border-blue-500/20',     text: 'text-blue-400',    label: 'NOT SUBMITTED',  icon: '→' },
    rejected:      { bg: 'bg-rose-500/10   border-rose-500/20',     text: 'text-rose-400',    label: 'REJECTED',       icon: '✕' },
  }[user.kycStatus as string] || { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: user.kycStatus, icon: '→' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

      {/* Status Banner — compact */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${statusConfig.bg}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${statusConfig.text} bg-white/5`}>
          {statusConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">KYC Status</p>
          <p className={`text-sm font-black ${statusConfig.text} uppercase tracking-wide`}>{statusConfig.label}</p>
        </div>
        <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 shrink-0">
          {user.memberId}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Selfie + Identity Docs — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Step 1: Selfie */}
          <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl">
            <StepHeader num="01" label="Live Face Verification" sub="Take a selfie" />
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative w-28 h-28 rounded-full border-2 border-blue-500/30 overflow-hidden bg-black/40 shadow-lg">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : previews.selfie ? (
                  <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">👤</div>
                )}
              </div>
              {!isApproved && (
                cameraActive ? (
                  <button type="button" onClick={captureSelfie}
                    className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all">
                    Capture
                  </button>
                ) : (
                  <button type="button" onClick={startCamera}
                    className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    {previews.selfie ? 'Retake' : 'Open Camera'}
                  </button>
                )
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Step 2: Identity Fields */}
          <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
            <StepHeader num="02" label="Identity Documents" />
            <InputField label="Aadhaar Number" placeholder="12-digit number" value={formData.aadhaarNumber} onChange={(v: string) => setFormData({...formData, aadhaarNumber: v})} disabled={isApproved} maxLength={12} digitsOnly />
            <InputField label="PAN Card Number" placeholder="ABCDE1234F" value={formData.panNumber} onChange={(v: string) => setFormData({...formData, panNumber: v.toUpperCase()})} disabled={isApproved} maxLength={10} />
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl">
          <StepHeader num="03" label="Upload Documents" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <FileUploadZone label="Aadhaar Front" field="aadhaarFront" preview={previews.aadhaarFront} onChange={handleFileChange} disabled={isApproved} />
            <FileUploadZone label="Aadhaar Back"  field="aadhaarBack"  preview={previews.aadhaarBack}  onChange={handleFileChange} disabled={isApproved} />
            <FileUploadZone label="PAN Card"      field="panCard"      preview={previews.panCard}      onChange={handleFileChange} disabled={isApproved} />
          </div>
        </div>

        {/* Banking */}
        <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
          <StepHeader num="04" label="Banking & Payouts" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Bank Name"       placeholder="e.g. HDFC Bank"  value={formData.bankName}      onChange={(v: string) => setFormData({...formData, bankName: v})}      disabled={isApproved} />
            <InputField label="Account Number"  placeholder="Account Number"  value={formData.accountNumber} onChange={(v: string) => setFormData({...formData, accountNumber: v})} disabled={isApproved} />
            <InputField label="IFSC Code"       placeholder="HDFC0001234"     value={formData.ifscCode}      onChange={(v: string) => setFormData({...formData, ifscCode: v})}      disabled={isApproved} />
          </div>
          <div className="max-w-xs">
            <FileUploadZone label="Bank Proof (Passbook/Cheque)" field="bankProof" preview={previews.bankProof} onChange={handleFileChange} disabled={isApproved} />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {!isApproved && (
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit KYC Documents'}
          </button>
        )}
      </form>
    </div>
  );
}

function StepHeader({ num, label, sub }: { num: string; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[10px]">{num}</div>
      <div>
        <p className="text-sm font-black text-white uppercase tracking-tight">{label}</p>
        {sub && <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{sub}</p>}
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  digitsOnly?: boolean;
}

function InputField({ label, placeholder, value, onChange, disabled, maxLength, digitsOnly }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={e => {
          const v = digitsOnly ? e.target.value.replace(/\D/g, '') : e.target.value;
          onChange(v);
        }}
        disabled={disabled}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/10 outline-none focus:border-blue-500/40 transition-all disabled:opacity-50"
      />
    </div>
  );
}

interface FileUploadZoneProps {
  label: string;
  field: string;
  preview: string;
  onChange: (target: HTMLInputElement, field: string) => void;
  disabled?: boolean;
}

function FileUploadZone({ label, field, preview, onChange, disabled }: FileUploadZoneProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">{label}</label>
      <div className={`relative h-28 rounded-xl border-2 border-dashed transition-all overflow-hidden group ${
        preview ? 'border-transparent' : 'border-white/10 hover:border-blue-400/40 bg-white/[0.02]'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Replace</span>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-blue-400 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center px-2">{label}</p>
          </div>
        )}
        {!disabled && (
          <input type="file" accept="image/*" onChange={e => onChange(e.target, field)} className="absolute inset-0 opacity-0 cursor-pointer" />
        )}
      </div>
    </div>
  );
}
