'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function AdminMembers() {
  const [members, setMembers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const res = await usersAPI.getAll({ page, limit: 10, search });
        if (res.data.success) {
          setMembers(res.data.data || []);
          setTotal(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Member fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [page, search]);

  const rankStyles: any = {
    HCC: 'text-hcc bg-hcc/10 border-hcc/20',
    HCM: 'text-hcm bg-hcm/10 border-hcm/20',
    HBA: 'text-hba bg-hba/10 border-hba/20',
    SH: 'text-sh bg-sh/10 border-sh/20',
    ADMIN: 'text-admin bg-admin/10 border-admin/20',
  };

  return (
    <DashboardLayout pageTitle="Member Directory">
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-white/[0.07] p-4 rounded-2xl">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by name, ID, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface2 border border-white/[0.07] rounded-xl px-10 py-2.5 text-sm font-bold text-white outline-none focus:border-admin/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05]">Filter By Rank</button>
            <button className="px-4 py-2 rounded-lg bg-admin text-[#0d0f14] text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-admin/10">Add New Member +</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/[0.07]">
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Member Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Rank/Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Team Size</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Sales</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">KYC</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="px-6 py-6"><div className="h-4 bg-white/[0.05] rounded w-full" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-muted">No members found matching criteria</td></tr>
                ) : (
                  members.map((m) => (
                    <tr key={m._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center font-display text-[10px] font-bold text-white border border-white/[0.1]">
                            {m.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white tracking-tight">{m.name}</div>
                            <div className="text-[10px] font-mono text-muted uppercase tracking-tighter">{m.memberId} · {m.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${rankStyles[m.rank]}`}>
                          {m.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-white uppercase tracking-tighter">{m.state}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-white">{m.teamSize}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-sh">{m.personalSalesCount}</td>
                      <td className="px-6 py-4">
                        <div className={`w-2 h-2 rounded-full ${m.kycStatus === 'approved' ? 'bg-sh' : m.kycStatus === 'pending' ? 'bg-amber-500' : 'bg-muted/30'}`} title={m.kycStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${m.status === 'active' ? 'text-sh' : 'text-hcm'}`}>{m.status}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-admin/40 transition-all opacity-0 group-hover:opacity-100" title="View Profile">👤</button>
                          <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-admin/40 transition-all opacity-0 group-hover:opacity-100" title="Genealogy Tree">🕸️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
              Showing {members.length} of {total} Members
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg bg-surface2 border border-white/[0.07] text-[10px] font-bold text-white uppercase tracking-widest disabled:opacity-20 hover:bg-white/[0.05]"
              >
                Prev
              </button>
              <button 
                disabled={members.length < 10} 
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg bg-surface2 border border-white/[0.07] text-[10px] font-bold text-white uppercase tracking-widest disabled:opacity-20 hover:bg-white/[0.05]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
