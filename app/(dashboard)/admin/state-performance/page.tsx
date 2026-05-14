'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';

export default function AdminStatePerformancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'revenue' | 'members'>('revenue');

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
    return [...data].sort((a, b) => b[viewMode] - a[viewMode]);
  }, [data, viewMode]);

  const totals = useMemo(() => {
    return {
      revenue: data.reduce((acc, curr) => acc + curr.revenue, 0),
      members: data.reduce((acc, curr) => acc + curr.members, 0),
      activeStates: data.length,
      topState: sortedData[0]?.code || '--'
    };
  }, [data, sortedData]);

  const handleMapReport = () => {
    alert("Map Report feature is coming soon in the next update!");
  };

  return (
    <DashboardLayout pageTitle="State Performance">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / ADMIN / STATE PERFORMANCE</p>
              <h1 className="text-3xl font-bold text-white font-display">Regional Analytics</h1>
           </div>
           <button 
             onClick={handleMapReport}
             className="bg-[#6029F1] px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#6029F1]/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              View Map Report
           </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <StateStat label="TOP STATE" value={totals.topState} sub={`${sortedData[0]?.state || 'N/A'} Lead`} icon="trophy" color="text-[#fbbf24]" />
           <StateStat label="TOTAL REVENUE" value={formatCur(totals.revenue)} sub="Across all states" icon="revenue" color="text-[#34d399]" />
           <StateStat label="TOTAL MEMBERS" value={totals.members.toLocaleString()} sub="Pan-India Network" icon="growth" color="text-[#60A5FA]" />
           <StateStat label="ACTIVE STATES" value={totals.activeStates} sub="Regional Coverage" icon="map" color="text-[#6029F1]" />
        </div>

        {/* Leaderboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-[2rem] animate-pulse" />)
           ) : sortedData.slice(0, 3).map((s, idx) => (
              <div key={s.code} className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03] relative group overflow-hidden">
                 <div className="absolute top-2 right-4 text-7xl font-display font-black text-white/[0.03] italic">#{idx + 1}</div>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-display font-black text-[#60A5FA]">{s.code}</div>
                    <div>
                       <h3 className="text-xl font-bold font-display">{s.state}</h3>
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">SH: {s.topSH}</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-3xl font-bold font-display text-white">{formatCur(s.revenue)}</p>
                       <p className="text-[10px] font-black text-[#34d399] uppercase tracking-widest">{s.growth} GROWTH</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-white/60">{s.members}</p>
                       <p className="text-[9px] font-black text-white/20 uppercase">Members</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Full Performance Table */}
        <div className="bg-[#131241] rounded-[2rem] shadow-xl border border-white/[0.03] overflow-hidden">
           <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold font-display text-white">Full State Performance</h3>
              <div className="flex bg-black/40 p-1 rounded-xl">
                 <button 
                   onClick={() => setViewMode('revenue')}
                   className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'revenue' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                 >REVENUE</button>
                 <button 
                   onClick={() => setViewMode('members')}
                   className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'members' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                 >MEMBERS</button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                       <th className="px-8 py-5">STATE / SH</th>
                       <th className="px-4 py-5 text-center">MEMBERS</th>
                       <th className="px-4 py-5 text-center">SALES</th>
                       <th className="px-4 py-5">{viewMode === 'revenue' ? 'REVENUE SHARE' : 'MEMBER SHARE'}</th>
                       <th className="px-8 py-5 text-right">GROWTH</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       Array(5).fill(0).map((_, i) => (
                         <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-8 py-6"><div className="h-6 bg-white/5 rounded-lg w-full" /></td>
                         </tr>
                       ))
                    ) : sortedData.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest">No state data found</td>
                       </tr>
                    ) : sortedData.map((s, idx) => (
                       <tr key={s.code} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">{s.code}</div>
                                <div>
                                   <div className="text-sm font-bold text-white">{s.state}</div>
                                   <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">SH: {s.topSH}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-6 text-center text-sm font-bold text-white/60">{s.members}</td>
                          <td className="px-4 py-6 text-center text-sm font-bold text-white/60">{s.sales}</td>
                          <td className="px-4 py-6">
                             <div className="flex items-center gap-4">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-[#6029F1] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (s[viewMode] / (totals[viewMode] || 1)) * 100)}%` }} />
                                </div>
                                <span className="text-sm font-black text-white">
                                  {viewMode === 'revenue' ? formatCur(s.revenue) : s.members.toLocaleString()}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className={`text-xs font-black ${s.growth.includes('-') ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{s.growth}</span>
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
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-3xl font-bold font-display mb-2">{value}</p>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
       <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 ${color}`}>
          {icon === 'trophy' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7"></path><path d="M12 2v7"></path><rect x="6" y="9" width="12" height="6" rx="2"></rect><path d="M10 15l-2 7 4-2 4 2-2-7"></path></svg>}
          {icon === 'revenue' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
          {icon === 'growth' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
          {icon === 'map' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>}
       </div>
    </div>
  );
}
