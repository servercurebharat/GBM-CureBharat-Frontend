'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import { IPlan } from '@/types';
import { toast } from 'react-hot-toast';

export default function PublicBuyPage({ params }: { params: { memberId: string } }) {
  const router = useRouter();
  const memberId = params.memberId;

  // State
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    customerState: 'Maharashtra',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    planId: '',
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
          
          // Pre-select plan if planId is in URL
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

  const handleSimulatePayment = async () => {
    if (!formData.planId) return toast.error('Please select a plan');
    
    setSubmitting(true);
    try {
      // In a real flow, we'd call createOrder then open Razorpay.
      // For testing, we send a 'mock' verification to the backend.
      const mockPaymentData = {
        ...formData,
        refCode: memberId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_order_id: `order_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature', // Backend will accept this if keys are dummy
        isTest: true 
      };

      const res = await publicAPI.verifyPayment(mockPaymentData);
      
      if (res.data.success) {
        toast.success('Payment Successful!');
        const { policyId, newUser } = res.data.data;
        let successUrl = `/buy/success?policyId=${policyId}`;
        if (newUser) {
          successUrl += `&memberId=${newUser.memberId}&password=${newUser.password}`;
        }
        router.push(successUrl);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
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
                  // Skip Step 2 (Plan Selection) if planId is already pre-selected via URL
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
                <p className="text-sm text-slate-400">Secured online payment via Razorpay</p>
              </div>

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

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
                <span className="text-xl">🛡️</span>
                <p className="text-[10px] font-medium leading-relaxed text-blue-200/60 uppercase">
                  Your payment is secured by Razorpay. Policy ID will be generated instantly after successful transaction.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <button 
                  disabled={submitting}
                  onClick={handleSimulatePayment}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 uppercase tracking-[0.2em] text-sm relative overflow-hidden group"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Simulate Payment (Test)</span>
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
