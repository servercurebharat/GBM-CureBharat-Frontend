'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI } from '@/lib/api';
import ExportDropdown from '@/components/dashboard/ExportDropdown';

type Scope = 'FTD' | 'MTD';

export default function PerformanceReport() {
  const [scope, setScope] = useState<Scope>('FTD');
  
  // FTD State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ftdData, setFtdData] = useState<any>(null);
  
  // MTD State
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [mtdData, setMtdData] = useState<any>(null);
  const displayMonth = new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFTD = async () => {
      setLoading(true);
      try {
        const res = await salesAPI.getFTDAnalytics(date);
        if (res.data.success) setFtdData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch FTD', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMTD = async () => {
      setLoading(true);
      try {
        const res = await salesAPI.getMTDAnalytics(month);
        if (res.data.success) setMtdData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch MTD', err);
      } finally {
        setLoading(false);
      }
    };

    if (scope === 'FTD') {
      fetchFTD();
    } else {
      fetchMTD();
    }
  }, [scope, date, month]);

  // Data Preparation for Export
  const getExportData = () => {
    if (scope === 'FTD' && ftdData) {
      const headers = ['Seller Name', 'Member ID', 'Policies Sold', 'Revenue'];
      const rows = ftdData.topPerformers?.hcc?.map((row: any) => [
        row.name,
        row.memberId,
        row.sales,
        `Rs. ${row.revenue.toLocaleString()}`
      ]) || [];
      return { headers, rows, title: `Daily Performance Report - ${date}`, fileName: `FTD_Report_${date}` };
    } else if (scope === 'MTD' && mtdData) {
      const headers = ['Territory', 'Policies Sold', 'Revenue Generated'];
      const rows = mtdData.stateBreakdown?.map((s: any) => [
        s._id || 'Unknown',
        s.sales,
        `Rs. ${s.revenue.toLocaleString()}`
      ]) || [];
      return { headers, rows, title: `Monthly Performance Report - ${displayMonth}`, fileName: `MTD_Report_${month}` };
    }
    return { headers: [], rows: [], title: '', fileName: '' };
  };

  const exportConfig = getExportData();

  return (
    <DashboardLayout pageTitle="FTD + MTD Performance Report">
      <div className="space-y-8 pb-20">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-[#10b981] uppercase tracking-widest mb-1">
              REPORTS / {scope === 'FTD' ? 'FOR THE DAY (FTD)' : 'MONTH TO DATE (MTD)'}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 font-display">
              {scope === 'FTD' ? 'Daily Performance Pulse' : `${displayMonth} Analytics`}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             {/* Scope Toggle */}
             <div className="flex bg-slate-50 rounded-xl p-1">
               <button 
                 onClick={() => setScope('FTD')}
                 className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${scope === 'FTD' ? 'bg-white shadow text-[#10b981]' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Transaction Date
               </button>
               <button 
                 onClick={() => setScope('MTD')}
                 className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${scope === 'MTD' ? 'bg-white shadow text-[#10b981]' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Month
               </button>
             </div>

             <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

             {/* Dynamic Date/Month Picker */}
             {scope === 'FTD' ? (
               <input 
                 type="date" 
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="bg-transparent border-none px-4 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
               />
             ) : (
               <input 
                 type="month" 
                 value={month}
                 onChange={(e) => setMonth(e.target.value)}
                 className="bg-transparent border-none px-4 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
               />
             )}

             <ExportDropdown {...exportConfig} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4" />
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Report Data...</div>
          </div>
        )}

        {/* Conditional Rendering based on Scope */}
        {!loading && scope === 'FTD' && ftdData && <FTDView data={ftdData} />}
        {!loading && scope === 'MTD' && mtdData && <MTDView data={mtdData} />}

      </div>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------
// FTD UI COMPONENTS
// ---------------------------------------------------------
function FTDView({ data }: { data: any }) {
  const { metrics, hourlyVelocity, topPerformers } = data;
  
  // Format currency - values are stored in rupees directly
  const formatCur = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Find max hourly sales to scale the chart
  const maxHourlySales = Math.max(...hourlyVelocity.map((h: any) => h.sales), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* FTD Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportMetric label="Total Revenue" value={formatCur(metrics?.totalRevenue || 0)} change="Today's Volume" color="emerald" />
          <ReportMetric label="Policies Sold" value={(metrics?.totalSales || 0).toLocaleString()} change="Total Transactions" color="blue" />
          <ReportMetric label="Avg Ticket Size" value={metrics?.totalSales > 0 ? formatCur(metrics.totalRevenue / metrics.totalSales) : '₹0'} change="Per policy avg" color="amber" />
          <ReportMetric label="Active Sellers" value={(topPerformers?.hcc?.length || 0).toString()} change="Members logged sales" color="slate" />
      </div>

      {/* Hourly Trend Chart */}
      <div className="bg-[#131241] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-3xl -mr-48 -mt-48" />
          <div className="relative z-10 flex items-center justify-between mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest">Intraday Sales Velocity</h3>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Policies Sold</div>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-1 sm:gap-2 px-2 border-b border-white/10 pb-8 relative">
            {/* Y-Axis Grid Lines (Visual only) */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5" />
            
            {hourlyVelocity.map((h: any) => {
              const heightPct = (h.sales / maxHourlySales) * 100;
              const isActive = h.hour >= 6 && h.hour <= 23;
              if (!isActive && h.sales === 0) return null;

              return (
                <div key={h.hour} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                    <div 
                      className="w-full bg-[#10b981] rounded-t-sm transition-all duration-500 hover:brightness-125 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] group relative" 
                      style={{ 
                        height: h.sales > 0 ? `${Math.max(heightPct, 5)}%` : '2px', 
                        opacity: h.sales > 0 ? 1 : 0.1 
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-[#131241] text-[9px] font-black px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-2xl pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                         <div className="text-[#10b981] mb-0.5">{h.hour}:00</div>
                         {h.sales} Policies • {formatCur(h.revenue)}
                      </div>
                    </div>
                    <span className="absolute -bottom-7 text-[8px] font-black text-white/30 uppercase tracking-tighter">
                      {h.hour}H
                    </span>
                </div>
              );
            })}
          </div>
          <div className="h-8" /> {/* Spacer for absolute labels */}
      </div>

      {/* Today's High Performers */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Daily Contributions (HCC)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-4">Seller</th>
                      <th className="px-4 py-4 text-center">Policies Today</th>
                      <th className="px-4 py-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {topPerformers?.hcc?.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No sales recorded today</td></tr>
                  ) : topPerformers?.hcc?.map((row: any, i: number) => (
                    <tr key={row._id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black uppercase text-white flex-shrink-0" style={{ background: `hsl(${(i * 47 + 210) % 360}, 70%, 50%)` }}>{row.name ? row.name[0] : '?'}</div>
                            <div>
                              <div className="font-bold text-slate-900">{row.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.memberId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="bg-emerald-100 text-emerald-700 font-black text-sm px-3 py-1 rounded-full">{row.sales}</span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-slate-900">{formatCur(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// MTD UI COMPONENTS
// ---------------------------------------------------------
function MTDView({ data }: { data: any }) {
  const { metrics, stateBreakdown, newMembersCount } = data;
  
  const formatCur = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Example Target
  const targetPaise = 2000000000; // 2 Cr
  const targetPct = Math.min(((metrics?.totalRevenue || 0) / targetPaise) * 100, 100);

  // For State breakdown colors
  const stateColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-red-500', 'bg-purple-500'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* MTD Monthly Progress */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-1 space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Monthly Sales Target</h3>
                      <span className="text-sm font-black text-[#10b981]">{formatCur(metrics?.totalRevenue || 0)} / ₹2 Cr</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                      <div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full shadow-lg transition-all duration-1000" style={{ width: `${targetPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Policies</p>
                      <p className="text-xl font-bold text-emerald-600">{(metrics?.totalSales || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Members</p>
                      <p className="text-xl font-bold text-slate-900">{(newMembersCount || 0).toLocaleString()}</p>
                  </div>
                </div>
            </div>
            <div className="w-full md:w-64 h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-dashed border-slate-200">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Run Rate</p>
                  <p className="text-2xl font-black text-slate-900">{targetPct.toFixed(1)}%</p>
                  <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">of Monthly Target</p>
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
                {stateBreakdown.length === 0 ? (
                   <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No territory data available for this month</div>
                ) : stateBreakdown.map((s: any, i: number) => {
                   // Calculate percentage relative to the top state
                   const topRevenue = stateBreakdown[0].revenue;
                   return (
                     <StateProgress 
                       key={s._id || 'Unknown'} 
                       state={s._id || 'Unassigned'} 
                       revenue={s.revenue} 
                       target={topRevenue} 
                       color={stateColors[i % stateColors.length]} 
                       formatCur={formatCur}
                     />
                   );
                })}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131241] rounded-[2.5rem] p-8 text-white shadow-xl">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 text-center">Month Top Performers</h3>
                <div className="space-y-6">
                  {stateBreakdown.slice(0,3).map((s: any, i: number) => (
                    <RankStat key={i} label={s._id || 'Unknown Region'} count={`${s.sales} sales`} color={`bg-[#10b981]`} />
                  ))}
                  {stateBreakdown.length === 0 && <div className="text-center text-xs text-white/40">No data</div>}
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Generated Volume MTD</h3>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black text-slate-900 mb-1">{formatCur(metrics?.totalRevenue || 0)}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Gross Sales</div>
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-6" />
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 text-center leading-relaxed">Revenue calculation is synchronized with real-time sales feed.</p>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SHARED UTILITY COMPONENTS
// ---------------------------------------------------------
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
       <h4 className="text-2xl font-black font-display mb-1 group-hover:tracking-tight transition-all truncate">{value}</h4>
       <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{change}</p>
    </div>
  );
}

function StateProgress({ state, revenue, target, color, formatCur }: any) {
  const pct = Math.min((parseFloat(revenue) / parseFloat(target)) * 100, 100);
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-900">{state}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase">{formatCur(revenue)}</span>
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
