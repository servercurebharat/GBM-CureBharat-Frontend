'use client';

import { useState } from 'react';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: any) => Promise<{ error?: { message: string }; redirect?: boolean }>;
      subscriptionsCheckout: (options: any) => Promise<{ error?: { message: string }; redirect?: boolean }>;
    };
  }
}

interface PaymentButtonProps {
  amount: number;          // in ₹ (rupees)
  purpose?: string;        // e.g. 'wallet_topup', 'plan_enrollment'
  label?: string;          // button label override
  className?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export default function PaymentButton({
  amount,
  purpose = 'wallet_topup',
  label,
  className = '',
  onSuccess,
  onFailure,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!amount || amount < 1) {
      toast.error('Invalid payment amount');
      return;
    }

    setLoading(true);

    try {
      // ── Step 1: Create order on backend ─────────────────────────────────────
      const { data } = await paymentAPI.createOrder({ 
        amount, 
        purpose,
        returnUrl: `${window.location.origin}/api/payment-return?path=/payment/status` 
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      const { paymentSessionId } = data.data as { paymentSessionId: string; orderId: string };

      // ── Step 2: Ensure Cashfree SDK is loaded ────────────────────────────────
      if (typeof window.Cashfree === 'undefined') {
        throw new Error('Cashfree SDK not loaded. Please refresh and try again.');
      }

      const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
      const cashfree = window.Cashfree({ mode });

      // ── Step 3: Open Cashfree checkout ───────────────────────────────────────
      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',   // '_self' = same tab | '_modal' = popup
      });

      if (result?.error) {
        toast.error(result.error.message || 'Payment failed');
        onFailure?.();
      }
      // On success, Cashfree redirects to CASHFREE_RETURN_URL (/payment/status)
    } catch (err: any) {
      console.error('[PaymentButton] Error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Payment failed');
      onFailure?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      id="cashfree-pay-btn"
      className={`
        relative inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-xl font-bold text-sm
        bg-gradient-to-r from-[#1d4ed8] to-[#2563eb]
        hover:from-[#2563eb] hover:to-[#3b82f6]
        text-white shadow-lg shadow-blue-500/20
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-200 active:scale-95
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>{label || `Pay ₹${amount.toLocaleString('en-IN')}`}</span>
        </>
      )}
    </button>
  );
}
