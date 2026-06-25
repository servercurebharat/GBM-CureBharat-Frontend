'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicAPI, subscriptionAPI } from '@/lib/api';

// ─── Inner component that handles Cashfree redirect verification ──────────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Cashfree redirect params (from CASHFREE_RETURN_URL template)
  const cfOrderId      = searchParams.get('order_id');      // one-time payment
  const cfSubId        = searchParams.get('subscription_id'); // autopay mandate
  const refCode        = searchParams.get('ref');
  const planId         = searchParams.get('plan');

  // After verification completes, these are populated
  const [verifying,  setVerifying]  = useState(!!(cfOrderId || cfSubId));
  const [policyId,   setPolicyId]   = useState(searchParams.get('policyId') || '');
  const [memberId,   setMemberId]   = useState(searchParams.get('memberId') || '');
  const [password,   setPassword]   = useState(searchParams.get('password') || '');
  const [autopay,    setAutopay]    = useState(false);
  const [failed,     setFailed]     = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  // Guard against React StrictMode double-effect (runs useEffect twice in dev)
  const verificationRef = useRef(false);

  // Customer details are stored in sessionStorage before Cashfree redirect
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    // If we came directly (no Cashfree order_id or subscription_id) just show success
    if (!cfOrderId && !cfSubId) {
      setVerifying(false);
      return;
    }

    // Prevent double-call from React StrictMode (runs effects twice in dev)
    if (verificationRef.current) return;
    verificationRef.current = true;

    // Load customer form data saved before redirect
    let saved: any = {};
    try {
      const raw = sessionStorage.getItem('cb_checkout_data');
      if (raw) saved = JSON.parse(raw);
    } catch { /* ignore */ }

    setCustomerData(saved);

    // ── AutoPay / Subscription mandate return ─────────────────────────────
    if (cfSubId) {
      (async () => {
        try {
          // Poll subscription status (Cashfree webhook activates it asynchronously)
          // We poll up to 10 times with 2s delay
          let attempts = 0;
          let saleData: any = null;

          while (attempts < 10) {
            const res = await subscriptionAPI.getStatus(cfSubId);
            if (res.data.success) {
              saleData = res.data.data;
              if (saleData.status === 'active') break; // Webhook already fired
              if (saleData.status === 'cancelled') {
                setFailed(true);
                setErrorMsg('AutoPay mandate was cancelled or rejected. Please try again.');
                return;
              }
            }
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
          }

          if (saleData) {
            setPolicyId(saleData.policyId);
            setAutopay(true);
          }
          sessionStorage.removeItem('cb_checkout_data');
          sessionStorage.removeItem('cb_subscription_id');
        } catch (err: any) {
          // If still pending_autopay, show success anyway (webhook will activate)
          const subscriptionIdFallback = sessionStorage.getItem('cb_subscription_id') || cfSubId;
          try {
            const res = await subscriptionAPI.getStatus(subscriptionIdFallback);
            if (res.data.success) setPolicyId(res.data.data.policyId || '');
          } catch { /* ignore */ }
          setAutopay(true);
        } finally {
          setVerifying(false);
        }
      })();
      return;
    }

    // ── One-time order payment return ─────────────────────────────────────
    (async () => {
      try {
        const res = await publicAPI.verifyPayment({
          orderId:         cfOrderId,
          refCode:         refCode || saved.memberId || '',
          planId:          planId  || saved.planId   || '',
          customerName:    saved.customerName    || '',
          customerMobile:  saved.customerMobile  || '',
          customerEmail:   saved.customerEmail   || '',
          customerState:   saved.customerState   || '',
          customerDOB:     saved.customerDOB     || '',
          customerPAN:     saved.customerPAN     || '',
          nomineeName:     saved.nomineeName     || '',
          nomineeRelation: saved.nomineeRelation || '',
          enrollmentType:  saved.enrollmentType  || 'customer',
          sourceType:      'public_link',
          isPolicyForOther: saved.isPolicyForOther || false,
          policyHolderName: saved.policyHolderName || '',
          policyHolderDOB: saved.policyHolderDOB || '',
          policyHolderGender: saved.policyHolderGender || '',
          policyHolderMobile: saved.policyHolderMobile || '',
          policyHolderEmail: saved.policyHolderEmail || '',
          policyHolderAddress: saved.policyHolderAddress || '',
          policyHolderRelation: saved.policyHolderRelation || '',
        });

        if (res.data.success) {
          const { policyId: pid, newUser } = res.data.data;
          setPolicyId(pid);
          if (newUser) {
            setMemberId(newUser.memberId);
            setPassword(newUser.password);
          }
          // Clean up session storage
          sessionStorage.removeItem('cb_checkout_data');
        } else {
          setFailed(true);
          setErrorMsg(res.data.message || 'Verification failed');
        }
      } catch (err: any) {
        setFailed(true);
        setErrorMsg(err?.response?.data?.message || 'Could not verify payment. Please contact support.');
      } finally {
        setVerifying(false);
      }
    })();
  }, [cfOrderId, cfSubId]);

  // ── Loading / Verifying ──
  if (verifying) return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        Verifying your payment...
      </p>
    </div>
  );

  // ── Failed ──
  if (failed) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 max-w-md w-full bg-[#12151c] border border-red-500/20 rounded-[40px] p-10 text-center shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Payment Failed</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">{errorMsg}</p>
        <button
          onClick={() => router.back()}
          className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all"
        >
          Try Again
        </button>
        <p className="mt-6 text-[9px] font-bold text-white/20 uppercase tracking-widest">
          No amount has been deducted from your account.
        </p>
      </div>
    </div>
  );

  // ── Success ──
  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#12151c] border border-white/[0.02] rounded-[40px] p-10 text-center shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Payment Success!</h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
          Your enrollment has been completed and your wellness policy has been issued.
        </p>

        <div className="space-y-4 mb-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Policy ID</p>
            <p className="text-xl font-mono font-bold text-emerald-400">{policyId || 'CB-POL-XXXXXXXX'}</p>
          </div>

          {/* AutoPay Badge */}
          {autopay && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-3xl p-5 text-left flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-black text-purple-300 uppercase tracking-widest mb-1">AutoPay Activated ✓</p>
                <p className="text-[10px] font-bold text-purple-300/70 leading-relaxed uppercase">
                  Your policy will renew automatically every year. No manual payment needed!
                </p>
              </div>
            </div>
          )}

          {memberId && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 text-left">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Login Credentials</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Member ID</span>
                  <span className="text-sm text-white font-black">{memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Password</span>
                  <span className="text-sm text-white font-black">{password}</span>
                </div>
              </div>
              <p className="mt-4 text-[8px] font-bold text-blue-400/50 uppercase leading-relaxed italic">
                * Please use these to login to your CureBharat dashboard.
              </p>
            </div>
          )}

          {/* KYC Verification Alert */}
          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-3xl p-5 text-left flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/20 flex items-center justify-center shrink-0 border border-[#fbbf24]/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[11px] font-black text-[#fbbf24] uppercase tracking-widest mb-1.5">Identity Verification Required</h3>
              <p className="text-[10px] font-bold text-[#fbbf24]/70 leading-relaxed uppercase mb-2">
                Please login to your dashboard immediately to submit your KYC documents (Aadhaar, PAN, Bank Details) to activate your policy and unlock payouts.
              </p>
              <p className="text-[10px] font-black text-[#fbbf24] leading-relaxed uppercase">
                To login, use your registered mobile no. and default password 123456.
              </p>
              <Link href="/login" className="inline-block mt-3 px-4 py-2 bg-[#fbbf24] text-[#131241] rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                Login to Verify →
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <button
             onClick={() => window.print()}
             className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
           >
              Download Receipt
           </button>
           <Link
             href="/"
             className="block w-full py-4 rounded-2xl bg-emerald-500 text-[#0a0c10] font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
           >
              Back to Home
           </Link>
        </div>

        <p className="mt-10 text-[9px] font-bold text-white/20 uppercase tracking-widest">
           A confirmation SMS and Email has been sent to your registered contact.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
