'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import CountUp from '@/components/dashboard/CountUp';

export default function AdminStatePerformancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'revenue' | 'members'>('revenue');
  const [filterState, setFilterState] = useState('All States');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await adminAPI.getStatePerformance();
        if (res.data.success) {
          setData(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch state performance', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCur = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  const sortedData = useMemo(() => {
    let result = [...data];
    if (filterState !== 'All States') {
      result = result.filter(s => s.state.toLowerCase() === filterState.toLowerCase());
    }
    return result.sort((a, b) => b[viewMode] - a[viewMode]);
  }, [data, viewMode, filterState]);

  const totals = useMemo(() => {
    return {
      revenue: sortedData.reduce((acc, curr) => acc + curr.revenue, 0),
      members: sortedData.reduce((acc, curr) => acc + curr.members, 0),
      activeStates: sortedData.length,
      topState: sortedData[0]?.code || '--'
    };
  }, [sortedData]);



  return (
    <DashboardLayout pageTitle="State Performance">
      <div className="space-y-8 pb-20">
        {/* Header Area */}
        <div className="bg-[#131241] rounded-[2rem] p-8 shadow-xl border border-white/[0.03] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-3xl -mr-48 -mt-48 group-hover:bg-[#10b981]/10 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] mb-2">ANALYTICS / REGIONAL PERFORMANCE</p>
                  <h1 className="text-3xl font-black text-white tracking-tight font-display">Regional Analytics</h1>
                  <p className="text-xs text-white/40 mt-2 max-w-3xl leading-relaxed">
                    Real-time performance tracking across all active Indian states. Monitor revenue distribution, 
                    member growth, and regional leadership metrics.
                  </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                  <select 
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="w-full bg-[#1a195e] border border-white/10 rounded-xl px-6 py-3.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#10b981] min-w-[200px] cursor-pointer appearance-none shadow-xl"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option value="All States" className="bg-[#131241] text-white font-medium">🌍 All States Overview</option>
                    {[...Array.from(new Set(data.map(d => d.state)))].sort().map(state => (
                      <option key={state as string} value={state as string} className="bg-[#131241] text-white font-medium">{state as string}</option>
                    ))}
                  </select>
              </div>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StateStat label="TOP STATE" value={totals.topState} sub={`${sortedData[0]?.state || 'N/A'} Lead`} icon="trophy" color="text-amber-400" />
           <StateStat label="TOTAL REVENUE" value={formatCur(totals.revenue)} sub="Across Pan-India" icon="revenue" color="text-emerald-400" />
           <StateStat label="TOTAL MEMBERS" value={totals.members.toLocaleString()} sub="Active Network" icon="growth" color="text-blue-400" />
           <StateStat label="ACTIVE STATES" value={totals.activeStates} sub="Regional Reach" icon="map" color="text-[#10b981]" />
        </div>

        {/* Leaderboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-56 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />)
           ) : sortedData.slice(0, 3).map((s, idx) => (
              <div key={s.code} className="bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/[0.03] relative group overflow-hidden transition-all hover:border-[#10b981]/30">
                 <div className="absolute top-2 right-6 text-[120px] font-display font-black text-white/[0.02] italic tracking-tighter select-none">#{idx + 1}</div>
                 <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-xl font-display font-black text-[#10b981] shadow-lg">{s.code}</div>
                    <div>
                       <h3 className="text-2xl font-black font-display tracking-tight group-hover:text-[#10b981] transition-colors">{s.state}</h3>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">SH: {s.topSH}</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-end relative z-10">
                    <div>
                       <p className="text-3xl font-black font-display text-white tracking-tighter">{formatCur(s.revenue)}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{s.growth} GROWTH</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-white/60 tracking-tight">{s.members.toLocaleString()}</p>
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Members</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Full Performance Table */}
        <div className="bg-[#131241] rounded-[2.5rem] shadow-2xl border border-white/[0.03] overflow-hidden">
           <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
              <h3 className="text-xl font-black font-display text-white flex items-center gap-3">
                 <div className="w-2 h-6 rounded-full bg-[#10b981]" />
                 Full Regional Ledger
              </h3>
              <div className="flex bg-black/30 p-1.5 rounded-[14px] border border-white/5">
                 <button 
                   onClick={() => setViewMode('revenue')}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'revenue' ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' : 'text-white/30 hover:text-white'}`}
                 >REVENUE</button>
                 <button 
                   onClick={() => setViewMode('members')}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'members' ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' : 'text-white/30 hover:text-white'}`}
                 >MEMBERS</button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                       <th className="px-10 py-6">STATE / LEADERSHIP</th>
                       <th className="px-6 py-6 text-center">NETWORK SIZE</th>
                       <th className="px-6 py-6 text-center">TOTAL SALES</th>
                       <th className="px-6 py-6">{viewMode === 'revenue' ? 'REVENUE CONTRIBUTION' : 'NETWORK SHARE'}</th>
                       <th className="px-10 py-6 text-right">MOM GROWTH</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       Array(5).fill(0).map((_, i) => (
                         <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-10 py-8"><div className="h-6 bg-white/5 rounded-xl w-full" /></td>
                         </tr>
                       ))
                    ) : sortedData.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="px-10 py-32 text-center text-white/10 font-black uppercase tracking-[0.3em] text-xs">No active regional data detected</td>
                       </tr>
                    ) : sortedData.map((s, idx) => (
                       <tr key={s.code} className="hover:bg-white/[0.04] transition-colors group">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className="w-11 h-11 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] group-hover:border-[#10b981]/20 transition-all">{s.code}</div>
                                <div>
                                   <div className="text-sm font-black text-white uppercase tracking-tight">{s.state}</div>
                                   <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">SH: {s.topSH}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-8 text-center text-sm font-black text-white/60 tabular-nums">{s.members.toLocaleString()}</td>
                          <td className="px-6 py-8 text-center text-sm font-black text-white/60 tabular-nums">{s.sales.toLocaleString()}</td>
                          <td className="px-6 py-8 min-w-[240px]">
                             <div className="flex items-center gap-6">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${Math.min(100, (s[viewMode] / (totals[viewMode] || 1)) * 100)}%` }} />
                                </div>
                                <span className="text-sm font-black text-white tabular-nums">
                                  {viewMode === 'revenue' ? formatCur(s.revenue) : s.members.toLocaleString()}
                                </span>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all duration-300 ${
                               s.growth.includes('-') 
                               ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' 
                               : 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                             }`}>
                               {s.growth}
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

function StateStat({ label, value, sub, icon, color }: any) {
  // Try to parse numeric value from string or number
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d.]/g, '')) * (value.includes('L') ? 100000 : value.includes('Cr') ? 10000000 : 1)
    : value;

  return (
    <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-2xl border border-white/[0.03] relative group overflow-hidden transition-all hover:border-[#10b981]/30">
       <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#10b981]/10 transition-all duration-700" />
       <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{label}</p>
             <p className="text-3xl font-black font-display text-white mb-2">
                {typeof value === 'string' && (value.includes('₹') || value.includes('Cr') || value.includes('L')) ? (
                  <CountUp 
                    end={numericValue} 
                    formatter={(val) => {
                      if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
                      if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
                      return `₹ ${val.toLocaleString('en-IN')}`;
                    }} 
                  />
                ) : typeof value === 'number' ? (
                  <CountUp end={value} />
                ) : value}
             </p>
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color} shadow-lg border border-white/5 group-hover:scale-110 transition-transform`}>
             {icon === 'trophy' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9V2h12v7"></path><path d="M12 2v7"></path><rect x="6" y="9" width="12" height="6" rx="2"></rect><path d="M10 15l-2 7 4-2 4 2-2-7"></path></svg>}
             {icon === 'revenue' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>}
             {icon === 'growth' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
             {icon === 'map' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>}
          </div>
       </div>
    </div>
  );
}
