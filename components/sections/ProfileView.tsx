'use client';

import { useState } from 'react';
import { IUser, IWallet } from '@/types';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProfileViewProps {
  user: IUser;
  wallet: IWallet | null;
  refreshUser: () => Promise<void>;
}

export default function ProfileView({ user, wallet, refreshUser }: ProfileViewProps) {
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingNominee, setIsEditingNominee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  const [bankData, setBankData] = useState({
    accountHolderName: user.bankDetails?.accountHolderName || '',
    accountNumber: user.bankDetails?.accountNumber || '',
    bankName: user.bankDetails?.bankName || '',
    ifscCode: user.bankDetails?.ifscCode || '',
    branchName: user.bankDetails?.branchName || '',
  });

  const [nomineeData, setNomineeData] = useState({
    name: user.nomineeDetails?.name || '',
    relation: user.nomineeDetails?.relation || '',
    mobile: user.nomineeDetails?.mobile || '',
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleBankSaveRequest = () => {
    // Validate
    if (!bankData.accountNumber || !bankData.ifscCode || !bankData.bankName) {
      return toast.error('Please fill required bank fields');
    }
    // Trigger OTP (Mock)
    setShowOtpModal(true);
    toast.success('Verification OTP sent to your registered mobile');
  };

  const handleVerifyAndSaveBank = async () => {
    if (otp !== '123456') { // Mock OTP for development
      return toast.error('Invalid OTP. Use 123456 for testing.');
    }

    setLoading(true);
    try {
      const res = await usersAPI.updateProfile(user._id, { bankDetails: bankData });
      if (res.data.success) {
        toast.success('Bank details updated and pending admin verification');
        setIsEditingBank(false);
        setShowOtpModal(false);
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleNomineeSave = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.updateProfile(user._id, { nomineeDetails: nomineeData });
      if (res.data.success) {
        toast.success('Nominee details updated successfully');
        setIsEditingNominee(false);
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update nominee details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowOtpModal(false)} />
          <div className="relative bg-[#131241] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Security Verification</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              We've sent a 6-digit verification code to <span className="text-white">+91 {user.mobile}</span>. 
              Please enter it below to confirm your bank account update.
            </p>
            <div className="space-y-4">
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center text-2xl font-black tracking-[0.5em] focus:border-emerald-500/50 transition-all outline-none"
              />
              <button 
                onClick={handleVerifyAndSaveBank}
                disabled={loading || otp.length < 6}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
              >
                {loading ? 'Verifying...' : 'Confirm Update'}
              </button>
              <button 
                onClick={() => setShowOtpModal(false)}
                className="w-full text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest pt-2 transition-colors"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Profile Card */}
      <div className="bg-[#131241] rounded-[24px] p-8 shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white/5 shadow-2xl bg-slate-800">
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#131241] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
              <span className="text-xs font-bold text-[#B5B8BD] px-3 py-1 bg-white/5 rounded-full border border-white/5">{user.memberId}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-md tracking-widest uppercase border ${
                user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/20' : 'bg-red-500/20 text-red-400 border-red-400/20'
              }`}>
                {user.status}
              </span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-md tracking-widest uppercase border ${
                user.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/20' : 'bg-amber-500/20 text-amber-400 border-amber-400/20'
              }`}>
                KYC {user.kycStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              <div>
                <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-1">Referrer ID</p>
                <p className="text-sm font-bold text-white">
                  {typeof user.referrerId === 'object' ? (user.referrerId as any)?.memberId : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-1">Mobile Number</p>
                <p className="text-sm font-bold text-white">+91 {user.mobile}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-1">Date Joined</p>
                <p className="text-sm font-bold text-white">{formatDate(user.createdAt)}</p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-1">State Location</p>
                <p className="text-sm font-bold text-white uppercase">{user.state || 'N/A'}, IN</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Details Card */}
      <div className="bg-[#131241] rounded-[24px] p-8 shadow-2xl border border-white/5 space-y-10">
        
        {/* Personal Details Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
             <div className="space-y-1 px-4 py-2 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Full Name</p>
                <p className="text-sm font-bold text-white">{user.name}</p>
             </div>
             <div className="space-y-1 px-4 py-2 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-white">{user.email || 'N/A'}</p>
             </div>
             <div className="space-y-1 px-4 py-2 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Gender</p>
                <p className="text-sm font-bold text-white uppercase">{user.gender || 'N/A'}</p>
             </div>
             <div className="space-y-1 px-4 py-2 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">Date of Birth</p>
                <p className="text-sm font-bold text-white">{formatDate(user.dob)}</p>
             </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="relative group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank Details</h3>
            </div>
            {!isEditingBank ? (
              <button 
                onClick={() => setIsEditingBank(true)}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-all border border-white/10"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingBank(false)}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBankSaveRequest}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[10px] font-bold text-black uppercase tracking-widest transition-all"
                >
                  Verify & Save
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {user.bankDetails?.verificationStatus === 'pending' && !isEditingBank && (
              <div className="absolute inset-0 z-10 bg-[#131241]/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl border border-amber-500/20">
                <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl border border-amber-500/20 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Pending Admin Verification</span>
                </div>
              </div>
            )}

            {[
              { label: 'Account Holder Name', key: 'accountHolderName' },
              { label: 'Account Number', key: 'accountNumber' },
              { label: 'Bank Name', key: 'bankName' },
              { label: 'IFSC Code', key: 'ifscCode' },
              { label: 'Branch Name', key: 'branchName' },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">{field.label}</label>
                {isEditingBank ? (
                  <input 
                    type="text"
                    value={(bankData as any)[field.key]}
                    onChange={(e) => setBankData({ ...bankData, [field.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                    placeholder={`Enter ${field.label}`}
                  />
                ) : (
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-inner">
                    {(user.bankDetails as any)?.[field.key] || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nominee Details Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nominee Details</h3>
            </div>
            {!isEditingNominee ? (
              <button 
                onClick={() => setIsEditingNominee(true)}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-all border border-white/10"
              >
                Update Nominee
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingNominee(false)}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleNomineeSave}
                  className="px-4 py-1.5 rounded-lg bg-[#60A5FA] hover:bg-[#3B82F6] text-[10px] font-bold text-white uppercase tracking-widest transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Nominee Name', key: 'name' },
              { label: 'Relationship', key: 'relation' },
              { label: 'Nominee Mobile', key: 'mobile' },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">{field.label}</label>
                {isEditingNominee ? (
                  <input 
                    type="text"
                    value={(nomineeData as any)[field.key]}
                    onChange={(e) => setNomineeData({ ...nomineeData, [field.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#60A5FA]/50 outline-none transition-all shadow-inner"
                    placeholder={`Enter ${field.label}`}
                  />
                ) : (
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-inner">
                    {(user.nomineeDetails as any)?.[field.key] || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: user.teamSize.toString() },
          { label: 'Personal Sales', value: user.personalSalesCount.toString() },
          { label: 'Wallet Balance', value: formatCurrency(wallet?.finalBalance) },
          { label: 'KYC Status', value: user.kycStatus.toUpperCase().replace('_', ' ') },
        ].map((stat, i) => (
          <div key={i} className="bg-[#131241] border border-white/5 p-6 rounded-[12px] shadow-xl">
             <p className="text-[9px] text-[#B5B8BD] font-bold uppercase tracking-[0.2em] mb-4">{stat.label}</p>
             <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
