'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, authAPI } from '@/lib/api';
import { IUser } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';

export default function MembersPage() {
  const [members, setMembers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchMembers() {
      try {
        // In a real scenario, the backend should handle filtering by SH state/network.
        // For now, we fetch all and let the SH see their potential regional reach.
        const res = await usersAPI.getAll({ limit: 100 });
        if (res.data.success) {
          setMembers(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch members', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Regional Network">
      <div className="space-y-6 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
             <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / NETWORK</p>
             <h2 className="text-2xl font-bold text-white tracking-tight">Regional Partners</h2>
             <p className="text-sm text-[#64748B] font-medium opacity-70">Monitor and manage all active partners within your state jurisdiction.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#131241] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#60A5FA]/30 w-full md:w-64 transition-all"
                />
              </div>
              <button className="bg-[#60A5FA] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Export CSV</button>
           </div>
        </div>

        {/* Members Table */}
        <div className="bg-[#131241] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Member ID</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Partner Details</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Role</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                {filteredMembers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">No matching partners found</td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-white/1 transition-colors">
                      <td className="px-6 py-6">
                        <span className="text-xs font-mono font-bold text-[#60A5FA]">{member.memberId}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-[#B5B8BD]">
                             {member.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white leading-tight">{member.name}</p>
                             <p className="text-[10px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">{member.mobile}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span 
                          className="text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border"
                          style={{ 
                            backgroundColor: `${ROLE_COLORS[member.role]}15`, 
                            color: ROLE_COLORS[member.role],
                            borderColor: `${ROLE_COLORS[member.role]}30`
                          }}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-white">
                        {new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                          member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="text-[10px] font-bold text-[#60A5FA] hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">View Profile</button>
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Syncing network data...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
