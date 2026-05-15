'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { activityAPI } from '@/lib/api';
import ExportDropdown from '@/components/dashboard/ExportDropdown';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await activityAPI.getAll({ 
        page, 
        role: roleFilter, 
        category: categoryFilter, 
        search 
      });
      if (res.data.success) {
        setLogs(res.data.data || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, roleFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <DashboardLayout pageTitle="Audit Trail">
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">CureBharat System Oversight</p>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Activity Audit Trail</h1>
           </div>
           
           <div className="flex items-center gap-4">
              <ExportDropdown 
                title="System Activity Log"
                headers={['Timestamp', 'Actor', 'Role', 'Action', 'Category', 'Details', 'IP Address', 'Location']}
                rows={logs.map(l => [
                  new Date(l.createdAt).toLocaleString(),
                  l.userName,
                  l.userRole.toUpperCase(),
                  l.action,
                  l.category.toUpperCase(),
                  l.details,
                  l.ipAddress || 'N/A',
                  l.location ? `${l.location.lat.toFixed(6)}, ${l.location.lng.toFixed(6)}` : 'N/A'
                ])}
                fileName="CureBharat_Audit_Trail"
                variant="primary"
              />
           </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#131241] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Total System Events</p>
              <h2 className="text-3xl font-black text-white mb-2">{pagination?.total || 0}</h2>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Across all categories</p>
           </div>
           <div className="bg-[#131241] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 blur-3xl -mr-12 -mt-12 group-hover:bg-[#10b981]/10 transition-colors" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Session & Auth Activity</p>
              <h2 className="text-3xl font-black text-white mb-2">
                 {logs.filter(l => l.category === 'auth').length}+
              </h2>
              <p className="text-[9px] font-bold text-[#10b981] uppercase tracking-widest">Active security logs</p>
           </div>
           <div className="bg-[#131241] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Live System Feed</p>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-black text-white uppercase tracking-widest">Streaming</span>
              </div>
              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Real-time background tasks</p>
           </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#131241] p-4 rounded-[2rem] shadow-xl border border-white/5 flex flex-wrap items-center gap-4">
           <form onSubmit={handleSearch} className="relative flex-1 min-w-[300px]">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search Action, Member Name or Details..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
              />
           </form>

           <div className="flex gap-4">
              <div className="relative group">
                 <select 
                   value={roleFilter} 
                   onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                   className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 min-w-[180px] appearance-none cursor-pointer hover:bg-white/10 transition-all"
                 >
                   <option value="All" className="bg-[#131241] text-white">All Roles</option>
                   <option value="Admin" className="bg-[#131241] text-white">Admin Only</option>
                   <option value="SH" className="bg-[#131241] text-white">Super Head</option>
                   <option value="HBA" className="bg-[#131241] text-white">HBA Partner</option>
                   <option value="HCM" className="bg-[#131241] text-white">HCM Manager</option>
                   <option value="HCC" className="bg-[#131241] text-white">HCC Member</option>
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-[#10b981] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
                 </div>
              </div>

              <div className="relative group">
                 <select 
                   value={categoryFilter} 
                   onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                   className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 min-w-[200px] appearance-none cursor-pointer hover:bg-white/10 transition-all"
                 >
                   <option value="All" className="bg-[#131241] text-white">All Categories</option>
                   <option value="auth" className="bg-[#131241] text-white">Authentication</option>
                   <option value="financial" className="bg-[#131241] text-white">Financial Actions</option>
                   <option value="network" className="bg-[#131241] text-white">Network Updates</option>
                   <option value="system" className="bg-[#131241] text-white">System Events</option>
                   <option value="kyc" className="bg-[#131241] text-white">KYC Management</option>
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-[#10b981] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
                 </div>
              </div>
           </div>
        </div>

        {/* Log List */}
        <div className="bg-[#131241] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden min-h-[600px] relative">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] border-b border-white/5">
                       <th className="px-10 py-8">TIMESTAMP</th>
                       <th className="px-6 py-8">ACTOR IDENTITY</th>
                       <th className="px-6 py-8">ROLE</th>
                       <th className="px-6 py-8">OPERATION</th>
                       <th className="px-6 py-8">CATEGORY</th>
                       <th className="px-6 py-8">EVENT DETAILS</th>
                       <th className="px-10 py-8 text-right">ORIGIN (IP/GEO)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.03]">
                    {loading ? (
                      Array(8).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={7} className="px-10 py-8"><div className="h-6 bg-white/5 rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : logs.length === 0 ? (
                      <tr>
                         <td colSpan={7} className="px-10 py-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                               <span className="text-xs font-black uppercase tracking-[0.3em]">No activity logs discovered</span>
                            </div>
                         </td>
                      </tr>
                    ) : logs.map((log) => (
                      <tr key={log._id} className="hover:bg-white/[0.02] transition-all group">
                         <td className="px-10 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-white/50 tabular-nums uppercase">
                                  {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </span>
                               <span className="text-[10px] font-bold text-[#10b981] tabular-nums">
                                  {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className="text-[12px] font-black text-white uppercase tracking-tight group-hover:text-[#10b981] transition-colors">
                               {log.userName}
                            </span>
                         </td>
                         <td className="px-6 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                              log.userRole === 'admin' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                              log.userRole === 'sh' ? 'text-purple-400 border-purple-400/30 bg-purple-400/5' :
                              'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5'
                            }`}>
                               {log.userRole}
                            </span>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.action}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                              log.category === 'auth' ? 'text-blue-400 bg-blue-400/10' :
                              log.category === 'financial' ? 'text-amber-400 bg-amber-400/10' :
                              log.category === 'system' ? 'text-emerald-400 bg-emerald-400/10' :
                              'text-white/40 bg-white/5'
                            }`}>
                               {log.category}
                            </span>
                         </td>
                         <td className="px-6 py-6 max-w-sm">
                            <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">"{log.details}"</p>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <div className="flex flex-col items-end gap-1">
                               <span className="text-[11px] font-black text-white/20 tabular-nums bg-white/5 px-3 py-1 rounded-lg border border-white/5 group-hover:border-[#10b981]/20 transition-all">
                                  {log.ipAddress || 'SYSTEM'}
                               </span>
                               {log.location?.lat ? (
                                 <a 
                                   href={`https://www.google.com/maps?q=${log.location.lat},${log.location.lng}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-[9px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-1 hover:underline group/loc"
                                 >
                                    <svg className="group-hover/loc:scale-110 transition-transform" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}
                                 </a>
                               ) : (
                                 <span className="text-[8px] font-bold text-white/10 uppercase tracking-tighter italic">Loc. withheld</span>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           {pagination && pagination.pages > 1 && (
             <div className="p-10 border-t border-white/5 flex items-center justify-between bg-[#0d0f14]/20">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">
                   Showing Segment <span className="text-white/60">{pagination.page}</span> of <span className="text-white/60">{pagination.pages}</span>
                </p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={page === 1}
                     className="px-8 py-3 rounded-2xl bg-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 disabled:opacity-20 transition-all border border-white/5 hover:border-[#10b981]/50"
                   >
                      Previous Shift
                   </button>
                   <button 
                     onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                     disabled={page === pagination.pages}
                     className="px-8 py-3 rounded-2xl bg-[#10b981]/10 text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:bg-[#10b981] hover:text-white disabled:opacity-20 transition-all border border-[#10b981]/20 shadow-lg shadow-emerald-900/10"
                   >
                      Next Segment
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
