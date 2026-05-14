'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authAPI } from '@/lib/api';
import { IUser } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

export default function HcmRankProgressPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe().then(res => {
      if (res.data.success && res.data.data) setUser(res.data.data);
      setLoading(false);
    });
  }, []);

  // HCM → HBA promotion criteria
  const requirements = [
    { label: 'Personal Sales', target: 12, current: user.personalSalesCount || 0 },
    { label: 'Direct HCCs', target: 12, current: user.teamSize || 0 }, // Simplified for HCM
    { label: 'Active Status', target: 1, current: user.status === 'active' ? 1 : 0 },
  ];

  const totalTarget = requirements.reduce((acc, r) => acc + r.target, 0);
  const totalCurrent = requirements.reduce((acc, r) => acc + Math.min(r.current, r.target), 0);
  const readiness = Math.round((totalCurrent / totalTarget) * 100);

  const projectionData = [
    { name: 'Last Mo', value: Math.max(0, (user.personalSalesCount || 0) - 2), type: 'actual' },
    { name: 'Current', value: user.personalSalesCount || 0, type: 'actual' },
    { name: 'Target', value: 12, type: 'projected' },
  ];

  if (loading) return null;

  return (
    <DashboardLayout pageTitle="Promotion Tracker">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#F87171] uppercase tracking-widest mb-1">CUREBHARAT / HCM / GROWTH</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Promotion Desk</h2>
            <p className="text-sm text-[#64748B] font-medium opacity-70">Track your trajectory towards the HBA (Health Business Associate) rank.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Current Rank', value: user.rank || 'HCM' },
             { label: 'Readiness Score', value: `${readiness}%` },
             { label: 'Personal Sales', value: user.personalSalesCount || 0 },
             { label: 'Next Milestone', value: 'HBA Rank' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#131241] rounded-[24px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/10 transition-all" />
                <p className="text-[10px] font-black text-[#B5B8BD] uppercase tracking-widest mb-10">{stat.label}</p>
                <h4 className="text-3xl font-black text-white tracking-tight">{stat.value}</h4>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Requirement List */}
           <div className="lg:col-span-8 bg-[#131241] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Promotion Criteria</h3>
                 <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-3 py-1 rounded-md uppercase tracking-widest border border-red-400/20">Target: HBA Rank</span>
              </div>
              <div className="p-4">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="px-6 py-5">Objective</th>
                          <th className="px-6 py-5 text-center">Benchmark</th>
                          <th className="px-6 py-5 text-right">Achieved</th>
                          <th className="px-6 py-5 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {requirements.map((req, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-6">
                               <p className="text-xs font-black text-white">{req.label}</p>
                               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Growth Metric</p>
                            </td>
                            <td className="px-6 py-6 text-center text-xs font-bold text-slate-400">{req.target}</td>
                            <td className="px-6 py-6 text-right text-xs font-black text-white">{req.current}</td>
                            <td className="px-6 py-6 text-center">
                               {req.current >= req.target ? (
                                 <span className="bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-md text-[8px] font-black uppercase border border-emerald-400/20">Met</span>
                               ) : (
                                 <span className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-md text-[8px] font-black uppercase border border-amber-400/20">Pending</span>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Visualization Side */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-10">Sales Trajectory</h3>
                 <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={projectionData}>
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#131241', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                             {projectionData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.type === 'actual' ? '#f87171' : 'rgba(248,113,113,0.1)'} stroke={entry.type === 'projected' ? '#f87171' : 'none'} strokeDasharray="4 4" />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    HBA Rank Rewards
                 </h3>
                 <div className="space-y-4">
                    {[
                      { title: '+1% Team Override', desc: 'On all regional volume' },
                      { title: 'Leadership Training', desc: 'Quarterly summits' }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <p className="text-[11px] font-black text-white">{item.title}</p>
                         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.desc}</p>
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
