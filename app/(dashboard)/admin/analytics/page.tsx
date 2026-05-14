'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI } from '@/lib/api';

interface StatBoxProps {
  label: string;
  value: string;
  sub: string;
  color: string;
}

function StatBox({ label, value, sub, color }: StatBoxProps) {
  return (
    <div className="bg-[#131241] border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-20" style={{ backgroundColor: color }} />
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{sub}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        const res = await salesAPI.getMTDAnalytics(month);
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Analytics fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const roles = [
    { key: 'sh', label: 'STATE HEADS (SH)' },
    { key: 'hba', label: 'HB ASSOCIATES (HBA)' },
    { key: 'hcm', label: 'HC MANAGERS (HCM)' },
    { key: 'hcc', label: 'HC CONSULTANTS (HCC)' }
  ];

  return (
    <DashboardLayout pageTitle="Platform Analytics">
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">Real-time Performance</h2>
            <p className="text-sm text-white/40 mt-1 font-medium">Monthly revenue, network growth, and top leaderboards</p>
          </div>
          <div className="bg-[#131241] px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black text-[#60A5FA] uppercase tracking-widest">
            Cycle: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatBox 
            label="Total Revenue" 
            value={analytics ? `₹${(analytics.metrics.totalRevenue / 100).toLocaleString()}` : '₹0'} 
            sub="Current Month" 
            color="#8b7cf8" 
          />
          <StatBox 
            label="Total Sales" 
            value={analytics ? String(analytics.metrics.totalSales) : '0'} 
            sub="Policies Issued" 
            color="#60a5fa" 
          />
          <StatBox 
            label="New Joins" 
            value={analytics ? String(analytics.newMembersCount) : '0'} 
            sub="Network Growth" 
            color="#34d399" 
          />
          <StatBox 
            label="Active States" 
            value={analytics ? String(analytics.stateBreakdown.length) : '0'} 
            sub="Geographic Spread" 
            color="#fbbf24" 
          />
        </div>

        {/* Leaderboards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div key={role.key} className="bg-[#131241] rounded-[2rem] border border-white/[0.05] shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-display text-sm font-black text-white uppercase tracking-[0.2em]">{role.label} TOP 10</h3>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">By Revenue</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                      <th className="px-8 py-4">RANK</th>
                      <th className="px-4 py-4">MEMBER</th>
                      {role.key === 'hcc' && <th className="px-4 py-4">RECRUITER</th>}
                      <th className="px-4 py-4">SALES</th>
                      <th className="px-8 py-4 text-right">REVENUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-8 py-4"><div className="h-4 bg-white/5 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : analytics?.topPerformers[role.key]?.length > 0 ? (
                      analytics.topPerformers[role.key].map((perf: any, index: number) => (
                        <tr key={perf._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-4">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${
                              index === 0 ? 'bg-[#fbbf24] text-[#131241]' : 
                              index === 1 ? 'bg-[#94a3b8] text-[#131241]' : 
                              index === 2 ? 'bg-[#92400e] text-white' : 'bg-white/5 text-white/40'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-xs font-bold text-white">{perf.name}</div>
                              <div className="text-[9px] text-white/30 uppercase font-bold tracking-tight">#{perf.memberId}</div>
                            </div>
                          </td>
                          {role.key === 'hcc' && (
                            <td className="px-4 py-4">
                              <div className="text-[10px] font-bold text-[#60A5FA]">{perf.recruiterName || 'System'}</div>
                              <div className="text-[8px] text-white/20 font-medium">#{perf.recruiterMemberId || 'N/A'}</div>
                            </td>
                          )}
                          <td className="px-4 py-4 text-[10px] font-black text-white/60">{perf.sales}</td>
                          <td className="px-8 py-4 text-right text-xs font-black text-white">₹{(perf.revenue / 100).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-white/20 text-[10px] font-black uppercase tracking-widest">No data for this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* State Breakdown */}
        <div className="bg-[#131241] rounded-[2rem] border border-white/[0.05] shadow-2xl overflow-hidden">
           <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01]">
              <h3 className="font-display text-sm font-black text-white uppercase tracking-[0.2em]">Geographic Performance Breakdown</h3>
           </div>
           <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {analytics?.stateBreakdown?.map((state: any) => (
                <div key={state._id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-[#6029F1]/30 transition-all">
                   <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{state._id || 'Unknown'}</div>
                   <div className="text-lg font-bold text-white mb-1">₹{(state.revenue / 100).toLocaleString()}</div>
                   <div className="text-[10px] font-bold text-[#34d399] uppercase tracking-tighter">{state.sales} Policies</div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

