'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI, dashboardAPI } from '@/lib/api';
import { ISale } from '@/types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function MySalesPage() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, summaryRes] = await Promise.all([
          salesAPI.getAll(),
          dashboardAPI.getSummary()
        ]);

        if (salesRes.data.success) setSales(salesRes.data.data || []);
        if (summaryRes.data.success) setSummary(summaryRes.data.data);
      } catch (err) {
        console.error('Failed to fetch sales data', err);
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

  const chartData = summary?.revenueTrends?.map((item: any) => ({
    name: item.label,
    value: item.revenue
  })) || [];

  return (
    <DashboardLayout pageTitle="My Sales">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
             <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / SALES</p>
             <h2 className="text-2xl font-bold text-white tracking-tight">Sales Analytics</h2>
             <p className="text-sm text-[#64748B] font-medium opacity-70">Monitor personal and team-driven sales performance in real time.</p>
           </div>
           <button className="bg-[#60A5FA] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Export Report</button>
        </div>

        {/* Top Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-4">Total Revenue</p>
                 <h4 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(summary?.metrics?.totalRevenue || 0)}</h4>
                 <p className="text-[10px] font-bold text-[#60A5FA] mt-4 flex items-center gap-1 uppercase tracking-widest">
                    Lifetime volume
                 </p>
              </div>
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-4">MTD Revenue</p>
                 <h4 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(summary?.metrics?.mtdRevenue || 0)}</h4>
                 <p className="text-[10px] font-bold text-emerald-400 mt-4 uppercase tracking-widest">Month to date</p>
              </div>
           </div>

           <div className="lg:col-span-9 bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5 relative">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Performance (Weekly)</h3>
              </div>
              <div className="h-[250px]">
                 {chartData.length === 0 ? (
                   <div className="h-full flex items-center justify-center opacity-10 font-bold uppercase tracking-[0.5em] text-white">No Trend Data</div>
                 ) : (
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
                          tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} 
                          dy={10}
                         />
                         <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} 
                          dx={-10}
                          tickFormatter={(val) => `₹${val/1000}k`}
                         />
                         <Tooltip 
                          contentStyle={{ backgroundColor: '#131241', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          formatter={(val: any) => formatCurrency(val)}
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
                 )}
              </div>
           </div>
        </div>

        {/* Main Ledger Area */}
        <div className="bg-[#131241] rounded-[20px] shadow-2xl border border-white/5 flex flex-col min-h-[500px] overflow-hidden">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>
           </div>
           
           <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/2 border-b border-white/5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-[0.2em]">
                       <th className="px-6 py-5">Sale ID / Date</th>
                       <th className="px-6 py-5">Customer / Plan</th>
                       <th className="px-6 py-5 text-right">Amount</th>
                       <th className="px-6 py-5 text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/2">
                    {sales.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">No sales records found</td>
                      </tr>
                    ) : (
                      sales.map((item) => (
                        <tr key={item._id} className="hover:bg-white/1 transition-colors">
                           <td className="px-6 py-6">
                              <p className="text-xs font-bold text-white uppercase">{item._id.slice(-8)}</p>
                              <p className="text-[9px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">
                                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                           </td>
                           <td className="px-6 py-6">
                              <p className="text-sm font-bold text-white">{item.customerName}</p>
                              <p className="text-[10px] text-[#60A5FA] font-bold mt-1 uppercase tracking-widest">{(item.plan as any)?.name}</p>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <p className="text-sm font-bold text-white">{formatCurrency(item.saleAmount)}</p>
                              <p className="text-[10px] text-white/30 font-bold mt-1 uppercase">BV: {item.businessVolume}</p>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${
                                item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {item.status}
                              </span>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
           
           {loading && (
             <div className="p-20 text-center bg-white/2">
               <div className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin mx-auto" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Syncing sales data...</p>
             </div>
           )}
        </div>

      </div>
    </DashboardLayout>
  );
}
