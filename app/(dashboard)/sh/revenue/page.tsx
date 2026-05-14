'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletAPI, dashboardAPI } from '@/lib/api';
import { ILedgerEntry } from '@/types';

export default function ShRevenuePage() {
  const [ledger, setLedger] = useState<ILedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ledgerRes, summaryRes] = await Promise.all([
          walletAPI.getMyWallet(),
          dashboardAPI.getSummary()
        ]);

        if (ledgerRes.data.success) {
          setLedger(ledgerRes.data.data?.ledger || []);
        }
        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch revenue data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout pageTitle="State Revenue Analytics">
      <div className="space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / REVENUE</p>
          <h1 className="text-3xl font-bold text-white font-display">Revenue Analytics</h1>
          <p className="text-sm text-white/40 mt-1">Comprehensive overview of state-wide sales volume and leadership dividends.</p>
        </div>

        {/* Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#131241] border border-white/[0.07] p-8 rounded-[32px] shadow-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Total State Revenue</p>
              <h3 className="text-3xl font-display font-bold text-white">{formatCurrency(summary?.metrics?.totalRevenue || 0)}</h3>
              <p className="text-[10px] text-[#60A5FA] font-bold mt-2">Cumulative team performance</p>
           </div>
           <div className="bg-[#131241] border border-white/[0.07] p-8 rounded-[32px] shadow-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">MTD Revenue</p>
              <h3 className="text-3xl font-display font-bold text-[#60A5FA]">{formatCurrency(summary?.metrics?.mtdRevenue || 0)}</h3>
              <p className="text-[10px] text-white/30 font-bold mt-2">Month-to-date performance</p>
           </div>
           <div className="bg-[#131241] border border-white/[0.07] p-8 rounded-[32px] shadow-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Leadership Dividends</p>
              <h3 className="text-3xl font-display font-bold text-white">{formatCurrency((summary?.metrics?.totalRevenue || 0) * 0.02)}</h3>
              <p className="text-[10px] text-white/30 font-bold mt-2">Estimated 2% leadership share</p>
           </div>
        </div>

        {/* Detailed Ledger */}
        <div className="bg-[#131241] border border-white/[0.07] rounded-[32px] overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/[0.07] flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>
          </div>
          
          <div className="divide-y divide-white/[0.04]">
            {ledger.length === 0 && !loading ? (
              <div className="px-8 py-20 text-center opacity-30">
                <div className="text-5xl mb-4">📜</div>
                <p className="text-xs font-bold uppercase tracking-widest">No revenue records found</p>
                <p className="text-[10px] mt-1">Transaction history will appear here once sales are processed</p>
              </div>
            ) : (
              ledger.map((entry) => (
                <div key={entry._id} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                      entry.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {entry.type === 'withdrawal' ? 'W' : 'C'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{entry.description}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">
                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {entry.cycleMonth}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black tracking-tight ${entry.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{entry.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {loading && (
            <div className="p-20 text-center">
              <div className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Syncing Ledger...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
