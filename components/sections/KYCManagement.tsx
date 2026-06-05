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
    
    // Policy KYC details
    maritalStatus: user?.maritalStatus || 'Single',
    occupation: user?.occupation || '',
    alternateMobile: user?.alternateMobile || '',
    gender: user?.gender || 'Male',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    
    addressLine1: user?.address?.addressLine1 || '',
    addressLine2: user?.address?.addressLine2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    
    familyDetails: user?.familyDetails?.length ? user.familyDetails : [],
    
    existingMedicalConditions: user?.healthDetails?.existingMedicalConditions || 'None',
    currentMedications: user?.healthDetails?.currentMedications || 'None',
    lifestyle: user?.healthDetails?.lifestyle || 'Moderate',
    
    nomineeName: user?.nomineeDetails?.name || '',
    nomineeRelation: user?.nomineeDetails?.relation || '',
    nomineeMobile: user?.nomineeDetails?.mobile || '',
    nomineeDOB: user?.nomineeDetails?.dob ? new Date(user.nomineeDetails.dob).toISOString().split('T')[0] : '',
    nomineeGender: user?.nomineeDetails?.gender || 'Male'
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

      if (formData.maritalStatus) data.append('maritalStatus', formData.maritalStatus);
      if (formData.occupation) data.append('occupation', formData.occupation);
      if (formData.alternateMobile) data.append('alternateMobile', formData.alternateMobile);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.dob) data.append('dob', formData.dob);
      if (formData.addressLine1) data.append('addressLine1', formData.addressLine1);
      if (formData.addressLine2) data.append('addressLine2', formData.addressLine2);
      if (formData.city) data.append('city', formData.city);
      if (formData.state) data.append('state', formData.state);
      if (formData.zipCode) data.append('zipCode', formData.zipCode);
      
      data.append('familyDetails', JSON.stringify(formData.familyDetails));
      data.append('healthDetails', JSON.stringify({
        existingMedicalConditions: formData.existingMedicalConditions,
        currentMedications: formData.currentMedications,
        lifestyle: formData.lifestyle
      }));
      data.append('nomineeDetails', JSON.stringify({
        name: formData.nomineeName,
        relation: formData.nomineeRelation,
        mobile: formData.nomineeMobile,
        dob: formData.nomineeDOB,
        gender: formData.nomineeGender
      }));

      const res = await usersAPI.updateKYC(user._id, data);
      if (res.data.success) { alert('KYC submitted!'); onUpdate(); }
      else setError(res.data.message || 'Submission failed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload error');
    } finally { setLoading(false); }
  };

  const isApproved = user.kycStatus === 'approved';

  // A document is considered uploaded if there is a new file OR an existing preview URL
  const hasDoc = (field: string) => !!(files[field] || previews[field]);
  const hasSelfie = !!(files.selfie || previews.selfie);

  const requiredDocs = [
    { key: 'selfie',       label: 'Live Selfie' },
    { key: 'aadhaarFront', label: 'Aadhaar Front' },
    { key: 'aadhaarBack',  label: 'Aadhaar Back' },
    { key: 'panCard',      label: 'PAN Card' },
    { key: 'bankProof',    label: 'Bank Proof' },
  ];

  const missingDocs = requiredDocs.filter(d => d.key === 'selfie' ? !hasSelfie : !hasDoc(d.key));
  const canSubmit = !loading && missingDocs.length === 0;
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
        
        {/* Policy Holder Details */}
        <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
          <StepHeader num="05" label="Primary Applicant Details (For Protection Cover)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Date of Birth</label>
              <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                <option value="Male" className="bg-[#131241]">Male</option>
                <option value="Female" className="bg-[#131241]">Female</option>
                <option value="Other" className="bg-[#131241]">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Marital Status</label>
              <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                <option value="Single" className="bg-[#131241]">Single</option>
                <option value="Married" className="bg-[#131241]">Married</option>
              </select>
            </div>
            <InputField label="Occupation" placeholder="e.g. Salaried" value={formData.occupation} onChange={(v: string) => setFormData({...formData, occupation: v})} disabled={isApproved} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField label="Address Line 1" placeholder="Flat / House No. / Building" value={formData.addressLine1} onChange={(v: string) => setFormData({...formData, addressLine1: v})} disabled={isApproved} />
             <InputField label="Address Line 2" placeholder="Street / Area" value={formData.addressLine2} onChange={(v: string) => setFormData({...formData, addressLine2: v})} disabled={isApproved} />
             <InputField label="City" placeholder="City" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} disabled={isApproved} />
             <div className="grid grid-cols-2 gap-4">
                <InputField label="State" placeholder="State" value={formData.state} onChange={(v: string) => setFormData({...formData, state: v})} disabled={isApproved} />
                <InputField label="PIN Code" placeholder="PIN Code" value={formData.zipCode} onChange={(v: string) => setFormData({...formData, zipCode: v})} disabled={isApproved} digitsOnly maxLength={6} />
             </div>
             <InputField label="Alternate Mobile" placeholder="Alternate Mobile Number" value={formData.alternateMobile} onChange={(v: string) => setFormData({...formData, alternateMobile: v})} disabled={isApproved} digitsOnly maxLength={10} />
          </div>
        </div>

        {/* Health & Nominee */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
           <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
             <StepHeader num="06" label="Health & Wellness Information" />
             <div className="space-y-4">
               <InputField label="Existing Medical Conditions (if any)" placeholder="e.g. None, Diabetes" value={formData.existingMedicalConditions} onChange={(v: string) => setFormData({...formData, existingMedicalConditions: v})} disabled={isApproved} />
               <InputField label="Current Medications (if any)" placeholder="e.g. None" value={formData.currentMedications} onChange={(v: string) => setFormData({...formData, currentMedications: v})} disabled={isApproved} />
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Lifestyle</label>
                  <select value={formData.lifestyle} onChange={e => setFormData({...formData, lifestyle: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                     <option value="Sedentary" className="bg-[#131241]">Sedentary</option>
                     <option value="Moderate" className="bg-[#131241]">Moderate</option>
                     <option value="Active" className="bg-[#131241]">Active</option>
                  </select>
               </div>
             </div>
           </div>

           <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
             <StepHeader num="07" label="Nominee Details" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InputField label="Nominee Name" placeholder="Full Name" value={formData.nomineeName} onChange={(v: string) => setFormData({...formData, nomineeName: v})} disabled={isApproved} />
               <InputField label="Relationship" placeholder="e.g. Spouse, Son" value={formData.nomineeRelation} onChange={(v: string) => setFormData({...formData, nomineeRelation: v})} disabled={isApproved} />
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Date of Birth</label>
                 <input type="date" value={formData.nomineeDOB} onChange={e => setFormData({...formData, nomineeDOB: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Gender</label>
                 <select value={formData.nomineeGender} onChange={e => setFormData({...formData, nomineeGender: e.target.value})} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                   <option value="Male" className="bg-[#131241]">Male</option>
                   <option value="Female" className="bg-[#131241]">Female</option>
                   <option value="Other" className="bg-[#131241]">Other</option>
                 </select>
               </div>
               <div className="sm:col-span-2">
                 <InputField label="Contact Number" placeholder="Mobile Number" value={formData.nomineeMobile} onChange={(v: string) => setFormData({...formData, nomineeMobile: v})} disabled={isApproved} digitsOnly maxLength={10} />
               </div>
             </div>
           </div>
        </div>

        {/* Family Details */}
        <div className="bg-[#131241] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <StepHeader num="08" label="Family Details (Optional)" sub="For family floater plans" />
            {!isApproved && (
              <button 
                type="button"
                onClick={() => setFormData({...formData, familyDetails: [...formData.familyDetails, { name: '', relation: 'Spouse', dob: '', gender: 'Male' }]})}
                className="bg-[#49D2B5]/20 text-[#49D2B5] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#49D2B5]/30 transition-all flex items-center gap-2 border border-[#49D2B5]/30 self-start sm:self-auto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Member
              </button>
            )}
          </div>
          <div className="space-y-3">
             {formData.familyDetails.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">No family members added</p>
                </div>
             )}
             {formData.familyDetails.map((member, idx) => (
                <div key={idx} className="relative grid grid-cols-1 sm:grid-cols-4 gap-3 p-5 pt-8 sm:pt-5 bg-white/[0.02] border border-white/5 rounded-xl">
                  {!isApproved && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, familyDetails: formData.familyDetails.filter((_, i) => i !== idx)})}
                      className="absolute top-2 right-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors sm:top-5 sm:right-5 sm:translate-x-full sm:-mr-10"
                      title="Remove Member"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                  <InputField label={`Member ${idx + 1} Name`} placeholder="Name" value={member.name} onChange={(v: string) => {
                     const newFam = [...formData.familyDetails];
                     newFam[idx].name = v;
                     setFormData({...formData, familyDetails: newFam});
                  }} disabled={isApproved} />
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Relation</label>
                    <select value={member.relation} onChange={e => {
                       const newFam = [...formData.familyDetails];
                       newFam[idx].relation = e.target.value;
                       setFormData({...formData, familyDetails: newFam});
                    }} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                      <option value="" disabled className="bg-[#131241]">Select Relation</option>
                      <option value="Spouse" className="bg-[#131241]">Spouse</option>
                      <option value="Son" className="bg-[#131241]">Son</option>
                      <option value="Daughter" className="bg-[#131241]">Daughter</option>
                      <option value="Father" className="bg-[#131241]">Father</option>
                      <option value="Mother" className="bg-[#131241]">Mother</option>
                      <option value="Father-in-law" className="bg-[#131241]">Father-in-law</option>
                      <option value="Mother-in-law" className="bg-[#131241]">Mother-in-law</option>
                      <option value="Brother" className="bg-[#131241]">Brother</option>
                      <option value="Sister" className="bg-[#131241]">Sister</option>
                      <option value="Other" className="bg-[#131241]">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">DOB</label>
                    <input type="date" value={member.dob} onChange={e => {
                       const newFam = [...formData.familyDetails];
                       newFam[idx].dob = e.target.value;
                       setFormData({...formData, familyDetails: newFam});
                    }} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Gender</label>
                    <select value={member.gender} onChange={e => {
                       const newFam = [...formData.familyDetails];
                       newFam[idx].gender = e.target.value;
                       setFormData({...formData, familyDetails: newFam});
                    }} disabled={isApproved} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all disabled:opacity-50 appearance-none">
                      <option value="Male" className="bg-[#131241]">Male</option>
                      <option value="Female" className="bg-[#131241]">Female</option>
                      <option value="Other" className="bg-[#131241]">Other</option>
                    </select>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {!isApproved && (
          <div className="space-y-3">
            {missingDocs.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-3">Required Before Submit</p>
                <div className="flex flex-wrap gap-2">
                  {missingDocs.map(d => (
                    <span key={d.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              title={!canSubmit ? `Please upload: ${missingDocs.map(d => d.label).join(', ')}` : ''}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:opacity-90 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Submitting...
                </span>
              ) : canSubmit ? 'Submit KYC Documents' : `Upload ${missingDocs.length} More Document${missingDocs.length > 1 ? 's' : ''} to Continue`}
            </button>
          </div>
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
