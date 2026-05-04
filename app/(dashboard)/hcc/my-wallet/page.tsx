'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WalletCard from '@/components/ui/WalletCard';
import { walletAPI } from '@/lib/api';
import { ILedgerEntry } from '@/types';
import { toast } from 'react-hot-toast';

import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function HccWalletPage() {
  return (
    <DashboardLayout pageTitle="Earnings & Wallet">
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / DASHBOARD / WALLET</p>
            <h1 className="text-3xl font-bold text-[#000000] font-display">Financial Ledger</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => window.location.href = '/hcc/withdrawal'}
              className="bg-[#6029F1] px-6 py-2.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#6029F1]/20"
             >
               Request Withdrawal
             </button>
          </div>
        </div>

        <WalletDashboard color="#6029F1" withdrawalPath="/hcc/withdrawal" />
      </div>
    </DashboardLayout>
  );
}
    </DashboardLayout>
  );
}

function BreakdownRow({ label, value, color, percentage }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-bold text-white">₹{value.toLocaleString('en-IN')}</p>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-1000`} 
            style={{ width: `${Math.max(percentage, 2)}%` }} 
          />
       </div>
    </div>
  );
}

function FilterButton({ active, children, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-white text-[#6029F1] shadow-sm' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {children}
    </button>
  );
}
