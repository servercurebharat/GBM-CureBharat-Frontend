'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { IUser } from '@/types';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [initializing, setInitializing] = useState(true);

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
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.mobile || !formData.state || !formData.password) {
      setError('Name, mobile, password, and state are required');
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
    if (!currentUser || !currentUser.role) return [{ id: 'hcc', label: 'HCC Member' }];
    const role = currentUser.role.toLowerCase();
    
    // Admin can add ANY rank
    if (role === 'admin') return [
      { id: 'sh', label: 'State Head (SH)' },
      { id: 'hcb', label: 'HCB' },
      { id: 'hcm', label: 'HCM' },
      { id: 'hcc', label: 'HCC' }
    ];
    
    // State Head adds HCB/HCC
    if (role === 'sh') return [
      { id: 'hcb', label: 'HCB' },
      { id: 'hcc', label: 'HCC' }
    ];
    
    // HCB adds HCM/HCC
    if (role === 'hcb' || role === 'hba') return [
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
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[550px] relative z-10">
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-extrabold text-white tracking-tighter mb-1">
            Cure<span className="text-blue-500">Bharat</span>
          </div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-[0.3em] opacity-60">
            {currentUser ? `ENROLLING AS ${currentUser.role.toUpperCase()}` : 'Membership Application'}
          </div>
        </div>

        <div className="bg-[#111420]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl">
          {success ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 text-4xl mx-auto mb-6">✓</div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Registration Success!</h2>
              <p className="text-sm text-muted font-medium mb-8">Member has been added to the hierarchy. Returning to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {currentUser ? 'Enroll New Member' : 'Create Account'}
                </h2>
                <p className="text-sm text-muted font-medium">Join the CureBharat Network</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold px-4 py-3 rounded-2xl mb-8">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Select Member Rank</label>
                   <div className="grid grid-cols-2 gap-3">
                      {allowedRoles.map(role => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData({...formData, role: role.id})}
                          className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            formData.role === role.id 
                            ? 'bg-blue-500 border-blue-400 text-[#0d0f14] shadow-lg' 
                            : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Mobile Number</label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Referrer ID</label>
                    <input
                      type="text"
                      value={formData.referrerId}
                      onChange={(e) => setFormData({...formData, referrerId: e.target.value.toUpperCase()})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-blue-400 outline-none focus:border-blue-500/50 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">State</label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 appearance-none"
                    >
                      <option value="">Select State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Account Password</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50"
                    />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-blue-500 text-[#0d0f14] font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  {loading ? 'Processing...' : `Confirm Enrollment`}
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
