'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { paymentAPI } from '@/lib/api';

// ── Inner component that reads search params ───────────────────────────────────
function PaymentStatusContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const orderId  = params.get('order_id');

  const [status,  setStatus]  = useState<'loading' | 'success' | 'failed'>('loading');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    paymentAPI
      .verifyPayment(orderId)
      .then(({ data }: any) => {
        if (data?.data?.orderStatus === 'PAID' || data?.data?.paymentStatus === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
        setDetails(data?.data);
      })
      .catch(() => setStatus('failed'));
  }, [orderId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {/* ── Loading ── */}
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">
            Verifying your payment...
          </p>
        </div>
      )}

      {/* ── Success ── */}
      {status === 'success' && (
        <div className="bg-[#131241] border border-emerald-500/20 rounded-[24px] p-10 flex flex-col items-center gap-6 max-w-md w-full shadow-2xl">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
              Payment Successful
            </p>
            <h2 className="text-2xl font-bold text-white">Your wallet is topped up!</h2>
            <p className="text-sm text-[#64748B] mt-2 font-medium">
              {details?.amount
                ? `₹${Number(details.amount).toLocaleString('en-IN')} has been added to your wallet.`
                : 'Amount has been credited to your wallet.'}
            </p>
          </div>

          {orderId && (
            <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 w-full text-center">
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Order ID</p>
              <p className="text-xs font-bold text-white mt-0.5 font-mono">{orderId}</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              id="payment-success-go-wallet"
              onClick={() => router.push('/sh/finance')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Go to Wallet
            </button>
            <button
              id="payment-success-go-home"
              onClick={() => router.push('/sh/dashboard')}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Failed ── */}
      {status === 'failed' && (
        <div className="bg-[#131241] border border-red-500/20 rounded-[24px] p-10 flex flex-col items-center gap-6 max-w-md w-full shadow-2xl">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
              Payment Failed
            </p>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-sm text-[#64748B] mt-2 font-medium">
              Your payment could not be processed. No amount was deducted from your bank.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              id="payment-failed-retry"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <button
              id="payment-failed-support"
              onClick={() => router.push('/sh/support')}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page wrapper with Suspense (required for useSearchParams in Next.js 13+) ──
export default function PaymentStatusPage() {
  return (
    <DashboardLayout pageTitle="Payment Status">
      <div className="space-y-2 mb-8">
        <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">
          CUREBHARAT / PAYMENT
        </p>
        <h2 className="text-2xl font-bold text-white tracking-tight">Payment Status</h2>
        <p className="text-sm text-[#64748B] font-medium opacity-70">
          We are verifying your transaction with Cashfree.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PaymentStatusContent />
      </Suspense>
    </DashboardLayout>
  );
}
