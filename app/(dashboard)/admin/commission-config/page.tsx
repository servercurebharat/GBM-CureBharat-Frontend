'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';

export default function CommissionConfig() {
  const [saleAmount, setSaleAmount] = useState('10000');
  const [roleOrigin, setRoleOrigin] = useState('HCC - Direct Agent');
  const [gstExclusion, setGstExclusion] = useState(true);
  const [monthlyFinalization, setMonthlyFinalization] = useState(false);

  // Constants as per Figma
  const hccPercent = 40;
  const hcmPercent = 40;
  const hbaPercent = 40;
  const shPercent = 2;

  const hccPayout = (parseFloat(saleAmount) || 0) * (hccPercent / 100);
  const hcmPayout = hccPayout * (hcmPercent / 100);
  const hbaPayout = hcmPayout * (hbaPercent / 100);
  const shPayout = (parseFloat(saleAmount) || 0) * (shPercent / 100); // Mock SH logic

  const totalOutflow = hccPayout + hcmPayout + hbaPayout + shPayout;

  return (
    <DashboardLayout pageTitle="Commission Engine">
      <div className="space-y-6 pb-10">
        {/* Header Section */}
        <div className="bg-[#131241] rounded-[2rem] p-8 mb-8 border border-white/[0.03] shadow-xl text-white">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">CUREBHARAT / ADMIN / COMMISSION ENGINE</p>
                 <h1 className="text-3xl font-bold font-display">Commission Engine</h1>
              </div>
              <div className="space-y-10">
                 {/* New Interactive Sliders from Test Branch */}
                 <div className="flex gap-3 mb-8">
                    <button className="bg-white/5 px-6 py-3 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">Create New Version</button>
                    <button 
                      onClick={() => {/* handleSave from test branch */}}
                      className="bg-[#6029F1] px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#6029F1]/20 hover:brightness-110 transition-all"
                    >
                      Save Configuration
                    </button>
                 </div>
              </div>
              </div>
           </div>
           <p className="text-sm text-white/50 font-medium max-w-2xl leading-relaxed">Configure algorithmic payout structures, waterfall logic, and hierarchical overrides. Use the simulator to validate system outflow before deployment.</p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <SummaryCard label="HCC Direct" value="40%" sub="Applied to net sale amount" />
           <SummaryCard label="HCM Override" value="40%" sub="of HCC" sub2="Level 2 managerial override" />
           <SummaryCard label="HBA Override" value="40%" sub="of HCM" sub2="Regional hierarchy bonus" />
           <SummaryCard label="SH Leadership" value="2%" sub="Profit" sub2="Executive pool distribution" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left Column: Rule Controls & Simulator */}
           <div className="lg:col-span-8 space-y-6">
              {/* Rule Controls Panel */}
              <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
                 <div className="flex items-center gap-3 mb-8">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6029F1" strokeWidth="2.5"><path d="M12 20v-6M9 20v-10M15 20v-2M12 4V2M18 4V2M6 4V2"></path></svg>
                    <h3 className="text-lg font-bold font-display">Rule Controls Panel</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Inactive Income Handling</p>
                       <select className="w-full bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"><option>Roll-up to next level</option></select>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Cycle Selection</p>
                       <select className="w-full bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"><option>Monthly (Current)</option></select>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <Toggle label="GST Exclusion" sub="Calculate commissions after tax deduction" active={gstExclusion} onToggle={() => setGstExclusion(!gstExclusion)} />
                    <Toggle label="Monthly Finalization" sub="Lock config after 28th of every month" active={monthlyFinalization} onToggle={() => setMonthlyFinalization(!monthlyFinalization)} />
                 </div>
                 </div>
              </div>

              {/* Live Commission Simulator */}
              <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
                 <div className="flex items-center gap-3 mb-8">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                    <h3 className="text-lg font-bold font-display">Live Commission Simulator</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Sale Amount ($)</p>
                       <input 
                          type="text" 
                          value={saleAmount}
                          onChange={(e) => setSaleAmount(e.target.value)}
                          className="w-full bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                       />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Role Origin</p>
                       <select 
                          value={roleOrigin}
                          onChange={(e) => setRoleOrigin(e.target.value)}
                          className="w-full bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                       >
                          <option>HCC - Direct Agent</option>
                       </select>
                    </div>
                 </div>
                 <div className="bg-white/[0.01] rounded-2xl overflow-hidden border border-white/5">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                             <th className="px-8 py-4">Levels</th>
                             <th className="px-4 py-4">Formula</th>
                             <th className="px-8 py-4 text-right">Payout Amount</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm font-bold">
                          <SimRow level="HCC" formula="Sale * 40%" amount={hccPayout} color="text-[#60A5FA]" />
                          <SimRow level="HCM" formula="HCC * 40%" amount={hcmPayout} color="text-[#8b7cf8]" />
                          <SimRow level="HBA" formula="HCM * 40%" amount={hbaPayout} color="text-[#fbbf24]" />
                          <SimRow level="SH" formula="Net Profit * 2%" amount={shPayout} color="text-[#34d399]" />
                       </tbody>
                    </table>
                    <div className="bg-white/[0.03] px-8 py-6 flex justify-between items-center border-t border-white/5">
                       <span className="text-xs font-black text-white/40 uppercase tracking-widest">Total System Outflow</span>
                       <span className="text-lg font-black text-[#60A5FA]">${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Trends & Validation */}
           <div className="lg:col-span-4 space-y-6">
              {/* Commission Trend */}
              <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6029F1" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                       <h3 className="text-sm font-bold font-display uppercase tracking-widest">Commission Trend</h3>
                    </div>
                    <span className="text-[9px] font-black text-[#34d399] tracking-widest uppercase">+12.4% vs LY</span>
                 </div>
                 <div className="h-48 relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6029F1]/20 to-transparent rounded-xl" />
                    <svg className="w-full h-full text-[#6029F1]" viewBox="0 0 400 150" preserveAspectRatio="none">
                       <path d="M0,130 C50,120 100,100 150,90 C200,80 250,110 300,70 C350,30 400,60 400,60 L400,150 L0,150 Z" fill="currentColor" opacity="0.2" />
                       <path d="M0,130 C50,120 100,100 150,90 C200,80 250,110 300,70 C350,30 400,60 400,60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                 </div>
                 <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest mb-8">
                    <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl">
                       <p className="text-[9px] text-white/20 uppercase mb-1">AVG PAYOUT</p>
                       <p className="text-sm font-bold text-white">$4,290</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                       <p className="text-[9px] text-white/20 uppercase mb-1">EFFICIENCY RATIO</p>
                       <p className="text-sm font-bold text-[#34d399]">0.92</p>
                    </div>
                 </div>
              </div>

              {/* Validation Engine */}
              <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
                 <div className="flex items-center gap-3 mb-8">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                    <h3 className="text-sm font-bold font-display uppercase tracking-widest">Validation Engine</h3>
                 </div>
                 <div className="space-y-4 mb-8">
                    <ValidationItem icon="warning" color="text-[#f87171]" bg="bg-[#f87171]/5" title="Hierarchy Conflict Detected" sub="SH Leadership pool exceeds 2.5% threshold when combined with regional HBA override caps. Re-calibration recommended." />
                    <ValidationItem icon="check" color="text-[#34d399]" bg="bg-[#34d399]/5" title="GST Rules Validated" sub="Sequential validation of net sale calculation successful for all tax jurisdictions." />
                    <ValidationItem icon="info" color="text-white/40" bg="bg-white/5" title="Audit Trail Initialized" sub="All changes in this session are being staged for version 2.4.1 deployment." />
                 </div>
                 <button className="w-full bg-white/5 hover:bg-white/10 rounded-xl py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    Run Full Diagnosis
                 </button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, sub, sub2 }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03]">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-3xl font-bold font-display mb-2">{value} <span className="text-[10px] text-white/30 font-sans">{sub}</span></p>
       {sub2 && <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub2}</p>}
    </div>
  );
}

function Toggle({ label, sub, active, onToggle }: any) {
  return (
    <div className="flex justify-between items-center">
       <div>
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-white/30 font-bold">{sub}</p>
       </div>
       <button 
          onClick={onToggle}
          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#6029F1]' : 'bg-white/10'}`}
       >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
       </button>
    </div>
  );
}

function SimRow({ level, formula, amount, color }: any) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
       <td className={`px-8 py-4 font-black ${color}`}>{level}</td>
       <td className="px-4 py-4 text-white/40">{formula}</td>
       <td className="px-8 py-4 text-right text-white">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
    </tr>
  );
}

function ValidationItem({ icon, color, bg, title, sub }: any) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/[0.03] flex gap-4`}>
       <div className={`mt-0.5 ${color}`}>
          {icon === 'warning' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>}
          {icon === 'check' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
          {icon === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
       </div>
       <div>
          <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{title}</h4>
          <p className="text-[10px] text-white/40 font-medium leading-relaxed">{sub}</p>
       </div>
    </div>
  );
}
