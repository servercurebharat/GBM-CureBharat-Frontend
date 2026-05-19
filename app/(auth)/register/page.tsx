'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { IUser } from '@/types';
import Image from 'next/image';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isReferrerDisabled, setIsReferrerDisabled] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    referrerId: '',
    state: '',
    role: 'hcc'
  });

  useEffect(() => {
    async function checkSession() {
      try {
        setInitializing(true);
        const res = await authAPI.getMe();
        if (res?.data?.success && res?.data?.user) {
          const user = res.data.user;
          setCurrentUser(user);
          
          // Pre-fill referrerId and adjust default role
          const role = user.role?.toLowerCase();
          if (role !== 'admin') {
            setFormData(prev => ({ 
              ...prev, 
              referrerId: user.memberId || '',
              role: role === 'sh' ? 'hba' : 'hcc'
            }));
          } else {
             // Admin defaults to adding State Head
             setFormData(prev => ({ ...prev, role: 'sh' }));
          }
        }
      } catch (err) {
        // Not logged in is fine for public signups
      } finally {
        setInitializing(false);
      }
    }
    checkSession();

    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referrerId: ref.toUpperCase() }));
      setIsReferrerDisabled(true);
    }
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setFormData(prev => ({ ...prev, role: roleParam.toLowerCase() }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.mobile || !formData.email || !formData.state || !formData.password) {
      setError('Name, mobile, email, password, and state are required');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
           if (currentUser) {
             window.location.href = `/${currentUser.role.toLowerCase()}`;
           } else {
             router.push('/login');
           }
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'];
  
  const getAllowedRoles = () => {
    if (!currentUser || !currentUser.role) {
      const rParam = searchParams.get('role')?.toLowerCase();
      if (rParam) {
        const labels: Record<string, string> = {
          sh: 'State Head (SH)',
          hba: 'HBA',
          hcb: 'HBA',
          hcm: 'HCM',
          hcc: 'HCC'
        };
        const mappedParam = rParam === 'hcb' ? 'hba' : rParam;
        return [{ id: mappedParam, label: labels[mappedParam] || mappedParam.toUpperCase() }];
      }
      return [{ id: 'hcc', label: 'HCC Member' }];
    }
    const role = currentUser.role.toLowerCase();
    
    // Admin can add ANY rank
    if (role === 'admin') return [
      { id: 'sh', label: 'State Head (SH)' },
      { id: 'hba', label: 'HBA' },
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    
    // State Head adds HBA/HCC
    if (role === 'sh') return [
      { id: 'hba', label: 'HBA' },
      { id: 'hcc', label: 'HCC' }
    ];
    
    // HBA adds HCM/HCC
    if (role === 'hba') return [
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    
    // HCM adds HCM/HCC
    if (role === 'hcm') return [
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];

    return [{ id: 'hcc', label: 'HCC' }];
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allowedRoles = getAllowedRoles();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden z-10" style={{ background: 'linear-gradient(135deg, #152347 0%, #1a2d55 40%, #112040 100%)' }}>
      
      {/* ── ANIMATED BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Primary teal glow */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-45 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #49D2B5, transparent 65%)' }} />
        {/* Deep navy glow */}
        <div className="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] rounded-full opacity-40 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #3b3fa0, #6366f1 50%, transparent 70%)' }} />
        {/* Small accent glow */}
        <div className="absolute top-[60%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-30 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #49D2B5, transparent 70%)' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.09]"
          style={{ backgroundImage: 'radial-gradient(circle, #49D2B5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-[550px] relative z-10 my-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="CureBharat" width={220} height={60} className="object-contain" priority />
        </div>

        {/* Glassmorphism card container */}
        <div className="rounded-[32px] p-8 md:p-10 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.28)',
            border: '1px solid rgba(255,255,255,0.42)',
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>

          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
            style={{ background: 'linear-gradient(90deg, transparent, #49D2B5, #6366f1, transparent)' }} />

          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 text-4xl mx-auto mb-6">✓</div>
              <h2 className="font-display text-2xl font-black text-white mb-2">Registration Success!</h2>
              <p className="text-sm text-slate-300 font-medium mb-8">Member has been added to the hierarchy. Returning to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#49D2B5' }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {currentUser ? `ENROLLING AS ${currentUser.role.toUpperCase()}` : 'Membership Application'}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                  {currentUser ? 'Enroll Member' : 'Create Account'}
                </h2>
                <p className="text-sm mt-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Join the CureBharat Wellness network
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-6 relative z-10"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[12px] font-bold text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2.5">
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Select Member Rank</label>
                   <div className="grid grid-cols-2 gap-3">
                      {allowedRoles.map(role => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData({...formData, role: role.id})}
                          className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            formData.role === role.id 
                            ? 'border-[#49D2B5] text-white shadow-lg' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                          }`}
                          style={formData.role === role.id ? {
                            background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 60%)',
                            boxShadow: '0 4px 15px -3px rgba(73,210,181,0.3)',
                          } : {}}
                        >
                          {role.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none placeholder-white/50 focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Mobile Number</label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none placeholder-white/50 focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none placeholder-white/50 focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Referrer ID</label>
                    <input
                      type="text"
                      disabled={isReferrerDisabled}
                      placeholder="CB-ADMIN-0001"
                      value={formData.referrerId}
                      onChange={(e) => setFormData({...formData, referrerId: e.target.value.toUpperCase()})}
                      className={`w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-bold text-[#49D2B5] outline-none placeholder-[#49D2B5]/40 focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all uppercase ${
                        isReferrerDisabled ? 'opacity-50 cursor-not-allowed select-none' : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>State</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all appearance-none cursor-pointer"
                        style={{ color: formData.state ? '#fff' : 'rgba(255,255,255,0.55)' }}
                      >
                        <option value="" className="bg-[#152347] text-white/50">Select State</option>
                        {states.map(s => <option key={s} value={s} className="bg-[#152347] text-white font-semibold">{s}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Account Password</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/20 border border-white/30 rounded-2xl px-5 py-4 text-sm font-semibold text-white outline-none placeholder-white/50 focus:border-[#49D2B5] focus:bg-white/25 focus:ring-4 focus:ring-[#49D2B5]/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 group disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
                  style={{
                    background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 60%, #131241 100%)',
                    boxShadow: '0 10px 30px -5px rgba(73,210,181,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                  <span className="relative z-10 text-white">
                    {loading ? 'Processing Enrollment...' : `Confirm Enrollment`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
