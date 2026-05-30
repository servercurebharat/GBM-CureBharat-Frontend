'use client';

import { Suspense, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { IUser } from '@/types';
import { useAuth } from '@/lib/auth';
import AddMemberModal from '@/components/dashboard/AddMemberModal';
import ExportDropdown from '@/components/dashboard/ExportDropdown';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AnnouncementModal from '@/components/modals/AnnouncementModal';

function AdminMembersContent() {
  const { user } = useAuth();
  const [members, setMembers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL ROLES');
  const [stats, setStats] = useState<any>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await usersAPI.getStats();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const [statusFilter, setStatusFilter] = useState<string>('All Status');

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        let roleFilter = undefined;
        if (activeTab === 'STATE HEAD') roleFilter = 'sh';
        else if (activeTab === 'HBA') roleFilter = 'hba';
        else if (activeTab === 'HCM') roleFilter = 'hcm';
        else if (activeTab === 'HCC') roleFilter = 'hcc';

        let statusParam = undefined;
        let kycStatusParam = undefined;
        if (statusFilter === 'Active') statusParam = 'active';
        else if (statusFilter === 'Inactive') statusParam = 'inactive';
        else if (statusFilter === 'Blocked') statusParam = 'blocked';
        else if (statusFilter === 'Pending KYC') kycStatusParam = 'pending';

        const res = await usersAPI.getAll({ 
          page, 
          limit: 10, 
          search, 
          role: roleFilter,
          state: stateFilter !== 'All States' ? stateFilter : undefined,
          status: statusParam,
          kycStatus: kycStatusParam,
          refer: referredBy || undefined
        });
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
  }, [page, search, activeTab, stateFilter, statusFilter, referredBy, refreshKey]);

  const tabs = ['ALL ROLES', 'STATE HEAD', 'HBA', 'HCM', 'HCC'];

  return (
    <DashboardLayout pageTitle="Member Management">
      {user && (
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={user}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}
      <AnnouncementModal
        isOpen={isAnnounceModalOpen}
        onClose={() => {
          setIsAnnounceModalOpen(false);
          setSelectedUserIds([]);
        }}
        selectedUserIds={selectedUserIds}
        totalMembersCount={total}
      />
      <div className="space-y-6 pb-10 stagger-children">
        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-children">
          <StatCard label="TOTAL MEMBERS" value={stats ? stats.totalUsers : '-'} sub="Total registered" trend="none" />
          <StatCard label="ACTIVE MEMBERS" value={stats ? stats.activeUsers : '-'} sub="Currently active" trend="up" />
          <StatCard label="INACTIVE MEMBERS" value={stats ? stats.inactiveUsers : '-'} sub="Awaiting reactivation" trend="none" />
          <StatCard label="PENDING KYC" value={stats ? stats.pendingKycUsers : '-'} sub="Urgent Action Required" trend={stats?.pendingKycUsers > 0 ? 'warning' : 'none'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up">
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6 animate-slide-up stagger-children">
            {/* Filter Tabs & Add User */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-[#131241] p-1 rounded-xl shadow-lg border border-white/[0.03]">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                        ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsModalOpen(true)} className="bg-[#10b981] px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#10b981]/20 hover:brightness-110 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add User
                </button>
                {(selectedUserIds.length > 0 || total > 0) && (
                  <button 
                    onClick={() => setIsAnnounceModalOpen(true)} 
                    className="bg-blue-600 px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:brightness-110 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    Broadcast Announcement {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
                  </button>
                )}
              </div>
            </div>

            {/* Search & Action Bar */}
            <div className="bg-[#131241] p-4 rounded-[1.5rem] shadow-xl border border-white/[0.03] flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search by ID, Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.05] rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
              <div className="relative w-full md:w-48">
                <input
                  type="text"
                  placeholder="Referred By..."
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <select 
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:ring-1 focus:ring-[#10b981] min-w-[120px] flex-1 md:flex-none"
                >
                  <option>All States</option>
                  <option>Maharashtra</option>
                  <option>Gujarat</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Uttar Pradesh</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-[#E1E2EC] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:ring-1 focus:ring-[#10b981] min-w-[120px] flex-1 md:flex-none"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending KYC</option>
                  <option>Blocked</option>
                </select>
                 <ExportDropdown 
                   title="Member Network Report"
                   headers={['Member ID', 'Name', 'Email', 'Sponsor', 'State', 'Role', 'Status']}
                   rows={members.map(m => [
                     m.memberId,
                     m.name,
                     m.email || 'N/A',
                     m.referrerId ? (m.referrerId as any).name : 'Direct',
                     m.state || 'Maharashtra',
                     m.role.toUpperCase(),
                     m.status.toUpperCase()
                   ])}
                   fileName="CureBharat_Members"
                   variant="ghost"
                 />
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-[#131241] rounded-[2rem] shadow-xl overflow-hidden border border-white/[0.03]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="px-8 py-5 w-16">
                         <button 
                            onClick={() => {
                              if (selectedUserIds.length === members.length) setSelectedUserIds([]);
                              else setSelectedUserIds(members.map(m => m._id));
                            }}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              selectedUserIds.length === members.length ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                            }`}
                          >
                             {selectedUserIds.length === members.length && (
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                             )}
                          </button>
                      </th>
                      <th className="px-4 py-5">ID</th>
                      <th className="px-4 py-5">MEMBER NAME</th>
                      <th className="px-4 py-5">SPONSOR</th>
                      <th className="px-4 py-5">STATE</th>
                      <th className="px-4 py-5">ROLE</th>
                      <th className="px-4 py-5">STATUS</th>
                      <th className="px-4 py-5">ENGAGEMENT</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={8} className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : (
                      members.map((member) => (
                        <tr 
                          key={member._id} 
                          onClick={() => window.location.href = `/admin/members/${member._id}`}
                          className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                        >
                          <td className="px-8 py-5">
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedUserIds.includes(member._id)) {
                                    setSelectedUserIds(selectedUserIds.filter(id => id !== member._id));
                                  } else {
                                    setSelectedUserIds([...selectedUserIds, member._id]);
                                  }
                                }}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  selectedUserIds.includes(member._id) ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-white/20 group-hover:border-emerald-500/50'
                                }`}
                              >
                                 {selectedUserIds.includes(member._id) && (
                                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                 )}
                              </button>
                          </td>
                          <td className="px-4 py-5 text-[#10b981] font-bold text-xs tracking-tight">#{member.memberId}</td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-surface2 flex items-center justify-center font-bold text-xs text-white border border-white/10 overflow-hidden uppercase">
                                {member.name.slice(0, 1)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors">{member.name}</div>
                                <div className="text-[10px] text-white/40 font-medium">{member.mobile}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="text-xs font-medium text-white/60">
                               {member.referrerId ? (
                                  `${(member.referrerId as any).name} (#${(member.referrerId as any).memberId})`
                               ) : (
                                  'Direct / System'
                               )}
                            </div>
                          </td>
                          <td className="px-4 py-5">
                             <div className="text-xs font-medium text-white/80">{member.state || 'Maharashtra'}</div>
                          </td>
                          <td className="px-4 py-5">
                             <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                member.role === 'hcc' ? 'text-hcc border-hcc/30 bg-hcc/5' :
                                member.role === 'hcm' ? 'text-hcm border-hcm/30 bg-hcm/5' :
                                member.role === 'hba' ? 'text-hba border-hba/30 bg-hba/5' :
                                'text-purple-400 border-purple-400/30 bg-purple-400/5'
                             }`}>
                                {member.role}
                             </span>
                          </td>
                          <td className="px-4 py-5">
                             <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-[#34d399]' : 'bg-[#fbbf24]'}`} />
                                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{member.status}</span>
                             </div>
                          </td>
                          <td className="px-4 py-5">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{formatTimeSpent((member as any).totalTimeSpent || 0)}</span>
                                <span className="text-[7px] font-bold text-white/20 uppercase tracking-tighter mt-0.5">Total Time</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Link 
                                  href={`/admin/hierarchy?search=${member.memberId}`}
                                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-amber-500 hover:text-white transition-all"
                                  title="View Hierarchy"
                                >
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </Link>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-5 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                   Page {page} of {Math.ceil(total / 10) || 1} · {total} records
                </div>
                <div className="flex items-center gap-1">
                   <button 
                     disabled={page === 1}
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     className="p-2 text-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                   </button>
                   
                   {Array.from({ length: Math.ceil(total / 10) || 1 }, (_, i) => i + 1)
                     .filter(p => p === 1 || p === Math.ceil(total / 10) || Math.abs(page - p) <= 1)
                     .map((p, i, arr) => (
                       <div key={p} className="flex items-center">
                         {i > 0 && arr[i - 1] !== p - 1 && <span className="text-white/30 px-1 text-[10px]">...</span>}
                         <button 
                           onClick={() => setPage(p)}
                           className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === p ? 'bg-[#10b981] text-[#131241] shadow-lg shadow-[#10b981]/20' : 'text-white/40 hover:text-white'}`}
                         >
                           {p}
                         </button>
                       </div>
                   ))}

                   <button 
                     disabled={page >= Math.ceil(total / 10) || total === 0}
                     onClick={() => setPage(p => Math.min(Math.ceil(total / 10), p + 1))}
                     className="p-2 text-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div className="lg:col-span-3 space-y-6 animate-slide-up stagger-children">
            {/* Role Distribution Chart */}
            <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03]">
               <h3 className="text-sm font-bold font-display uppercase tracking-widest mb-10">Role Distribution</h3>
               <div className="flex flex-col items-center">
                  <div className="w-40 h-40 relative flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="10" opacity="0.05" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="264" strokeDashoffset={stats ? 264 - 264 * (((stats.roleDistribution?.hba || 0) + (stats.roleDistribution?.hcm || 0) + (stats.roleDistribution?.hcc || 0)) / (stats.totalUsers || 1)) : 66} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#8b7cf8" strokeWidth="10" strokeDasharray="264" strokeDashoffset={stats ? 264 - 264 * (((stats.roleDistribution?.hba || 0) + (stats.roleDistribution?.hcm || 0)) / (stats.totalUsers || 1)) : 220} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#fbbf24" strokeWidth="10" strokeDasharray="264" strokeDashoffset={stats ? 264 - 264 * ((stats.roleDistribution?.hba || 0) / (stats.totalUsers || 1)) : 250} strokeLinecap="round" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-display">{stats ? stats.totalUsers : '-'}</span>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">TOTAL</span>
                     </div>
                  </div>
                  <div className="mt-10 space-y-4 w-full">
                     <DistributionItem label="HCC Members" value={stats ? `${Math.round(((stats.roleDistribution?.hcc || 0) / (stats.totalUsers || 1)) * 100)}%` : '-'} color="bg-[#10b981]" />
                     <DistributionItem label="HCM Leads" value={stats ? `${Math.round(((stats.roleDistribution?.hcm || 0) / (stats.totalUsers || 1)) * 100)}%` : '-'} color="bg-[#8b7cf8]" />
                     <DistributionItem label="HBA Partners" value={stats ? `${Math.round(((stats.roleDistribution?.hba || 0) / (stats.totalUsers || 1)) * 100)}%` : '-'} color="bg-[#fbbf24]" />
                  </div>
               </div>
            </div>

            {/* Profile Selection Placeholder */}
            <div className="bg-[#131241] rounded-[2rem] p-10 text-center text-white shadow-xl border border-white/[0.03] min-h-[350px] flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
               </div>
               <h4 className="text-lg font-bold font-display mb-2">No Profile Selected</h4>
               <p className="text-xs text-white/30 leading-relaxed font-medium">Click any row to inspect profile snapshot, activity and hierarchy context</p>
            </div>

            {/* Issue #9 fix: Replaced off-brand white bg with dark themed design */}
            <div className="bg-[#1a195e] rounded-2xl p-6 border border-blue-500/10">
               <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-wider mb-1">Bulk Actions Enabled</h5>
                    <p className="text-[10px] text-white/30 font-medium leading-relaxed">Select multiple rows to perform batch KYC approval or status updates.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminMembers() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060818] flex items-center justify-center text-white/20 font-black uppercase tracking-widest animate-pulse">Initializing Network...</div>}>
      <AdminMembersContent />
    </Suspense>
  );
}

function StatCard({ label, value, sub, trend }: any) {
  return (
    <div className="bg-[#131241] rounded-2xl p-6 text-white shadow-xl border border-white/[0.03] animate-slide-up">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">{label}</div>
      <div className="text-3xl font-bold font-display mb-3">{value}</div>
      <div className="flex items-center gap-2">
        {trend === 'up' && (
          <div className="flex items-center gap-1 text-[#34d399] text-[10px] font-bold bg-[#34d399]/10 px-2 py-0.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            {sub}
          </div>
        )}
        {trend === 'warning' && (
          <div className="flex items-center gap-1 text-[#f87171] text-[10px] font-bold bg-[#f87171]/10 px-2 py-0.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
            {sub}
          </div>
        )}
        {trend === 'none' && (
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{sub}</div>
        )}
      </div>
    </div>
  );
}

function DistributionItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

function formatTimeSpent(seconds: number) {
  if (!seconds || seconds < 1) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
