'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { teamAPI } from '@/lib/api';
import api from '@/lib/api';
import { IUser } from '@/types';
import toast from 'react-hot-toast';

interface TeamMember extends IUser {
  directCount?: number;
  teamSalesValue?: number;
  overrideValue?: number;
  level?: number;
  isExpanded?: boolean;
}

export default function TeamSection({ user }: { user: IUser }) {
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [expandedTeam, setExpandedTeam] = useState<Record<string, TeamMember[]>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await teamAPI.getStats();
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await teamAPI.getMembers({ 
        role: roleFilter === 'All' ? undefined : roleFilter.toLowerCase(), 
        search: search || undefined 
      });
      if (res.data.success) {
        setMembers(res.data.data.map((m: any) => ({ ...m, isExpanded: false })));
      }
    } catch (err) {
      console.error('Members fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMembers();
  }, [roleFilter, search]);

  const setMemberExpanded = (targetId: string, isExpanded: boolean) => {
    setMembers(prev => prev.map(m => m._id === targetId ? { ...m, isExpanded } : m));
    setExpandedTeam(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        next[key] = next[key].map(m => m._id === targetId ? { ...m, isExpanded } : m);
      });
      return next;
    });
  };

  const toggleNodeExpand = async (member: TeamMember) => {
    const isExpanding = !member.isExpanded;
    setMemberExpanded(member._id as string, isExpanding);

    if (isExpanding && !expandedTeam[member._id as string]) {
      setLoadingChildren(prev => ({ ...prev, [member._id as string]: true }));
      try {
        const res = await api.get(`/team/members?parentId=${member._id}`);
        if (res.data.success) {
          setExpandedTeam(prev => ({ ...prev, [member._id as string]: res.data.data }));
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoadingChildren(prev => ({ ...prev, [member._id as string]: false }));
      }
    }
  };

  const expandAll = async () => {
    setIsAllExpanded(true);
    setMembers(prev => prev.map(m => ({ ...m, isExpanded: true })));
    // Use functional update to get latest members
    const fetches = members
      .filter(m => !expandedTeam[m._id as string])
      .map(async (m) => {
        try {
          const res = await api.get(`/team/members?parentId=${m._id}`);
          if (res.data.success) {
            setExpandedTeam(prev => ({ ...prev, [m._id as string]: res.data.data }));
          }
        } catch (err) {
          console.error('expandAll fetch error:', err);
        }
      });
    await Promise.all(fetches);
  };

  const collapseAll = () => {
    setIsAllExpanded(false);
    setMembers(prev => prev.map(m => ({ ...m, isExpanded: false })));
    setExpandedTeam({});
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '01', color: 'from-amber-400 to-orange-600', text: 'STATE LEADER' };
    if (index === 1) return { label: '02', color: 'from-slate-300 to-slate-500', text: 'TOP ASSOCIATE' };
    if (index === 2) return { label: '03', color: 'from-amber-600 to-amber-800', text: 'RISING STAR' };
    return null;
  };

  const renderChildren = (parentId: string, level: number = 1) => {
    const children = expandedTeam[parentId];
    if (!children) return null;

    return (
      <tr className="bg-black/20">
         <td colSpan={8} className="px-0 py-0 border-l-4 border-blue-500/30">
            <table className="w-full">
               <tbody>
                  {children.map((child) => (
                    <React.Fragment key={child._id}>
                    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-4 w-28" style={{ paddingLeft: `${level * 3}rem` }}>
                          <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                       </td>
                       <td className="px-8 py-4">
                          <p className="text-[11px] font-black text-white/80">{child.name}</p>
                          <p className="text-[8px] font-bold text-blue-400/60 uppercase">{child.memberId}</p>
                       </td>
                       <td className="px-8 py-4 text-[10px] text-slate-500">{child.state}</td>
                       <td className="px-8 py-4 text-right text-[10px] font-black text-white/60">{formatCurrency(child.teamSalesValue || 0)}</td>
                       <td className="px-8 py-4 text-right text-[10px] font-black text-blue-400/60">{formatCurrency((child.teamSalesValue || 0) * 0.02)}</td>
                       <td className="px-8 py-4 text-center">
                          {child.role !== 'hcc' && (
                            <button 
                              onClick={() => toggleNodeExpand(child)}
                              className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto ${
                                child.isExpanded 
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-400/20' 
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                               {loadingChildren[child._id as string] ? 'Loading...' : child.isExpanded ? 'Hide' : `View ${getNextRole(child.role)}s`}
                               <svg className={`transition-transform duration-300 ${child.isExpanded ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                          )}
                       </td>
                    </tr>
                    {child.isExpanded && renderChildren(child._id as string, level + 1)}
                    </React.Fragment>
                  ))}
               </tbody>
            </table>
         </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{user.role} / Hierarchy Tree</p>
          <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Hierarchy Tree</h2>
        </div>
        <button className="px-8 py-3 bg-[#131241] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1e1c5c] transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Network
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Members', value: stats?.totalMembers || 0, trend: '+12% vs last month', icon: 'users', color: 'blue' },
           { label: 'Active Members', value: stats?.activeMembers || 0, trend: `${((stats?.activeMembers / stats?.totalMembers) * 100 || 0).toFixed(1)}% Activity Rate`, icon: 'user-check', color: 'emerald' },
           { label: 'Total Levels', value: stats?.maxDepth || 0, trend: 'Max depth reached', icon: 'layers', color: 'indigo' },
           { label: 'New Joins', value: stats?.newJoins || 0, trend: 'Last 24 hours', icon: 'user-plus', color: 'rose' },
         ].map((stat, i) => (
           <div key={i} className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
              <div className="flex justify-between items-start mb-6">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                 <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                    {getIcon(stat.icon)}
                 </div>
              </div>
              <h4 className="text-3xl font-black text-white mb-2">{stat.value.toLocaleString()}</h4>
              <p className={`text-[9px] font-bold ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'rose' ? 'text-rose-400' : 'text-slate-500'} uppercase tracking-widest`}>
                 {stat.trend}
              </p>
           </div>
         ))}
      </div>

      {/* Role Distribution Bar */}
      <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 space-y-6">
         <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
               Network Role Distribution
            </h5>
            <div className="flex items-center gap-6">
               {[
                 { label: 'Super Head', count: stats?.roleDistribution?.sh || 0, color: 'bg-blue-500' },
                 { label: 'HBA', count: stats?.roleDistribution?.hba || 0, color: 'bg-indigo-500' },
                 { label: 'HCM', count: stats?.roleDistribution?.hcm || 0, color: 'bg-purple-500' },
                 { label: 'HCC', count: stats?.roleDistribution?.hcc || 0, color: 'bg-cyan-500' },
               ].map((role, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${role.color}`} />
                    <span className="text-[9px] font-bold text-slate-400">{role.label}: <span className="text-white">{role.count.toLocaleString()}</span></span>
                 </div>
               ))}
            </div>
         </div>
         <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
            {['sh', 'hba', 'hcm', 'hcc'].map((role, i) => {
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-cyan-500'];
              const count = stats?.roleDistribution?.[role] || 0;
              const percent = stats?.totalMembers ? (count / stats.totalMembers) * 100 : 0;
              return (
                <div key={i} className={`h-full ${colors[i]} transition-all duration-1000`} style={{ width: `${percent}%` }} />
              );
            })}
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
         <div className="flex-1 min-w-[300px] relative">
            <input 
              type="text"
              placeholder="Search ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131241] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
         </div>
         {['Role'].map((filter) => (
           <div key={filter} className="bg-[#131241] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all group">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filter}: <span className="text-white">All</span></span>
              <svg className="text-slate-600 group-hover:text-white transition-colors" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
           </div>
         ))}
         <div className="flex bg-[#131241] p-1 rounded-2xl border border-white/5 ml-auto">
            <button 
              onClick={expandAll} 
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isAllExpanded 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/10'
              }`}
            >
              Expand All
            </button>
            <button 
              onClick={collapseAll} 
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                !isAllExpanded 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/10'
              }`}
            >
              Collapse All
            </button>
         </div>
      </div>

      {/* Hierarchy Table */}
      <div className="bg-[#131241] rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                     <th className="px-8 py-6">Rank</th>
                     <th className="px-8 py-6">Member Name</th>
                     <th className="px-8 py-6">State</th>
                     <th className="px-8 py-6 text-right">Team Sales</th>
                     <th className="px-8 py-6 text-right">Total Income</th>
                     <th className="px-8 py-6 text-center">Hierarchy</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={8} className="px-8 py-20 text-center text-xs font-black text-slate-600 uppercase tracking-widest animate-pulse">Scanning Network...</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={8} className="px-8 py-20 text-center text-xs font-black text-slate-600 uppercase tracking-widest">No members found in this cluster</td></tr>
                  ) : (
                    members.map((m, i) => {
                      const badge = getRankBadge(i);
                      return (
                        <React.Fragment key={m._id}>
                        <tr className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-8 py-8">
                              {badge ? (
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center relative shadow-lg`}>
                                   <div className="absolute inset-0.5 bg-[#131241] rounded-[10px] flex items-center justify-center overflow-hidden">
                                      <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-20`} />
                                      <span className="text-xl font-black text-white relative z-10">{badge.label}</span>
                                      <div className="absolute -top-1 -right-1">
                                         <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                      </div>
                                   </div>
                                </div>
                              ) : (
                                <span className="text-xs font-black text-slate-600">0{i+1}</span>
                              )}
                           </td>
                           <td className="px-8 py-8">
                              <div>
                                 <p className="text-sm font-black text-white">{m.name}</p>
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <span className="text-blue-400">{m.memberId}</span>
                                    {badge && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px]">{badge.text}</span>}
                                 </p>
                              </div>
                           </td>
                           <td className="px-8 py-8">
                              <span className="text-xs font-bold text-slate-400">{m.state}</span>
                           </td>
                           <td className="px-8 py-8 text-right">
                              <span className="text-xs font-black text-white">{formatCurrency(m.teamSalesValue || 0)}</span>
                           </td>
                           <td className="px-8 py-8 text-right">
                              <span className="text-xs font-black text-blue-400">{formatCurrency((m.teamSalesValue || 0) * 0.02)}</span>
                           </td>
                           <td className="px-8 py-8 text-center">
                              {m.role !== 'hcc' && (
                                <button 
                                  onClick={() => toggleNodeExpand(m)}
                                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto ${
                                    m.isExpanded 
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-400/20' 
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                   {loadingChildren[m._id as string] ? 'Loading...' : m.isExpanded ? 'Hide Hierarchy' : `View ${getNextRole(m.role)}s`}
                                   <svg className={`transition-transform duration-300 ${m.isExpanded ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                              )}
                           </td>
                        </tr>
                        {/* Expanded Children Rows */}
                        {m.isExpanded && renderChildren(m._id as string, 1)}
                        </React.Fragment>
                      );
                    })
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

function getNextRole(current: string) {
  if (current === 'sh') return 'HBA';
  if (current === 'hba') return 'HCM';
  if (current === 'hcm') return 'HCC';
  return 'Team';
}

function getIcon(name: string) {
  const s = { width: 18, height: 18, strokeWidth: 2.5 };
  if (name === 'users') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === 'user-check') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
  if (name === 'layers') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
  if (name === 'user-plus') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>;
  return null;
}
