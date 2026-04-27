'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ITreeNode } from '@/types';

export default function TeamMonitor() {
  const { user } = useAuth();
  const [team, setTeam] = useState<ITreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    async function fetchTeam() {
      if (!user) return;
      try {
        const res = await usersAPI.getDownline(user._id);
        if (res.data.success) {
          // Level 1 only for team monitor
          setTeam(res.data.data?.children || []);
        }
      } catch (err) {
        console.error('Failed to fetch team', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [user]);

  const filteredTeam = team.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const stats = {
    total: team.length,
    active: team.filter(m => m.status === 'active').length,
    inactive: team.filter(m => m.status === 'inactive').length,
    sales: team.reduce((acc, curr) => acc + curr.personalSalesCount, 0)
  };

  return (
    <DashboardLayout pageTitle="Team Performance Monitor">
       <div className="space-y-8 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">Direct Network Overview</h2>
                <p className="text-sm text-muted mt-1 font-medium">Monitoring productivity and activity of your frontline HCCs</p>
             </div>
             <div className="flex bg-surface border border-white/10 rounded-xl p-1">
                {['all', 'active', 'inactive'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-hcm text-[#0d0f14]' : 'text-muted hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
             <MiniStat label="Total HCCs" val={String(stats.total)} color="#60a5fa" />
             <MiniStat label="Active Status" val={String(stats.active)} color="#34d399" />
             <MiniStat label="Inactive" val={String(stats.inactive)} color="#f87171" />
             <MiniStat label="Total Team Sales" val={String(stats.sales)} color="#fbbf24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading ? (
                Array(3).fill(0).map((_, i) => (
                   <div key={i} className="h-48 bg-surface animate-pulse rounded-[32px] border border-white/5" />
                ))
             ) : filteredTeam.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-surface border border-dashed border-white/10 rounded-[32px]">
                   <p className="text-xs text-muted font-bold uppercase tracking-widest">No members found in this category</p>
                </div>
             ) : (
                filteredTeam.map((m) => (
                   <div key={m._id} className="bg-surface border border-white/[0.07] rounded-[32px] p-6 hover:border-hcm/40 transition-all group relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-hcm/5 blur-3xl -mr-12 -mt-12 group-hover:bg-hcm/10 transition-colors" />
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center font-display font-bold text-white group-hover:scale-110 transition-transform">
                            {m.name.slice(0, 1)}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate">{m.name}</h4>
                            <p className="text-[10px] font-mono text-muted uppercase tracking-tighter">{m.memberId}</p>
                         </div>
                         <div className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-sh animate-pulse' : 'bg-hcm'}`} title={m.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                         <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
                            <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Total Sales</p>
                            <p className="text-lg font-display font-bold text-white">{m.personalSalesCount}</p>
                         </div>
                         <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
                            <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Rank Goal</p>
                            <p className="text-lg font-display font-bold text-hcm">{Math.round((m.personalSalesCount / 12) * 100)}%</p>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                         <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Override Earned</div>
                         <div className="text-xs font-black text-sh tracking-tighter">₹---</div>
                      </div>

                      <button className="w-full mt-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted hover:text-white hover:bg-white/[0.05] transition-all">
                         Send Activity Reminder
                      </button>
                   </div>
                ))
             )}
          </div>
       </div>
    </DashboardLayout>
  );
}

function MiniStat({ label, val, color }: any) {
  return (
    <div className="bg-surface border border-white/[0.07] rounded-2xl p-4 flex items-center gap-4">
       <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: color }} />
       <div>
          <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-lg font-display font-bold text-white leading-none">{val}</p>
       </div>
    </div>
  );
}
