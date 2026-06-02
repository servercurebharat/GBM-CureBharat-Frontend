'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { publicAPI, subscriptionAPI } from '@/lib/api';
import { IPlan } from '@/types';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: any) => Promise<{ error?: { message: string }; redirect?: boolean }>;
      subscriptionsCheckout: (options: any) => Promise<{ error?: { message: string }; redirect?: boolean }>;
    };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
type EnrollmentType = 'customer' | 'distributor';
type OtpState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified';
type MobileState = 'idle' | 'checking' | 'new' | 'existing';

interface FormData {
  enrollmentType:  EnrollmentType;
  customerName:    string;
  customerMobile:  string;
  customerEmail:   string;
  customerDOB:     string;
  customerPAN:     string;
  customerState:   string;
  nomineeName:     string;
  nomineeRelation: string;
  planId:          string;
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Lakshadweep','Puducherry',
];

const formatDOB = (val: string) => {
  const cleaned = val.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function PublicBuyPage({ params }: { params: { memberId: string } }) {
  const memberId = params.memberId;

  const [loading,    setLoading]    = useState(true);
  const [seller,     setSeller]     = useState<any>(null);
  const [plans,      setPlans]      = useState<IPlan[]>([]);
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Mobile check state
  const [mobileState,    setMobileState]    = useState<MobileState>('idle');
  const [existingUser,   setExistingUser]   = useState<any>(null);
  const mobileCheckTimer = useRef<ReturnType<typeof setTimeout>>();

  // Email OTP state
  const [otpState,    setOtpState]    = useState<OtpState>('idle');
  const [otpInput,    setOtpInput]    = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const [highestPlanPrice, setHighestPlanPrice] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    enrollmentType:  'customer',
    customerName:    '',
    customerMobile:  '',
    customerEmail:   '',
    customerDOB:     '',
    customerPAN:     '',
    customerState:   'Maharashtra',
    nomineeName:     '',
    nomineeRelation: 'Spouse',
    planId:          '',
  });

  const selectedPlan = plans.find(p => p._id === formData.planId);
  const emailVerified = otpState === 'verified';
  const emailRequired = formData.enrollmentType === 'distributor';

  // ── Load seller & plans ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const res = await publicAPI.getSeller(memberId);
        if (res.data.success) {
          setSeller(res.data.data.seller);
          const activePlans = res.data.data.plans;
          setPlans(activePlans);
          const pId = new URLSearchParams(window.location.search).get('planId');
          if (pId && activePlans.some((p: IPlan) => p._id === pId)) {
            setFormData(prev => ({ ...prev, planId: pId }));
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Invalid referral link');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [memberId]);

  // ── Mobile number debounce check ──────────────────────────────────────────
  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, customerMobile: cleaned }));
    setMobileState('idle');
    setExistingUser(null);

    clearTimeout(mobileCheckTimer.current);
    if (cleaned.length === 10) {
      setMobileState('checking');
      mobileCheckTimer.current = setTimeout(async () => {
        try {
          const res = await publicAPI.checkMobile(cleaned);
          if (res.data.data.exists) {
            setMobileState('existing');
            setExistingUser(res.data.data);
            setHighestPlanPrice(res.data.data.highestPlanPrice || 0);
          } else {
            setMobileState('new');
            setHighestPlanPrice(res.data.data.highestPlanPrice || 0);
          }
        } catch {
          setMobileState('idle');
        }
      }, 600);
    }
  };

  // ── OTP: send ─────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!formData.customerEmail.includes('@')) return toast.error('Enter a valid email first');
    setOtpState('sending');
    try {
      await publicAPI.sendOTP(formData.customerEmail);
      setOtpState('sent');
      setOtpInput('');
      // Start 60s countdown
      setOtpCountdown(60);
      countdownRef.current = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
      toast.success(`OTP sent to ${formData.customerEmail}`);
    } catch (err: any) {
      setOtpState('idle');
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // ── OTP: verify ───────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otpInput.length !== 6) return toast.error('Enter the 6-digit OTP');
    setOtpState('verifying');
    try {
      await publicAPI.verifyOTP(formData.customerEmail, otpInput);
      setOtpState('verified');
      clearInterval(countdownRef.current);
      toast.success('Email verified! ✓');
    } catch (err: any) {
      setOtpState('sent');
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!formData.customerName.trim())              return toast.error('Full name is required'), false;
    if (formData.customerMobile.length !== 10)      return toast.error('Enter a valid 10-digit mobile number'), false;
    if (mobileState === 'existing' && formData.enrollmentType === 'distributor') {
      return toast.error('This mobile number is already registered as a distributor. Please select "Customer Only" to upgrade your plan.'), false;
    }
    if (!formData.customerDOB)                      return toast.error('Date of Birth is required'), false;
    if (!formData.customerPAN || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.customerPAN.toUpperCase()))
                                                    return toast.error('Enter a valid PAN number (e.g. ABCDE1234F)'), false;
    
    if (formData.enrollmentType === 'distributor') {
      if (!formData.customerEmail.includes('@'))    return toast.error('Email is required for Distributor enrollment'), false;
      if (!emailVerified)                           return toast.error('Please verify your email with OTP first'), false;
    }
    if (!formData.nomineeName.trim())               return toast.error('Nominee name is required'), false;
    return true;
  };

  // ── Payment ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    setSubmitting(true);
    try {
      sessionStorage.setItem('cb_checkout_data', JSON.stringify({ ...formData, memberId }));

      const orderRes = await publicAPI.createOrder({
        planId:         formData.planId,
        refCode:        memberId,
        customerName:   formData.customerName,
        customerMobile: formData.customerMobile,
        customerEmail:  formData.customerEmail,
      });

      if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Order creation failed');
      const { paymentSessionId } = orderRes.data.data as any;

      if (typeof window.Cashfree === 'undefined') throw new Error('Payment SDK not loaded. Please refresh and try again.');
      const mode     = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
      const cashfree = window.Cashfree({ mode });
      const result   = await cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
      if (result?.error) toast.error(result.error.message || 'Payment failed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoPay = async () => {
    setSubmitting(true);
    try {
      sessionStorage.setItem('cb_checkout_data', JSON.stringify({ ...formData, memberId }));
      const res = await subscriptionAPI.create({
        planId:          formData.planId,
        refCode:         memberId,
        customerName:    formData.customerName,
        customerMobile:  formData.customerMobile,
        customerEmail:   formData.customerEmail,
        customerState:   formData.customerState,
        nomineeName:     formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        returnUrl:       `${window.location.origin}/api/payment-return?path=/buy/success`,
      });
      if (!res.data.success) throw new Error(res.data.message || 'Subscription creation failed');
      const { authLink, subsSessionId } = res.data.data;
      if (subsSessionId) {
        if (typeof window.Cashfree === 'undefined') throw new Error('Payment SDK not loaded.');
        const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
        window.Cashfree({ mode }).subscriptionsCheckout({ subsSessionId, redirectTarget: '_self' });
      } else if (authLink) {
        window.location.href = authLink;
      } else {
        throw new Error('No checkout session returned');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'AutoPay setup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error screens ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0B0A26] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#6029F1] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!seller) return (
    <div className="min-h-screen bg-[#0B0A26] flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Link Expired</h1>
        <p className="text-slate-400">This referral link is no longer active.</p>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0A26] text-slate-200 selection:bg-[#6029F1]/30">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6029F1]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo.png" alt="CureBharat" className="h-14 object-contain mb-5" />
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Enrollment Portal</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6029F1] animate-pulse" />
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Invited by {seller.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-3 mb-8 px-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#6029F1] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} />
            </div>
          ))}
        </div>

        <div className="bg-[#131241] border border-white/[0.05] rounded-[28px] p-7 shadow-2xl shadow-black/50">

          {/* ═══════════════════════════════ STEP 1 ═══════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your Information</h2>
                <p className="text-sm text-slate-400">Please provide your legal details for the policy</p>
              </div>

              {/* Enrollment Type Radio */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrollment Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val: 'customer',    label: '🛡️ Customer Only',    sub: 'Policy only, no login account' },
                    { val: 'distributor', label: '🚀 Distributor',       sub: 'Join network, get HCC account' },
                  ] as const).map(({ val, label, sub }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, enrollmentType: val }));
                        setOtpState('idle');
                        setOtpInput('');
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formData.enrollmentType === val
                          ? val === 'distributor'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                            : 'bg-[#6029F1]/10 border-[#6029F1] text-emerald-300'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-300'
                      }`}
                    >
                      <p className="font-black text-sm mb-0.5">{label}</p>
                      <p className="text-[10px] opacity-60 font-medium">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name *" value={formData.customerName} onChange={v => setFormData(p => ({ ...p, customerName: v }))} placeholder="As on Aadhaar" />

                {/* Mobile with live check */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Number *</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.customerMobile}
                      maxLength={10}
                      onChange={e => handleMobileChange(e.target.value)}
                      placeholder="10-digit number"
                      className={`w-full bg-white/[0.03] border rounded-xl px-5 py-4 text-sm font-bold text-white outline-none transition-all placeholder:opacity-10 pr-10 ${
                        mobileState === 'existing' ? 'border-red-500/60 focus:border-red-500' :
                        mobileState === 'new'      ? 'border-[#6029F1]/60 focus:border-[#6029F1]' :
                                                     'border-white/10 focus:border-[#6029F1]/50'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {mobileState === 'checking' && <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />}
                      {mobileState === 'new'      && <span className="text-[#7a4af7] text-lg">✓</span>}
                      {mobileState === 'existing' && <span className="text-red-400 text-lg">✗</span>}
                    </div>
                  </div>
                  {mobileState === 'existing' && existingUser && (
                    <p className="text-[10px] text-red-400 font-bold ml-1">
                      Already registered as {existingUser.memberId} ({existingUser.role?.toUpperCase()})
                    </p>
                  )}
                  {mobileState === 'new' && (
                    <p className="text-[10px] text-[#7a4af7] font-bold ml-1">Mobile number is available ✓</p>
                  )}
                </div>

                <Input label="Date of Birth" value={formData.customerDOB} onChange={v => setFormData(p => ({ ...p, customerDOB: formatDOB(v) }))} placeholder="DD/MM/YYYY" />
                <Select label="State" value={formData.customerState} onChange={v => setFormData(p => ({ ...p, customerState: v }))} options={STATES} />
              </div>

              {/* Email + OTP section */}
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Email {emailRequired ? '*' : '(Optional)'}
                      {emailVerified && <span className="ml-2 text-[#7a4af7]">✓ Verified</span>}
                    </p>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={e => {
                        setFormData(p => ({ ...p, customerEmail: e.target.value }));
                        if (otpState !== 'idle') { setOtpState('idle'); setOtpInput(''); }
                      }}
                      disabled={emailVerified}
                      placeholder="your@email.com"
                      className={`w-full bg-white/[0.03] border rounded-xl px-5 py-4 text-sm font-bold text-white outline-none transition-all placeholder:opacity-10 disabled:opacity-40 ${
                        emailVerified ? 'border-[#6029F1]/60' : 'border-white/10 focus:border-[#6029F1]/50'
                      }`}
                    />
                  </div>
                  {!emailVerified && (
                    <button
                      type="button"
                      disabled={otpState === 'sending' || !formData.customerEmail.includes('@')}
                      onClick={handleSendOTP}
                      className="py-4 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 whitespace-nowrap"
                    >
                      {otpState === 'sending' ? '...' : otpState === 'sent' ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* OTP input */}
                {(otpState === 'sent' || otpState === 'verifying') && (
                  <div className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 bg-white/[0.03] border border-blue-500/40 rounded-xl px-5 py-3 text-sm font-black text-white outline-none focus:border-blue-500 tracking-[0.5em] placeholder:tracking-normal placeholder:opacity-20"
                    />
                    <button
                      type="button"
                      disabled={otpInput.length !== 6 || otpState === 'verifying'}
                      onClick={handleVerifyOTP}
                      className="py-3 px-5 rounded-xl bg-[#4a1dd6] hover:bg-[#6029F1] text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                    >
                      {otpState === 'verifying' ? '...' : 'Verify'}
                    </button>
                  </div>
                )}
                {otpCountdown > 0 && otpState !== 'verified' && (
                  <p className="text-[10px] text-slate-500 font-bold ml-1">Resend OTP in {otpCountdown}s</p>
                )}
              </div>

              {/* PAN — required for all for policy issuance */}
              <div className="animate-in slide-in-from-top-2 duration-300">
                <Input
                  label="PAN Number *"
                  value={formData.customerPAN}
                  onChange={(v: string) => setFormData(p => ({ ...p, customerPAN: v.toUpperCase().slice(0, 10) }))}
                  placeholder="ABCDE1234F"
                />
                <p className="text-[10px] text-slate-500 font-bold mt-1 ml-1">Required for Policy & Tax Benefits</p>
              </div>

              {/* Nominee */}
              <div className="pt-5 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Nominee Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Nominee Name *" value={formData.nomineeName} onChange={(v: string) => setFormData(p => ({ ...p, nomineeName: v }))} placeholder="Full name" />
                  <Select label="Relation" value={formData.nomineeRelation} onChange={(v: string) => setFormData(p => ({ ...p, nomineeRelation: v }))} options={['Spouse', 'Parent', 'Child', 'Sibling', 'Friend']} />
                </div>
              </div>

              {/* Distributor note */}
              {formData.enrollmentType === 'distributor' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">🚀 Distributor Benefits</p>
                  <p className="text-[11px] text-blue-200/60 leading-relaxed">
                    You will receive an HCC Member ID & login credentials after enrollment. Start earning 40% direct commission on every plan you sell!
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!validateStep1()) return;
                  setStep(formData.planId ? 3 : 2);
                }}
                className="w-full bg-[#6029F1] hover:bg-[#7a4af7] text-[#0a0c10] font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#6029F1]/20 uppercase tracking-widest text-xs mt-2"
              >
                {formData.planId ? 'Review & Pay →' : 'Choose Your Plan →'}
              </button>
            </div>
          )}

          {/* ═══════════════════════════════ STEP 2 ═══════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Select Wellness Plan</h2>
                <p className="text-sm text-slate-400">Choose the coverage that suits you best</p>
              </div>

              <div className="space-y-4">
                {plans.map(plan => {
                  const isDowngrade = plan.price <= highestPlanPrice;

                  return (
                    <button
                      key={plan._id}
                      type="button"
                      disabled={isDowngrade}
                      onClick={() => setFormData(p => ({ ...p, planId: plan._id }))}
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                        isDowngrade ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5' :
                        formData.planId === plan._id
                          ? 'bg-[#6029F1]/10 border-[#6029F1]'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-lg mb-1">
                            {plan.name} {isDowngrade && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2">Owned / Downgrade</span>}
                          </h4>
                          <p className="text-xs text-slate-400 mb-3">{plan.description}</p>
                        <div className="flex gap-3">
                          <span className="text-[9px] font-black text-[#7a4af7] uppercase tracking-widest">Active Benefits</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">1 Year Validity</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-2xl font-black text-white">₹{(plan.price / 100).toLocaleString('en-IN')}</div>
                        <div className="text-[9px] text-slate-500 font-bold">+18% GST</div>
                      </div>
                    </div>
                  </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">← Back</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.planId) return toast.error('Please select a plan');
                    setStep(3);
                  }}
                  className="flex-[2] bg-[#6029F1] hover:bg-[#7a4af7] text-[#0a0c10] font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#6029F1]/20 uppercase tracking-widest text-xs"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════ STEP 3 ═══════════════════════════════ */}
          {step === 3 && selectedPlan && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Confirm & Pay</h2>
                <p className="text-sm text-slate-400">Secured online payment via Cashfree</p>
              </div>

              {/* Summary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Customer</span>
                  <span className="text-white font-bold">{formData.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                    formData.enrollmentType === 'distributor'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-[#6029F1]/20 text-emerald-300'
                  }`}>
                    {formData.enrollmentType === 'distributor' ? '🚀 Distributor' : '🛡️ Customer Only'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white font-bold">{selectedPlan.name}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between text-sm">
                  <span className="text-slate-400">Plan Amount</span>
                  <span className="text-white font-bold">₹{(selectedPlan.price / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-white font-bold">₹{((selectedPlan.price * 0.18) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-white font-black uppercase tracking-widest text-sm">Total Payable</span>
                  <span className="text-[#7a4af7] font-black text-2xl">₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-xl flex-shrink-0">✅</span>
                <p className="text-[9px] font-medium text-emerald-200/80 uppercase leading-relaxed">
                  One-time payment of ₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}. No automatic renewals.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-xl flex-shrink-0">🛡️</span>
                <p className="text-[9px] font-medium text-blue-200/60 uppercase leading-relaxed">
                  Your payment is secured by Cashfree. Policy ID generated instantly after successful transaction.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <button
                  id="cashfree-pay-now-btn"
                  type="button"
                  disabled={submitting}
                  onClick={handlePay}
                  className="w-full font-black py-5 rounded-2xl transition-all shadow-2xl uppercase tracking-[0.2em] text-sm disabled:opacity-60 disabled:cursor-not-allowed text-white bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Pay Now — ₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}</span>
                  )}
                </button>
                <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2">
                  ← Edit Plan
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-10 text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
          © 2026 CureBharat Wellness · Secure Enrollment Platform
        </p>
      </div>
    </div>
  );
}

// ── Reusable Input ─────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</p>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#6029F1]/50 transition-all placeholder:opacity-10"
      />
    </div>
  );
}

// ── Reusable Select ────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#131241] border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#6029F1]/50 appearance-none"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#131241] text-white">{o}</option>)}
      </select>
    </div>
  );
}
