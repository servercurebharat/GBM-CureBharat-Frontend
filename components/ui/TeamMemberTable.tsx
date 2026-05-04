'use client';

import { TeamMember } from '@/lib/mockData';

interface TeamMemberTableProps {
  members: TeamMember[];
  color: string;
  title?: string;
  showTeamSize?: boolean;
}

export default function TeamMemberTable({ members, color, title, showTeamSize = true }: TeamMemberTableProps) {
  const activeCount = (members || []).filter(m => m.status === 'active').length;
  const inactiveCount = (members || []).filter(m => m.status === 'inactive').length;

  return (
    <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="px-10 py-8 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
        <div>
          <h3 className="font-display text-base font-black text-white uppercase tracking-wider">
            {title || 'Team Members'}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeCount} Active
            </span>
            {inactiveCount > 0 && (
              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-widest opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {inactiveCount} Inactive
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Network Capacity</div>
          <div className="font-display text-2xl font-black text-white tracking-tighter">{(members || []).length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              <th className="px-10 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Member</th>
              <th className="px-6 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">ID</th>
              <th className="px-6 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">Status</th>
              <th className="px-6 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">Month Sales</th>
              <th className="px-6 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">Total Sales</th>
              {showTeamSize && (
                <th className="px-6 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">Team</th>
              )}
              <th className="px-10 py-6 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {(members || []).map((member) => (
              <tr key={member._id} className="hover:bg-white/[0.01] transition-all group">
                <td className="px-10 py-5">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5 shadow-inner"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate group-hover:text-hba transition-colors">{member.name}</div>
                      <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">{member.rank}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[11px] text-white/30 font-mono tracking-tighter">{member.memberId}</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    member.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`text-sm font-black ${member.personalSalesThisMonth > 0 ? 'text-[#34d399]' : 'text-rose-400/50'}`}>
                    {member.personalSalesThisMonth || 0}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-sm font-black text-white">{member.personalSalesCount || 0}</span>
                </td>
                {showTeamSize && (
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-black text-white/60">{member.teamSize || 0}</span>
                  </td>
                )}
                <td className="px-10 py-5 text-right">
                  <span className="text-base font-black tracking-tighter" style={{ color }}>
                    ₹{((member.totalRevenue || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
