'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { IUser } from '@/types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, currentUser, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    referrerId: currentUser.memberId || '',
    state: '',
    role: currentUser.role?.toLowerCase() === 'admin' ? 'sh' : (currentUser.role?.toLowerCase() === 'sh' ? 'hba' : 'hcc')
  });

  if (!isOpen) return null;

  const getAllowedRoles = () => {
    const role = currentUser.role?.toLowerCase();
    if (role === 'admin') return [
      { id: 'sh', label: 'State Head' },
      { id: 'hba', label: 'HBA' },
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    if (role === 'sh') return [
      { id: 'hba', label: 'HBA' },
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    if (role === 'hba') return [
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    if (role === 'hcm' || role === 'hcc') return [
      { id: 'hcc', label: 'HCC' }
    ];
    return [{ id: 'hcc', label: 'HCC' }];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-[500px] bg-[#111420] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-lg font-bold text-white">Enroll New Member</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-50">Sponsoring as {currentUser.memberId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {success ? (
            <div className="py-10 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 text-3xl mx-auto mb-4">✓</div>
              <h4 className="text-xl font-bold text-white mb-1">Successfully Added!</h4>
              <p className="text-xs text-muted">The new member has been joined to your network.</p>
            </div>
          ) : (
            <>
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-2xl">⚠️ {error}</div>}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Assign Rank</label>
                <div className="grid grid-cols-2 gap-2">
                  {getAllowedRoles().map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.id})}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                        formData.role === r.id ? 'bg-blue-500 border-blue-400 text-black shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-white/30'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Mobile Number</label>
                  <input required maxLength={10} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40" placeholder="e.g. member@email.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">State</label>
                  <select required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40 appearance-none">
                    <option value="">Select</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/40" />
                </div>
              </div>

              {currentUser.role?.toLowerCase() === 'admin' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Referrer ID (Sponsor)</label>
                  <input 
                    placeholder="e.g. CB-SH-1001" 
                    value={formData.referrerId} 
                    onChange={e => setFormData({...formData, referrerId: e.target.value.toUpperCase()})} 
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500/60 placeholder:text-white/10" 
                  />
                  <p className="text-[9px] text-emerald-500/50 font-bold ml-1 italic">Leave as {currentUser.memberId} to sponsor directly</p>
                </div>
              )}

              <button disabled={loading} type="submit" className="w-full py-4 rounded-xl bg-blue-500 text-black font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/10">
                {loading ? 'Processing...' : 'Confirm Enrollment'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
