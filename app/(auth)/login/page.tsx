'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.length < 4) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      // We use the login function which now handles password-based verification
      await login(mobile, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6029F1]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#60a5fa]/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="w-24 h-24 mb-6 relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-hcc blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Image 
              src="/image.png" 
              alt="CureBharat" 
              width={96} 
              height={96} 
              className="relative z-10 transform group-hover:scale-110 transition-transform duration-500 object-contain"
              priority
            />
          </div>
          <h1 className="font-display text-3xl font-black text-white tracking-[0.25em] uppercase leading-none">
            CURE<span className="text-hcc">BHARAT</span>
          </h1>
          <p className="text-[10px] font-bold text-white/20 tracking-[0.5em] uppercase mt-4">
            Wellness Partner Ecosystem
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111420]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in to manage your business</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-hcc transition-colors font-bold">+91</div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="90000 00000"
                  className="w-full bg-black/40 border border-white/10 rounded-[22px] pl-16 pr-6 py-5 text-lg font-bold text-white placeholder:text-white/5 focus:border-hcc/50 focus:bg-black/60 transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">OTP / Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456 or Password"
                className="w-full bg-black/40 border border-white/10 rounded-[22px] px-6 py-5 text-lg font-bold text-white placeholder:text-white/5 focus:border-hcc/50 focus:bg-black/60 transition-all outline-none shadow-inner"
              />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest text-center mt-2">
                Use <span className="text-hcc">123456</span> for instant test access
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length < 10 || password.length < 4}
              className={`w-full py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden transition-all duration-500 shadow-xl mt-4 ${
                loading || mobile.length < 10 || password.length < 4
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-[#0d0f14] hover:scale-[1.02] active:scale-95 shadow-[#60a5fa]/40'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-5 h-5 border-3 border-[#0d0f14] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Secure Login</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account? <a href="/register" className="text-hcc font-bold hover:underline">Apply for Membership</a>
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 flex flex-col items-center gap-6">
           <p className="text-slate-500 text-xs font-medium">
             Facing issues? <a href="#" className="text-hcc font-bold hover:underline">Contact Support</a>
           </p>
           <div className="flex gap-8 opacity-20 hover:opacity-40 transition-opacity">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" />
              </div>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}