'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI, subscriptionAPI } from '@/lib/api';
import { IPlan } from '@/types';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: any) => Promise<{ error?: { message: string }; redirect?: boolean }>;
    };
  }
}

export default function PublicBuyPage({ params }: { params: { memberId: string } }) {
  const router    = useRouter();
  const memberId  = params.memberId;

  const [loading,    setLoading]    = useState(true);
  const [seller,     setSeller]     = useState<any>(null);
  const [plans,      setPlans]      = useState<IPlan[]>([]);
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [autopay,    setAutopay]    = useState(false); // AutoPay toggle

  const [formData, setFormData] = useState({
    customerName:     '',
    customerMobile:   '',
    customerEmail:    '',
    customerState:    'Maharashtra',
    nomineeName:      '',
    nomineeRelation:  'Spouse',
    planId:           '',
  });

  const selectedPlan = plans.find(p => p._id === formData.planId);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await publicAPI.getSeller(memberId);
        if (res.data.success) {
          setSeller(res.data.data.seller);
          const activePlans = res.data.data.plans;
          setPlans(activePlans);

          const urlParams = new URLSearchParams(window.location.search);
          const pId = urlParams.get('planId');
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

  // ── One-time payment (standard Cashfree checkout) ─────────────────────────
  const handlePay = async () => {
    if (!formData.planId)         return toast.error('Please select a plan');
    if (!formData.customerName)   return toast.error('Please enter your name');
    if (!formData.customerMobile) return toast.error('Please enter your mobile number');

    setSubmitting(true);
    try {
      sessionStorage.setItem('cb_checkout_data', JSON.stringify({ ...formData, memberId }));

      const orderRes = await publicAPI.createOrder({
        planId:          formData.planId,
        refCode:         memberId,
        customerName:    formData.customerName,
        customerMobile:  formData.customerMobile,
        customerEmail:   formData.customerEmail,
      });

      if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Order creation failed');

      const { paymentSessionId } = orderRes.data.data as { orderId: string; paymentSessionId: string };

      if (typeof window.Cashfree === 'undefined') throw new Error('Payment SDK not loaded. Please refresh and try again.');

      const mode     = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
      const cashfree = window.Cashfree({ mode });

      const result = await cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
      if (result?.error) toast.error(result.error.message || 'Payment failed');

    } catch (err: any) {
      console.error('[Buy] Payment error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── AutoPay mandate creation ───────────────────────────────────────────────
  const handleAutoPay = async () => {
    if (!formData.planId)         return toast.error('Please select a plan');
    if (!formData.customerName)   return toast.error('Please enter your name');
    if (!formData.customerMobile) return toast.error('Please enter your mobile number');

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
      });

      if (!res.data.success) throw new Error(res.data.message || 'Subscription creation failed');

      const { authLink, subscriptionId, subsSessionId } = res.data.data;

      // Store subscription ID so success page can poll status
      sessionStorage.setItem('cb_subscription_id', subscriptionId);

      if (subsSessionId) {
        if (typeof window.Cashfree === 'undefined') throw new Error('Payment SDK not loaded. Please refresh.');
        const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
        const cashfree = window.Cashfree({ mode });
        cashfree.subscriptionsCheckout({ subsSessionId, redirectTarget: '_self' });
      } else if (authLink) {
        // Fallback for older api versions
        window.location.href = authLink;
      } else {
        throw new Error('No checkout session or auth link returned by Cashfree');
      }

    } catch (err: any) {
      console.error('[Buy] AutoPay error:', err);
      toast.error(err?.response?.data?.message || err.message || 'AutoPay setup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!seller) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Link Expired</h1>
        <p className="text-slate-400">This referral link is no longer active.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Branding */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="CureBharat" className="h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Enrollment Portal</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-white/60 uppercase">Invited by {seller.name}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-10 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} />
            </div>
          ))}
        </div>

        <div className="bg-[#12151c] border border-white/[0.05] rounded-[32px] p-8 shadow-2xl shadow-black/50">

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Your Information</h2>
                <p className="text-sm text-slate-400">Please provide your legal details for the policy</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name" value={formData.customerName} onChange={(v: string) => setFormData({...formData, customerName: v})} placeholder="Enter full name" />
                <Input label="Mobile Number" value={formData.customerMobile} onChange={(v: string) => setFormData({...formData, customerMobile: v.replace(/\D/g, '')})} placeholder="98765 43210" maxLength={10} />
                <Input label="Email (Optional)" value={formData.customerEmail} onChange={(v: string) => setFormData({...formData, customerEmail: v})} placeholder="john@example.com" />
                <Select label="State" value={formData.customerState} onChange={(v: string) => setFormData({...formData, customerState: v})} options={['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']} />
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">Nominee Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Nominee Name" value={formData.nomineeName} onChange={(v: string) => setFormData({...formData, nomineeName: v})} placeholder="Person name" />
                  <Select label="Relation" value={formData.nomineeRelation} onChange={(v: string) => setFormData({...formData, nomineeRelation: v})} options={['Spouse', 'Parent', 'Child', 'Sibling']} />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!formData.customerName || !formData.customerMobile || !formData.nomineeName) return toast.error('Please fill required fields');
                  setStep(formData.planId ? 3 : 2);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0c10] font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs mt-6"
              >
                {formData.planId ? 'Review & Pay →' : 'Choose Your Plan →'}
              </button>
            </div>
          )}

          {/* STEP 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Select Wellness Plan</h2>
                <p className="text-sm text-slate-400">Choose the coverage that suits you best</p>
              </div>

              <div className="space-y-4">
                {plans.map((plan) => (
                  <button
                    key={plan._id}
                    onClick={() => setFormData({...formData, planId: plan._id})}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${formData.planId === plan._id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">{plan.name}</h4>
                        <p className="text-xs text-slate-400 mb-4">{plan.description}</p>
                        <div className="flex gap-4">
                           <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Benefits</div>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1 Year Validity</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">₹{(plan.price / 100).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-500 font-bold">+18% GST</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Back</button>
                <button
                  onClick={() => {
                    if (!formData.planId) return toast.error('Please select a plan');
                    setStep(3);
                  }}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-[#0a0c10] font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Pay */}
          {step === 3 && selectedPlan && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Confirm & Pay</h2>
                <p className="text-sm text-slate-400">Secured online payment via Cashfree</p>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plan Amount</span>
                  <span className="text-white font-bold">₹{(selectedPlan.price / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-white font-bold">₹{((selectedPlan.price * 0.18) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-white font-black text-base uppercase tracking-widest">Total Payable</span>
                  <span className="text-emerald-400 font-black text-2xl">₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* AutoPay Toggle */}
              <div className={`rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer ${autopay ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                onClick={() => setAutopay(!autopay)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${autopay ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={autopay ? '#a855f7' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-black ${autopay ? 'text-purple-300' : 'text-white'}`}>Enable AutoPay (Yearly)</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Auto-renew every year — no manual payment</p>
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${autopay ? 'bg-purple-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${autopay ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>

                {autopay && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-2">
                    <div className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" className="mt-0.5 shrink-0">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                      </svg>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">How AutoPay Works</p>
                        <p className="text-[10px] text-purple-300/70 font-bold leading-relaxed">
                          ✅ <strong>First charge:</strong> ₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')} deducted immediately<br/>
                          🔁 <strong>Yearly renewal:</strong> Same amount auto-deducted each year<br/>
                          ❌ <strong>Cancel anytime</strong> from your bank UPI / NetBanking settings
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security badge */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-center">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <p className="text-[10px] font-medium leading-relaxed text-blue-200/60 uppercase">
                  Your payment is secured by Cashfree. Policy ID will be generated instantly after successful transaction.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <button
                  id="cashfree-pay-now-btn"
                  disabled={submitting}
                  onClick={autopay ? handleAutoPay : handlePay}
                  className={`w-full font-black py-5 rounded-2xl transition-all shadow-2xl uppercase tracking-[0.2em] text-sm relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed text-white ${
                    autopay
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/20'
                      : 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-emerald-500/20'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{autopay ? 'Setting up AutoPay...' : 'Opening Payment...'}</span>
                    </div>
                  ) : autopay ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                      <span>Setup AutoPay — ₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}/yr</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Pay Now — ₹{((selectedPlan.price * 1.18) / 100).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </button>
                <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2">Edit Plan Selection</button>
              </div>
            </div>
          )}

        </div>

        <p className="text-center mt-12 text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">
          © 2026 CureBharat Wellness · Secure Enrollment Platform
        </p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, maxLength }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</p>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all placeholder:opacity-10"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 appearance-none"
      >
        {options.map((o: string) => <option key={o} value={o} className="bg-[#12151c]">{o}</option>)}
      </select>
    </div>
  );
}
