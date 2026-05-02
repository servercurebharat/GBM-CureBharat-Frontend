'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MTDReport() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout pageTitle="MTD Cumulative Report">
      <div className="space-y-8 pb-20">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">REPORTS / MONTH TO DATE (MTD)</p>
            <h1 className="text-3xl font-bold text-slate-900 font-display">{currentMonth} Analytics</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="bg-white border border-slate-200 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Select Month
             </button>
             <button className="bg-[#131241] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download CSV
             </button>
          </div>
        </div>

        {/* MTD Monthly Progress */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="flex-1 space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-3">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Monthly Sales Target</h3>
                       <span className="text-sm font-black text-[#60A5FA]">₹1.2 Cr / ₹2 Cr</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                       <div className="h-full bg-gradient-to-r from-[#60A5FA] to-[#3b82f6] rounded-full shadow-lg" style={{ width: '60%' }} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Growth</p>
                       <p className="text-xl font-bold text-emerald-600">+24.5%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Members</p>
                       <p className="text-xl font-bold text-slate-900">1,248</p>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-64 h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-dashed border-slate-200">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection</p>
                    <p className="text-2xl font-black text-slate-900">₹1.84 Cr</p>
                    <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">92% of target</p>
                 </div>
              </div>
           </div>
        </div>

        {/* State Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Territory Growth Comparison</h3>
              </div>
              <div className="p-8 space-y-8">
                 <StateProgress state="Maharashtra" revenue="42.5" target="50" color="bg-blue-500" />
                 <StateProgress state="Delhi NCR" revenue="38.2" target="40" color="bg-emerald-500" />
                 <StateProgress state="Gujarat" revenue="24.8" target="35" color="bg-amber-500" />
                 <StateProgress state="Karnataka" revenue="19.4" target="25" color="bg-indigo-500" />
                 <StateProgress state="Uttar Pradesh" revenue="15.1" target="30" color="bg-red-500" />
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#131241] rounded-[2.5rem] p-8 text-white shadow-xl">
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 text-center">Rank Promotion Pulse</h3>
                 <div className="space-y-6">
                    <RankStat label="HBA → SH" count={12} color="bg-[#60A5FA]" />
                    <RankStat label="HCM → HBA" count={45} color="bg-[#3b82f6]" />
                    <RankStat label="HCC → HCM" count={128} color="bg-emerald-400" />
                 </div>
                 <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">View All Promotion Alerts</button>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Commission Payout MTD</h3>
                 <div className="flex flex-col items-center">
                    <div className="text-3xl font-black text-slate-900 mb-1">₹42.84L</div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Finalized Ledger</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-6" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 text-center leading-relaxed">Commission calculation is synchronized with real-time sales feed.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StateProgress({ state, revenue, target, color }: any) {
  const pct = Math.min((parseFloat(revenue) / parseFloat(target)) * 100, 100);
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-900">{state}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase">₹{revenue}L / ₹{target}L</span>
       </div>
       <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
       </div>
    </div>
  );
}

function RankStat({ label, count, color }: any) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-xs font-bold text-white/80">{label}</span>
       </div>
       <span className="text-sm font-black">{count}</span>
    </div>
  );
}
