'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout, user, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mobile.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    if (password.length < 4) { setError('Enter your password'); return; }
    setLoading(true);
    try {
      await login(mobile, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show a "you're signed in" panel
  if (!authLoading && user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: '#060818' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #49D2B5, transparent 65%)' }} />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-[32px] p-10 flex flex-col items-center gap-6"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            {/* Top accent */}
            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
              style={{ background: 'linear-gradient(90deg, transparent, #49D2B5, #6366f1, transparent)' }} />
            
            <Image src="/image.png" alt="CureBharat" width={64} height={64} className="object-contain" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{ background: 'rgba(73,210,181,0.12)', border: '1px solid rgba(73,210,181,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#49D2B5' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: '#49D2B5' }}>
                  Active Session
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">You're signed in</h2>
              <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                as <span className="font-black text-white">{user.name}</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(73,210,181,0.12)', color: '#49D2B5' }}>
                  {user.role.toUpperCase()}
                </span>
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{user.memberId}</p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <a href={`/${user.role}`}
                className="w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] text-white text-center transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 60%, #131241 100%)',
                  boxShadow: '0 10px 30px -5px rgba(73,210,181,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                Go to My Dashboard →
              </a>
              <button
                onClick={logout}
                className="w-full py-3.5 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                Sign in as Different Account
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] font-medium mt-5 tracking-wide" style={{ color: 'rgba(255,255,255,0.12)' }}>
            CureBharat Wellness Pvt. Ltd. · Mumbai, India
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { value: '50K+', label: 'Partners' },
    { value: '₹2Cr+', label: 'Paid Out' },
    { value: '10K+', label: 'Hospitals' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const features = [
    { icon: '🩺', text: 'Preventive Healthcare' },
    { icon: '💰', text: 'Real-time Commissions' },
    { icon: '🤖', text: 'AI Health Analytics' },
    { icon: '🏥', text: 'Cashless Network' },
  ];

  return (
    <div className="min-h-screen w-full flex" style={{ background: '#060818' }}>

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Primary teal glow */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #49D2B5, transparent 65%)' }} />
        {/* Deep navy glow */}
        <div className="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #131241, #6366f1 50%, transparent 70%)' }} />
        {/* Small accent glow */}
        <div className="absolute top-[60%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #49D2B5, transparent 70%)' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #49D2B5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Animated floating orbs */}
        <div className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full opacity-40"
          style={{ background: '#49D2B5', animation: 'float1 6s ease-in-out infinite' }} />
        <div className="absolute top-[70%] left-[15%] w-2 h-2 rounded-full opacity-30"
          style={{ background: '#6366f1', animation: 'float2 8s ease-in-out infinite' }} />
        <div className="absolute top-[35%] right-[12%] w-2.5 h-2.5 rounded-full opacity-30"
          style={{ background: '#49D2B5', animation: 'float1 7s ease-in-out infinite 1s' }} />
        <div className="absolute top-[80%] right-[20%] w-1.5 h-1.5 rounded-full opacity-20"
          style={{ background: '#fff', animation: 'float2 5s ease-in-out infinite 0.5s' }} />
      </div>

      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-left { animation: slideInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .anim-right { animation: slideInRight 0.7s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .anim-up { animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.3s; }
        .anim-delay-4 { animation-delay: 0.4s; }
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 16px 20px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
          outline: none;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .input-field:focus {
          border-color: #49D2B5;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 4px rgba(73,210,181,0.12);
        }
      `}</style>

      {/* ── LEFT BRAND PANEL (Desktop only) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col justify-between p-14 xl:p-16 z-10 anim-left">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/image.png" alt="CureBharat" width={52} height={52} className="object-contain" />
          <div>
            <p className="text-white font-black text-xl tracking-wide leading-none">
              CURE<span style={{ color: '#49D2B5' }}>BHARAT</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] mt-1" style={{ color: 'rgba(73,210,181,0.6)' }}>
              Wellness Private Ltd.
            </p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="space-y-10 anim-up anim-delay-2">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(73,210,181,0.25)', background: 'rgba(73,210,181,0.06)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#49D2B5' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#49D2B5' }}>
              Partner Platform · Live
            </span>
          </div>

          <div>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tighter">
              Build Your<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #49D2B5, #6366f1)' }}>
                Wellness
              </span>
              <br />Empire.
            </h1>
            <p className="mt-5 text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              India's most advanced wellness MLM platform. Real-time commissions, preventive healthcare, and a nationwide hospital network.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-base">{f.icon}</span>
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {stats.map((s, i) => (
            <div key={i} className="anim-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <p className="text-2xl xl:text-3xl font-black text-white">{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 z-10 anim-right">
        <div className="w-full max-w-[420px]">

          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden anim-up">
            <Image src="/image.png" alt="CureBharat" width={44} height={44} className="object-contain" />
            <div>
              <p className="text-white font-black text-lg leading-none">
                CURE<span style={{ color: '#49D2B5' }}>BHARAT</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'rgba(73,210,181,0.5)' }}>
                Partner Portal
              </p>
            </div>
          </div>

          {/* ── GLASSMORPHISM CARD ── */}
          <div className="rounded-[32px] p-8 sm:p-10 relative overflow-hidden anim-up anim-delay-1"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>

            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
              style={{ background: 'linear-gradient(90deg, transparent, #49D2B5, #6366f1, transparent)' }} />

            {/* Card inner glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(73,210,181,0.12), transparent 70%)', filter: 'blur(40px)' }} />

            {/* Header */}
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#49D2B5' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Secure Login
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Welcome<br />Back
              </h2>
              <p className="text-sm mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Sign in to your partner dashboard
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-6 anim-up relative z-10"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12px] font-bold text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

              {/* Mobile Field */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 w-16 flex items-center justify-center h-full"
                    style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                    <span className="text-sm font-black" style={{ color: '#49D2B5' }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="input-field"
                    style={{ paddingLeft: '72px', paddingRight: mobile.length === 10 ? '48px' : '20px' }}
                  />
                  {mobile.length === 10 && (
                    <div className="absolute right-4 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: '#49D2B5' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Password
                  </label>
                  <a href="#" className="text-[10px] font-bold transition-colors" style={{ color: '#49D2B5' }}>
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field"
                    style={{ paddingRight: '52px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-100"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || mobile.length < 10 || password.length < 4}
                className="w-full relative py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 mt-2 group disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 60%, #131241 100%)',
                  boxShadow: '0 10px 30px -5px rgba(73,210,181,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                <div className="relative flex items-center justify-center gap-3 text-white">
                  {loading ? (
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-center gap-5">
                {[
                  { icon: '🔒', text: 'SSL Secured' },
                  { icon: '🛡️', text: 'Data Safe' },
                  { icon: '🇮🇳', text: 'India Compliant' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-sm">{b.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] font-medium mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                New partner?{' '}
                <a href="/register" className="font-black transition-colors hover:opacity-100" style={{ color: '#49D2B5' }}>
                  Apply for Membership →
                </a>
              </p>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] font-medium mt-5 tracking-wide" style={{ color: 'rgba(255,255,255,0.12)' }}>
            CureBharat Wellness Pvt. Ltd. · Mumbai, India
          </p>
        </div>
      </div>
    </div>
  );
}