'use client';

import { Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const policyId = searchParams.get('policyId');

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#12151c] border border-white/[0.05] rounded-[40px] p-10 text-center shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Payment Success!</h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
          Your enrollment has been completed and your wellness policy has been issued.
        </p>

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 mb-10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Policy ID</p>
           <p className="text-xl font-mono font-bold text-emerald-400">{policyId || 'CB-POL-XXXXXXXX'}</p>
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
