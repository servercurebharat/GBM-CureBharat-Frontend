'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { authAPI } from '@/lib/api';

type Step = 'mobile' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // Only for dev testing
  const { login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.sendOTP(mobile);
      if (res.data.success) {
        setDevOtp(res.data.otp || ''); 
        setStep('otp');
      } else {
        setError(res.data.message || 'User not found or blocked');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await login(mobile, otp);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.05),transparent_70%)]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-hcc/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-40 h-40 p-2 mb-6 transform hover:rotate-6 transition-transform cursor-pointer">
             <img src="/image.png" alt="CureBharat" className="w-full h-full object-contain" />
          </div>
          <div className="font-display text-2xl font-black text-white tracking-[0.2em] uppercase leading-none mb-1">
            CUREBHARAT
          </div>
          <div className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">
            Wellness Partner Portal
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-surface border border-white/[0.07] rounded-[32px] p-8 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {step === 'mobile' ? 'Welcome back' : 'Verification'}
            </h2>
            <p className="text-sm text-muted font-medium">
              {step === 'mobile' 
                ? 'Sign in to access your MLM dashboard' 
                : `We've sent a code to +91 ${mobile.slice(0, 5)}XXXXX`
              }
            </p>
          </div>

          {error && (
            <div className="bg-hcm/10 border border-hcm/20 text-hcm text-[11px] font-bold px-4 py-3 rounded-2xl mb-6 animate-in fade-in zoom-in-95 duration-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={step === 'mobile' ? handleSendOTP : handleVerifyOTP} className="space-y-6">
            {step === 'mobile' ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                  Connect via Mobile
                </label>
                <div className="flex gap-3">
                  <div className="bg-[#1c2030] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white/40 flex items-center shadow-inner">
                    +91
                  </div>
                  <input
                    type="tel"
                    autoFocus
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="90000 00000"
                    className="flex-1 bg-[#1c2030] border border-white/10 rounded-2xl px-6 py-4 text-base font-bold text-white placeholder:text-white/5 focus:border-hcc/50 focus:bg-[#252a3d] transition-all outline-none shadow-inner"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {devOtp && (
                  <div className="bg-sh/5 border border-sh/20 text-sh text-[10px] font-black px-5 py-3 rounded-2xl flex justify-between items-center animate-pulse">
                    <span className="opacity-60">TEST OTP:</span>
                    <span className="font-mono text-base tracking-[0.4em]">{devOtp}</span>
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 text-center block">
                    Identity Verification
                  </label>
                  <input
                    type="tel"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-[#1c2030] border border-white/10 rounded-[24px] px-4 py-6 text-3xl font-display font-bold text-white text-center tracking-[0.5em] placeholder:text-white/5 focus:border-hcc/50 focus:bg-[#252a3d] transition-all outline-none shadow-2xl"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (step === 'mobile' ? mobile.length !== 10 : otp.length !== 6)}
              className="group relative w-full py-5 rounded-[24px] bg-hcc text-[#0d0f14] font-black text-xs uppercase tracking-[0.2em] overflow-hidden hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-hcc/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0d0f14] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 'mobile' ? 'Get Access Code' : 'Authorize Login'}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
          </form>

          {step === 'otp' && (
            <button
              onClick={() => { setStep('mobile'); setOtp(''); setDevOtp(''); }}
              className="w-full text-[10px] font-bold text-muted hover:text-white mt-6 uppercase tracking-widest transition-all"
            >
              Edit Phone Number
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-muted font-medium">
            New to CureBharat? {' '}
            <a href="/register" className="text-hcc font-bold hover:underline">Apply for Membership</a>
          </p>
        </div>
      </div>
    </div>
  );
}