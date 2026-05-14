'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { walletAPI } from '@/lib/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export default function IncomeBreakdownPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await walletAPI.getMyWallet();
        if (res.data.success) {
          setWallet(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch income breakdown', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Aggregate data from ledger
  const ledger = wallet?.ledger || [];
  
  const directIncome = ledger.filter((l: any) => l.type === 'direct').reduce((acc: number, l: any) => acc + l.amount, 0);
  const overrideIncome = ledger.filter((l: any) => l.type === 'override').reduce((acc: number, l: any) => acc + l.amount, 0);
  const leadershipIncome = ledger.filter((l: any) => l.type === 'leadership').reduce((acc: number, l: any) => acc + l.amount, 0);
  const totalIncome = directIncome + overrideIncome + leadershipIncome;

  const mixData = [
    { name: 'Direct', value: totalIncome ? Math.round((directIncome / totalIncome) * 100) : 0, color: '#60A5FA', amount: formatCurrency(directIncome) },
    { name: 'Override', value: totalIncome ? Math.round((overrideIncome / totalIncome) * 100) : 0, color: '#FDBA74', amount: formatCurrency(overrideIncome) },
    { name: 'Leadership', value: totalIncome ? Math.round((leadershipIncome / totalIncome) * 100) : 0, color: '#A78BFA', amount: formatCurrency(leadershipIncome) },
  ];

  // Group by month for chart
  const monthlyData: any = {};
  ledger.forEach((l: any) => {
    if (['direct', 'override', 'leadership'].includes(l.type)) {
      const month = l.cycleMonth || 'Unknown';
      if (!monthlyData[month]) monthlyData[month] = { name: month, direct: 0, override: 0, leadership: 0 };
      monthlyData[month][l.type] += l.amount;
    }
  });

  const chartData = Object.values(monthlyData).sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <DashboardLayout pageTitle="Income Breakdown">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / INCOME</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Income Breakdown</h2>
          <p className="text-sm text-[#64748B] font-medium opacity-70">Analyze commission distributions, rank shares, and leadership overrides.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Total Earnings', value: formatCurrency(totalIncome), color: 'text-white' },
             { label: 'Direct Share', value: formatCurrency(directIncome), color: 'text-[#60A5FA]' },
             { label: 'Override Share', value: formatCurrency(overrideIncome), color: 'text-[#FDBA74]' },
             { label: 'Leadership Share', value: formatCurrency(leadershipIncome), color: 'text-[#A78BFA]' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#131241] rounded-[20px] p-6 shadow-2xl border border-white/5">
                <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</h4>
                <p className="text-[10px] text-white/30 mt-2 uppercase tracking-tighter">Lifetime performance</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Growth Chart Area */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Monthly Distribution Growth</h3>
              
              <div className="h-[350px]">
                 {chartData.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">No transaction data yet</p>
                   </div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
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
                          tickFormatter={(val) => `₹${val/1000}K`}
                         />
                         <Tooltip 
                          contentStyle={{ backgroundColor: '#131241', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          formatter={(val: any) => formatCurrency(val)}
                         />
                         <Area type="monotone" dataKey="direct" stackId="1" stroke="#60A5FA" strokeWidth={3} fill="#60A5FA" fillOpacity={0.2} />
                         <Area type="monotone" dataKey="override" stackId="1" stroke="#FDBA74" strokeWidth={3} fill="#FDBA74" fillOpacity={0.2} />
                         <Area type="monotone" dataKey="leadership" stackId="1" stroke="#A78BFA" strokeWidth={3} fill="#A78BFA" fillOpacity={0.2} />
                      </AreaChart>
                   </ResponsiveContainer>
                 )}
              </div>
           </div>

           {/* Income Mix Sidebar */}
           <div className="lg:col-span-4 bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Income Mix</h3>
              
              <div className="h-[240px] relative mb-12">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={mixData}
                          innerRadius={80}
                          outerRadius={105}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                       >
                          {mixData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{totalIncome > 100000 ? `₹${(totalIncome/100000).toFixed(2)}L` : formatCurrency(totalIncome)}</span>
                    <span className="text-[8px] font-black text-[#B5B8BD] uppercase tracking-widest mt-1">Total Earned</span>
                 </div>
              </div>

              <div className="space-y-5">
                 {mixData.map((item, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-xs font-bold text-[#B5B8BD]">{item.name} ({item.value}%)</span>
                      </div>
                      <span className="text-xs font-bold text-white">{item.amount}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Calculation Logic (Static but informative) */}
        <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8">Commission Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="h-4 w-[2px] bg-[#60A5FA]" />
                     <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Direct Commission</h4>
                  </div>
                  <p className="text-[10px] text-[#B5B8BD] leading-relaxed pl-3.5 opacity-60">
                     Earned on personal referral sales. Credited instantly to your wallet upon sale verification.
                  </p>
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="h-4 w-[2px] bg-[#FDBA74]" />
                     <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Override Leadership</h4>
                  </div>
                  <p className="text-[10px] text-[#B5B8BD] leading-relaxed pl-3.5 opacity-60">
                     Leadership override of 2% on your entire downline sales volume across the state.
                  </p>
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="h-4 w-[2px] bg-[#A78BFA]" />
                     <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Rank Pool Dividends</h4>
                  </div>
                  <p className="text-[10px] text-[#B5B8BD] leading-relaxed pl-3.5 opacity-60">
                     Special dividends based on rank achievements and global company turnover shares.
                  </p>
               </div>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
