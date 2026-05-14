'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardAPI } from '@/lib/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function TeamPerformancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await dashboardAPI.getSummary();
        if (res.data.success) {
          setSummary(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch team performance summary', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const chartData = summary?.revenueTrends?.map((item: any) => ({
    name: item.label,
    value: item.revenue
  })) || [
    { name: 'WK 5', value: 0 },
    { name: 'WK 4', value: 0 },
    { name: 'WK 3', value: 0 },
    { name: 'WK 2', value: 0 },
    { name: 'Current', value: 0 },
  ];

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout pageTitle="Team Performance">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / PERFORMANCE</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Team Performance Analytics</h2>
          <p className="text-sm text-[#64748B] font-medium opacity-70">Real-time metrics and revenue trends for your state-wide network.</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
              <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">Team Revenue</p>
              <h4 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(summary?.metrics?.totalRevenue || 0)}</h4>
              <p className="text-[10px] text-[#60A5FA] font-bold mt-2">Cumulative volume</p>
           </div>
           <div className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
              <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">FTD Revenue</p>
              <h4 className="text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(summary?.metrics?.ftdRevenue || 0)}</h4>
              <p className="text-[10px] text-white/30 font-bold mt-2">Today's collection</p>
           </div>
           <div className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
              <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">MTD Revenue</p>
              <h4 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(summary?.metrics?.mtdRevenue || 0)}</h4>
              <p className="text-[10px] text-white/30 font-bold mt-2">Monthly performance</p>
           </div>
           <div className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
              <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-2">Network Size</p>
              <h4 className="text-2xl font-bold text-white tracking-tight">{summary?.metrics?.totalUsers || 0}</h4>
              <p className="text-[10px] text-white/30 font-bold mt-2">{summary?.metrics?.activeUsers || 0} Active Members</p>
           </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8 bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Weekly Revenue Trends</h3>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                       <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} 
                        dy={10}
                       />
                       <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} 
                        dx={-10}
                        tickFormatter={(val) => `₹${val/1000}k`}
                       />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#131241', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                       />
                       <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#60A5FA" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              {/* Role Distribution */}
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role Distribution</h3>
                 </div>
                 <div className="space-y-6">
                    {summary?.roleDistribution?.map((item: any, i: number) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-[#B5B8BD]">{item.role}</span>
                            <span className="text-white">{item.count} Members</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#60A5FA] rounded-full" 
                              style={{ width: `${(item.count / summary.metrics.totalUsers) * 100}%` }} 
                            />
                         </div>
                      </div>
                    )) || <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center py-10">No data available</p>}
                 </div>
              </div>

              {/* Insights */}
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Performance Note
                 </h3>
                 <p className="text-xs text-[#B5B8BD] font-medium leading-relaxed relative z-10">
                    Your state-wide activation ratio is at <span className="text-white font-bold">{summary ? Math.round((summary.metrics.activeUsers / summary.metrics.totalUsers) * 100) : 0}%</span>. 
                    Focus on activating inactive members to maximize leadership dividends.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
