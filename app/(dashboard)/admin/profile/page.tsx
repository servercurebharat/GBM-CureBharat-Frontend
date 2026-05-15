'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Password Change State
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!user) return null;

  const handleUpdate = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(user._id, { name });
      if (res.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        window.location.reload(); 
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setChangingPass(true);
    try {
      const res = await authAPI.changePassword({ oldPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setShowPassModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const joiningDate = new Date(user.createdAt).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <DashboardLayout pageTitle="Admin Identity">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header Profile Card */}
        <div className="bg-[#131241] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10b981]/10 blur-[80px] rounded-full group-hover:bg-[#10b981]/20 transition-all duration-700" />
           
           <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-[#10b981]/30 border-4 border-white/10">
                 {user.name.slice(0, 1)}
              </div>
              <div className="text-center md:text-left flex-1">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white/5 border border-[#10b981]/50 rounded-xl px-4 py-2 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 w-full"
                          autoFocus
                        />
                        <button 
                          onClick={handleUpdate}
                          disabled={saving}
                          className="bg-[#10b981] p-2 rounded-xl text-white hover:bg-[#059669] transition-all disabled:opacity-50"
                        >
                          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                        <button 
                          onClick={() => { setIsEditing(false); setName(user.name); }}
                          className="bg-white/5 p-2 rounded-xl text-white/40 hover:text-white transition-all"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">{user.name}</h1>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all border border-white/5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      </>
                    )}
                    <span className="px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-black uppercase tracking-[0.2em]">
                       SYSTEM {user.role?.toUpperCase()}
                    </span>
                 </div>
                 <p className="text-white/40 text-sm font-medium tracking-wide">Managing CureBharat Enterprise Network • <span className="text-[#10b981]">Active Session</span></p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Identity Details */}
           <div className="bg-[#131241] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Identity Details</h3>
              </div>
              
              <div className="space-y-6">
                 <DetailItem label="Member ID" value={user.memberId} icon="tag" />
                 <DetailItem label="Mobile Number" value={user.mobile} icon="phone" />
                 <DetailItem label="Email Address" value={user.email || 'N/A'} icon="mail" />
                 <DetailItem label="Joining Date" value={joiningDate} icon="calendar" />
              </div>
           </div>

           {/* Security & Access */}
           <div className="bg-[#131241] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Security & Access</h3>
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Two-Factor Auth</p>
                       <p className="text-xs font-bold text-emerald-400">Enabled (Mobile OTP)</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Account Status</p>
                       <p className="text-xs font-bold text-white uppercase">Primary Administrator</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                 </div>

                 <button 
                   onClick={() => setShowPassModal(true)}
                   className="w-full mt-4 py-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all shadow-lg shadow-emerald-900/10"
                 >
                    Update Password
                 </button>
              </div>
           </div>
        </div>

        {/* Password Modal */}
        {showPassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
             <div className="absolute inset-0 bg-[#0d0f14]/80 backdrop-blur-sm" onClick={() => setShowPassModal(false)} />
             <div className="bg-[#131241] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Change Password</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-8">Secure your administrative identity</p>
                
                <form onSubmit={handleChangePassword} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                   </div>
                   
                   <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowPassModal(false)}
                        className="flex-1 py-4 rounded-xl bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                         Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={changingPass}
                        className="flex-1 py-4 rounded-xl bg-[#10b981] text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#059669] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                      >
                         {changingPass ? 'Updating...' : 'Save Changes'}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* System Message */}
        <div className="bg-[#10b981]/5 border border-[#10b981]/10 rounded-[2rem] p-8 text-center">
           <p className="text-[10px] font-bold text-white/40 leading-relaxed max-w-lg mx-auto">
              Your identity as a <span className="text-[#10b981]">CureBharat Administrator</span> allows you to manage financial nodes, audit partner activities, and execute settlement cycles. Please ensure your credentials are kept secure.
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="flex items-center justify-between group/item">
       <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/item:text-[#10b981] group-hover/item:bg-[#10b981]/5 transition-all">
             <Icon name={icon} />
          </div>
          <div>
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{label}</p>
             <p className="text-sm font-bold text-white mt-0.5">{value}</p>
          </div>
       </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const s = { width: 14, height: 14, strokeWidth: 3, stroke: 'currentColor' };
  switch (name) {
    case 'tag': return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
    case 'phone': return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'mail': return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case 'calendar': return <svg {...s} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    default: return null;
  }
}
