'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { IWallet } from '@/types';
import toast from 'react-hot-toast';

export default function HccProfilePage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletRes = await walletAPI.getMyWallet();
        if (walletRes.data.success && walletRes.data.data) {
          setWallet(walletRes.data.data);
        }
      } catch (error: any) {
        console.error('Error fetching wallet:', error);
      } finally {
        setLoadingWallet(false);
      }
    };

    if (user) {
      fetchWallet();
    }
  }, [user]);

  if (!user) return null;

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
    }).format(amount / 100);
  };

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="space-y-6 pb-12">
        
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
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Member ID', value: user.memberId },
                { label: 'Full Name', value: user.name },
                { label: 'Role / Rank', value: `${user.role.toUpperCase()} / ${user.rank}` },
                { label: 'Email Address', value: user.email || 'N/A' },
                { label: 'Gender', value: user.gender?.toUpperCase() || 'N/A' },
                { label: 'Date of Birth', value: formatDate(user.dob) },
                { label: 'State Alignment', value: user.state || 'N/A' },
                { label: 'City', value: user.address?.city || 'N/A' },
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">{field.label}</label>
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-inner">{field.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Account Holder', value: user.bankDetails?.accountHolderName || 'N/A' },
                { label: 'Account Number', value: user.bankDetails?.accountNumber || 'N/A' },
                { label: 'Bank Name', value: user.bankDetails?.bankName || 'N/A' },
                { label: 'IFSC Code', value: user.bankDetails?.ifscCode || 'N/A' },
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">{field.label}</label>
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-inner">{field.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nominee Details Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nominee Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Nominee Name', value: user.nomineeDetails?.name || 'N/A' },
                { label: 'Relationship', value: user.nomineeDetails?.relation || 'N/A' },
                { label: 'Mobile Number', value: user.nomineeDetails?.mobile || 'N/A' },
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest pl-1">{field.label}</label>
                  <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-inner">{field.value}</div>
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
    </DashboardLayout>
  );
}
