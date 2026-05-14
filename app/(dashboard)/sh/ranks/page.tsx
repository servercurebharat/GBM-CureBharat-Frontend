'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authAPI } from '@/lib/api';
import { IUser } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

export default function PromotionTrackerPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe().then(res => {
      if (res.data.success && res.data.data) setUser(res.data.data);
      setLoading(false);
    });
  }, []);

  // Rank Requirement Calculation (Hardcoded Logic for Demo/Real)
  // For SH to next rank (assuming Leadership rank)
  const requirements = [
    { label: 'Personal Sales', target: 12, current: user.personalSalesCount || 0 },
    { label: 'Direct Recruits', target: 12, current: 0 }, // We'd need an API for direct count
    { label: 'Team Size', target: 300, current: user.teamSize || 0 },
  ];

  // Estimate readiness
  const totalTarget = requirements.reduce((acc, r) => acc + r.target, 0);
  const totalCurrent = requirements.reduce((acc, r) => acc + Math.min(r.current, r.target), 0);
  const readiness = Math.round((totalCurrent / totalTarget) * 100);

  const projectionData = [
    { name: 'Last Cycle', value: user.personalSalesCount ? user.personalSalesCount - 2 : 0, type: 'actual' },
    { name: 'Current', value: user.personalSalesCount || 0, type: 'actual' },
    { name: 'Next (P)', value: (user.personalSalesCount || 0) + 5, type: 'projected' },
  ];

  return (
    <DashboardLayout pageTitle="Promotion Tracker">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / PROMOTION</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Promotion Tracker</h2>
            <p className="text-sm text-[#64748B] font-medium opacity-70">Monitor rank progression, readiness scores, and team requirements.</p>
          </div>
        </div>

        {/* Top Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Current Rank', value: user.rank || 'SH' },
             { label: 'Readiness Score', value: `${readiness}%` },
             { label: 'Cycle Goal', value: 'Promotion' },
             { label: 'Target Rank', value: 'Leadership' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-10">{stat.label}</p>
                <h4 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h4>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Left Section */}
           <div className="lg:col-span-8 space-y-6">
              {/* Promotion Pathway */}
              <div className="bg-[#131241] rounded-[20px] p-10 shadow-2xl border border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Promotion Pathway</h3>
                 <div className="space-y-12">
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-xs font-bold text-white mb-1">Current Progress <span className="mx-2 opacity-30">→</span> {readiness}%</p>
                             <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">Overall path to Leadership rank</p>
                          </div>
                          <span className="text-xs font-bold text-white">{readiness}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#60A5FA] rounded-full shadow-[0_0_15px_rgba(96,165,250,0.3)]" 
                            style={{ width: `${readiness}%` }} 
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Requirement Checklist */}
              <div className="bg-[#131241] rounded-[20px] shadow-2xl border border-white/5 overflow-hidden">
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Requirement Checklist</h3>
                    <span className="text-[9px] font-black bg-[#60A5FA]/20 text-[#60A5FA] px-3 py-1 rounded-sm uppercase tracking-widest border border-[#60A5FA]/20">Target: Leadership</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-white/2 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-[0.2em]">
                             <th className="px-10 py-5">Requirement</th>
                             <th className="px-10 py-5 text-center">Target</th>
                             <th className="px-10 py-5 text-right">Current</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/2">
                          {requirements.map((row, i) => (
                            <tr key={i} className="hover:bg-white/1 transition-colors">
                               <td className="px-10 py-6 text-sm font-bold text-white">{row.label}</td>
                               <td className="px-10 py-6 text-sm font-bold text-white/40 text-center">{row.target}</td>
                               <td className="px-10 py-6 text-sm font-bold text-right">
                                  <span className={row.current >= row.target ? 'text-emerald-400' : 'text-white'}>{row.current}</span>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Sidebar Column */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Sales Projection */}
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-10">Volume Projection</h3>
                 
                 <div className="h-[250px] mb-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={projectionData}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} 
                            dy={10}
                          />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#131241', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                             {projectionData.map((entry, index) => (
                               <Cell 
                                key={`cell-${index}`} 
                                fill={entry.type === 'actual' ? '#60A5FA' : 'rgba(96,165,250,0.1)'} 
                                stroke={entry.type === 'projected' ? '#60A5FA' : 'none'}
                                strokeDasharray={entry.type === 'projected' ? '4 4' : '0'}
                               />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                       <span className="text-[9px] font-bold text-[#B5B8BD] uppercase">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full border border-[#60A5FA] bg-[#60A5FA]/20" />
                       <span className="text-[9px] font-bold text-[#B5B8BD] uppercase">Projected</span>
                    </div>
                 </div>
              </div>

              {/* Next Role Benefits */}
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Leadership Benefits
                 </h3>
                 <div className="space-y-4">
                    {[
                      { label: '+2% State Override', sub: 'Calculated on gross volume', icon: 'bank' },
                      { label: 'National Meet Eligibility', sub: 'Annual leadership summit', icon: 'globe' },
                    ].map((benefit, i) => (
                      <div key={i} className="bg-white/2 border border-white/5 rounded-2xl p-5">
                         <div className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                               {benefit.icon === 'bank' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18"></path><rect x="4" y="8" width="16" height="9"></rect></svg>}
                               {benefit.icon === 'globe' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle></svg>}
                            </div>
                            <div>
                               <p className="text-[11px] font-bold text-white leading-tight">{benefit.label}</p>
                               <p className="text-[8px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">{benefit.sub}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
