'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, adminAPI } from '@/lib/api';
import { IUser } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingKYC: 0,
    totalSales: 18413699, // Still mock
    totalPayout: 1133373   // Still mock
  });
  const [pendingUsers, setPendingUsers] = useState<IUser[]>([]);
  const [recentJoins, setRecentJoins] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        const [usersRes, pendingRes] = await Promise.all([
          usersAPI.getAll({ page: 1, limit: 1000 }), // Get all for counts
          adminAPI.getPendingKYC()
        ]);

        if (usersRes.data.success) {
          const allUsers = usersRes.data.data;
          const active = allUsers.filter((u: IUser) => u.status === 'active').length;
          setStats(prev => ({
            ...prev,
            totalUsers: usersRes.data.pagination.total,
            activeUsers: active,
            inactiveUsers: usersRes.data.pagination.total - active,
          }));
          setRecentJoins(allUsers.slice(0, 5));
        }

        if (pendingRes.data.success) {
          setPendingUsers(pendingRes.data.data || []);
          setStats(prev => ({
            ...prev,
            pendingKYC: pendingRes.data.data?.length || 0
          }));
        }
      } catch (err) {
        console.error('Admin stats fetch failed', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  return (
    <DashboardLayout pageTitle="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#6029F1] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest text-[#131241]">Loading Command Center...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-10">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h1 className="text-3xl font-bold text-[#000000] font-display">Welcome Back, Admin</h1>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white border border-borderLight px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-textDark hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Stat Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KPIItem label="Total Users" value={stats.totalUsers} />
              <KPIItem label="Active Users" value={stats.activeUsers} />
              <KPIItem label="Pending KYC" value={stats.pendingKYC} badge={stats.pendingKYC > 0 ? "URGENT" : ""} />
              <KPIItem label="Total Sales" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} />
              <KPIItem label="Total Payout" value={`₹${stats.totalPayout.toLocaleString('en-IN')}`} />
              <KPIItem label="Cap Amount" value="₹50,00,000" badge="LIMIT" />
            </div>
          </div>

          {/* Charts and Side Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trends */}
            <div className="lg:col-span-6 bg-[#131241] rounded-[2rem] p-6 text-white overflow-hidden relative shadow-xl border border-white/[0.03]">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    <h3 className="text-lg font-bold font-display">Revenue Trends</h3>
                  </div>
               </div>
               <div className="h-48 relative flex items-end gap-1">
                  {[30, 45, 35, 55, 40, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#60A5FA]/10 relative group h-full flex items-end">
                      <div className="w-full bg-[#60A5FA]/30 group-hover:bg-[#60A5FA]/50 transition-all rounded-t-sm" style={{ height: `${h}%` }} />
                    </div>
                  ))}
               </div>
            </div>

            {/* Role Distribution */}
            <div className="lg:col-span-3 bg-[#131241] rounded-[2rem] p-6 text-white shadow-xl border border-white/[0.03] hover:scale-[1.02] transition-all duration-500">
               <h3 className="text-lg font-bold font-display mb-8">Role Distribution</h3>
               <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-xl border-[6px] border-[#60A5FA] flex flex-col items-center justify-center relative mb-8 shadow-[0_0_40px_-10px_rgba(96,165,250,0.5)]">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">TOTAL</span>
                     <span className="text-3xl font-bold font-display leading-none">{stats.totalUsers}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full">
                     <LegendItem label="SH" color="bg-[#60A5FA]" />
                     <LegendItem label="HCB" color="bg-[#8b7cf8]" />
                     <LegendItem label="HCM" color="bg-[#34d399]" />
                     <LegendItem label="HCC" color="bg-[#64748B]" />
                  </div>
               </div>
            </div>

            {/* Hierarchy Shortcut with Animation */}
            <div className="lg:col-span-3 bg-gradient-to-br from-[#6029F1] to-[#131241] rounded-[2rem] p-6 text-white shadow-xl border border-white/[0.1] relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-500">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(96,41,241,0.5),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-10">Network Explorer</h3>
                  <div className="flex items-center justify-center py-6">
                     <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <div className="absolute inset-0 rounded-full border border-white/20 scale-150 animate-ping opacity-20" />
                     </div>
                  </div>
                  <Link href="/admin/hierarchy" className="w-full mt-8 block text-center py-4 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all border border-white/5">
                     View Hierarchy
                  </Link>
               </div>
            </div>
          </div>

          {/* Bottom Section: Tables and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9 space-y-6">
                {/* Top 10 State Head (SH) Sales */}
                <div className="bg-[#131241] rounded-[2rem] text-white shadow-xl overflow-hidden border border-white/[0.03] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                   <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                        </div>
                        <h3 className="text-lg font-bold font-display">Top 10 State Head (SH) Sales</h3>
                      </div>
                      <Link href="/admin/state-performance" className="text-xs font-bold text-[#60A5FA] hover:underline uppercase tracking-widest">Analytics Report</Link>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                               <th className="px-8 py-4">Rank</th>
                               <th className="px-4 py-4">SH Name</th>
                               <th className="px-4 py-4">State</th>
                               <th className="px-4 py-4 text-center">Unit Sales</th>
                               <th className="px-8 py-4 text-right">Revenue</th>
                            </tr>
                         </thead>
                         <tbody className="text-sm font-medium">
                            {[
                              { rank: 1, name: 'Vikram Singh', state: 'Maharashtra', units: 1420, revenue: 284000000 },
                              { rank: 2, name: 'Ananya Sharma', state: 'Delhi', units: 1180, revenue: 236000000 },
                              { rank: 3, name: 'Rajesh Kumar', state: 'Karnataka', units: 950, revenue: 190000000 },
                              { rank: 4, name: 'Priya Patel', state: 'Gujarat', units: 840, revenue: 168000000 },
                              { rank: 5, name: 'Amit Verma', state: 'Uttar Pradesh', units: 720, revenue: 144000000 }
                            ].map((sh) => (
                              <tr key={sh.rank} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                                <td className="px-8 py-5">
                                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                                    sh.rank === 1 ? 'bg-[#fbbf24] text-black' : 'bg-white/10 text-white/60'
                                  }`}>
                                    {sh.rank}
                                  </span>
                                </td>
                                <td className="px-4 py-5 text-white font-bold group-hover:text-[#60A5FA] transition-colors">{sh.name}</td>
                                <td className="px-4 py-5 text-white/60 text-xs font-bold uppercase tracking-widest">{sh.state}</td>
                                <td className="px-4 py-5 text-center font-mono text-emerald-400">{sh.units}</td>
                                <td className="px-8 py-5 text-right text-white font-black">₹{(sh.revenue / 100).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

               {/* Pending KYC Table */}
               <div className="bg-[#131241] rounded-[2rem] text-white shadow-xl overflow-hidden border border-white/[0.03]">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                     <h3 className="text-lg font-bold font-display">Pending KYC Review</h3>
                     <Link href="/admin/kyc" className="text-xs font-bold text-[#60A5FA] hover:underline uppercase tracking-widest">Process All</Link>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                              <th className="px-8 py-4">Member ID</th>
                              <th className="px-4 py-4">Name</th>
                              <th className="px-4 py-4">Mobile</th>
                              <th className="px-4 py-4 text-center">State</th>
                              <th className="px-8 py-4 text-center">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                           {pendingUsers.slice(0, 5).map(u => (
                             <tr key={u._id} className="hover:bg-white/5 border-b border-white/5">
                               <td className="px-8 py-4 text-[#60A5FA] font-bold">{u.memberId}</td>
                               <td className="px-4 py-4">{u.name}</td>
                               <td className="px-4 py-4 text-white/60">{u.mobile}</td>
                               <td className="px-4 py-4 text-center">{u.state}</td>
                               <td className="px-8 py-4 text-center">
                                 <Link href={`/admin/kyc/${u._id}`} className="text-xs bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all">Review</Link>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* Operational Alerts */}
            <div className="lg:col-span-3 bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl h-fit border border-white/[0.03]">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold font-display uppercase tracking-widest">Admin Alerts</h3>
                  <span className="bg-[#f87171] text-[9px] font-black px-2 py-0.5 rounded text-black">NEW</span>
               </div>
               <div className="space-y-8">
                  <AlertItem 
                     icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>} 
                     title="KYC Backlog" 
                     desc={`${stats.pendingKYC} members are waiting for verification.`} 
                  />
                  <AlertItem 
                     icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>} 
                     title="System Active" 
                     desc="Backend server is synchronized and responding." 
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function KPIItem({ label, value, badge }: any) {
  const isLong = String(value).length > 10;
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-5 text-white shadow-lg flex flex-col justify-between h-36 border border-white/[0.03] hover:scale-[1.05] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 group cursor-default">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">{label}</span>
        {badge && <span className="bg-[#fbbf24] text-[8px] font-black px-1.5 py-0.5 rounded text-black tracking-tighter">{badge}</span>}
      </div>
      <div className={`${isLong ? 'text-xl' : 'text-3xl'} font-bold font-display tracking-tighter mt-auto truncate group-hover:text-[#60A5FA] transition-colors`}>
        {value}
      </div>
    </div>
  );
}

function LegendItem({ label, color }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ProgressItem({ label, val, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-[#60A5FA]">{val}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: val, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RowData({ id, name, role, state, status, joined }: any) {
  return (
    <tr className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
       <td className="px-8 py-5 text-[#60A5FA] font-bold tracking-tight">{id}</td>
       <td className="px-4 py-5 text-white font-bold">{name}</td>
       <td className="px-4 py-5 text-white/60 text-xs">{role}</td>
       <td className="px-4 py-5 text-center text-white/80 text-xs font-bold">{state}</td>
       <td className="px-4 py-5 text-center">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#64748B]/20 text-[#64748B]'} tracking-widest`}>
             {status}
          </span>
       </td>
       <td className="px-8 py-5 text-right text-white/60 text-xs">{joined}</td>
    </tr>
  );
}

function AlertItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4 group cursor-pointer">
       <div className="flex-shrink-0 mt-1">{icon}</div>
       <div>
          <h4 className="text-sm font-bold text-white group-hover:text-[#60A5FA] transition-colors">{title}</h4>
          <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
