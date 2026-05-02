'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FTDReport() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <DashboardLayout pageTitle="FTD Performance Report">
      <div className="space-y-8 pb-20">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">REPORTS / FOR THE DAY (FTD)</p>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Daily Performance Pulse</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <input 
               type="date" 
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#60A5FA] shadow-sm"
             />
             <button className="bg-[#131241] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#131241]/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export PDF
             </button>
          </div>
        </div>

        {/* FTD Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <ReportMetric label="New Registrations" value="142" change="+12% from yesterday" color="blue" />
           <ReportMetric label="Daily Revenue" value="₹8,42,000" change="+₹45k vs avg" color="emerald" />
           <ReportMetric label="Policy Renewals" value="28" change="On track" color="amber" />
           <ReportMetric label="Support Queries" value="45" change="12 pending" color="slate" />
        </div>

        {/* Hourly Trend Chart (Mock) */}
        <div className="bg-[#131241] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#60A5FA]/5 blur-3xl -mr-48 -mt-48" />
           <div className="relative z-10 flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-widest">Intraday Sales Velocity</h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-[#60A5FA]" /> Sales</div>
                 <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-white/20" /> Projected</div>
              </div>
           </div>
           <div className="h-64 flex items-end gap-2 relative">
              {[20, 35, 45, 60, 55, 80, 95, 75, 40, 30, 25, 15].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                   <div className="w-full bg-[#60A5FA]/20 rounded-t-lg transition-all hover:bg-[#60A5FA]/40 group relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#131241] text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{(h*1000).toLocaleString()}</div>
                   </div>
                   <span className="text-[8px] font-bold text-white/30 uppercase">{9 + i} AM</span>
                </div>
              ))}
           </div>
        </div>

        {/* Today's High Performers */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
           <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Daily Contributions</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                       <th className="px-8 py-4">State Head</th>
                       <th className="px-4 py-4 text-center">Sales Today</th>
                       <th className="px-4 py-4 text-center">Revenue Today</th>
                       <th className="px-8 py-4 text-right">Team Activity</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm font-medium">
                    {[
                      { name: 'Vikram Singh', sales: 42, revenue: 840000, activity: '95%' },
                      { name: 'Ananya Sharma', sales: 38, revenue: 760000, activity: '88%' },
                      { name: 'Rajesh Kumar', sales: 31, revenue: 620000, activity: '82%' },
                      { name: 'Priya Patel', sales: 25, revenue: 500000, activity: '91%' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                         <td className="px-8 py-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">{row.name[0]}</div>
                            <span className="font-bold text-slate-900">{row.name}</span>
                         </td>
                         <td className="px-4 py-5 text-center text-emerald-600 font-bold">{row.sales}</td>
                         <td className="px-4 py-5 text-center font-black">₹{row.revenue.toLocaleString()}</td>
                         <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#60A5FA]" style={{ width: row.activity }} /></div>
                               <span className="text-[10px] font-bold text-slate-400">{row.activity}</span>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReportMetric({ label, value, change, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 ${colors[color]} transition-all hover:scale-105 cursor-pointer group`}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <h4 className="text-2xl font-black font-display mb-1 group-hover:tracking-tight transition-all">{value}</h4>
       <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{change}</p>
    </div>
  );
}
