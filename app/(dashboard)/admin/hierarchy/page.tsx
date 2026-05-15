'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, usersAPI } from '@/lib/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip 
} from 'recharts';

export default function AdminHierarchyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Hierarchy...</div>}>
      <HierarchyContent />
    </Suspense>
  );
}

function HierarchyContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [roots, setRoots] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [expandAll, setExpandAll] = useState(!!initialSearch);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [treeRes, statsRes] = await Promise.all([
          adminAPI.getTree(),
          usersAPI.getStats()
        ]);
        if (treeRes.data.success) setRoots(treeRes.data.data || []);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch tree data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTree = useMemo(() => {
    if (!search && roleFilter === 'All' && statusFilter === 'All' && stateFilter === 'All') return roots;

    const filterNode = (node: any): any => {
      const matchesSearch = !search || 
        node.name.toLowerCase().includes(search.toLowerCase()) || 
        node.memberId.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || node.role.toUpperCase() === roleFilter.toUpperCase();
      const matchesStatus = statusFilter === 'All' || node.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesState = stateFilter === 'All' || node.state === stateFilter;

      const filteredChildren = node.children ? node.children.map(filterNode).filter((n: any) => n !== null) : [];
      
      if (matchesSearch && matchesRole && matchesStatus && matchesState) {
        return { ...node, children: node.children }; // Keep original children for display if node matches
      }
      
      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren }; // Keep node if children match
      }

      return null;
    };

    return roots.map(filterNode).filter(n => n !== null);
  }, [roots, search, roleFilter, statusFilter, stateFilter]);

  const distributionData = useMemo(() => {
    if (!stats?.roleDistribution) return [
      { name: 'Super Head', value: 0, color: '#10b981' },
      { name: 'HBA', value: 0, color: '#8b7cf8' },
      { name: 'HCM', value: 0, color: '#f59e0b' },
      { name: 'HCC', value: 0, color: '#06b6d4' },
    ];
    return [
      { name: 'SH', value: stats.roleDistribution.sh || 0, color: '#10b981' },
      { name: 'HBA', value: stats.roleDistribution.hba || 0, color: '#8b7cf8' },
      { name: 'HCM', value: stats.roleDistribution.hcm || 0, color: '#f59e0b' },
      { name: 'HCC', value: stats.roleDistribution.hcc || 0, color: '#06b6d4' },
    ];
  }, [stats]);

  const depthData = [
    { range: 'L1 - L3', count: Math.round((stats?.totalUsers || 0) * 0.4) },
    { range: 'L4 - L7', count: Math.round((stats?.totalUsers || 0) * 0.3) },
    { range: 'L8 - L12', count: Math.round((stats?.totalUsers || 0) * 0.2) },
    { range: 'L13 - L15', count: Math.round((stats?.totalUsers || 0) * 0.1) },
  ];

  return (
    <DashboardLayout pageTitle="Hierarchy Tree">
      <div className="space-y-8 pb-20">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            label="TOTAL MEMBERS" 
            value={stats ? stats.totalUsers.toLocaleString() : '0'} 
            sub="+12% vs last month" 
            icon="users" 
            color="blue" 
          />
          <KpiCard 
            label="ACTIVE MEMBERS" 
            value={stats ? stats.activeUsers.toLocaleString() : '0'} 
            sub={`${stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% Activity Rate`} 
            icon="user-check" 
            color="emerald" 
          />
          <KpiCard 
            label="TOTAL LEVELS" 
            value="15" 
            sub="Max depth reached" 
            icon="layers" 
            color="purple" 
          />
          <KpiCard 
            label="NEW JOINS" 
            value={stats ? Math.round(stats.totalUsers * 0.05).toLocaleString() : '0'} 
            sub="Last 24 hours" 
            icon="user-plus" 
            color="amber" 
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-[#131241] p-4 rounded-2xl shadow-xl border border-white/5 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
             <input 
               type="text" 
               placeholder="Search ID or Name..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-#10b981 transition-all"
             />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-#10b981/50 min-w-[140px] appearance-none cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="All" className="bg-[#131241] text-white">Role: All</option>
            <option value="SH" className="bg-[#131241] text-white">SH</option>
            <option value="HBA" className="bg-[#131241] text-white">HBA</option>
            <option value="HCM" className="bg-[#131241] text-white">HCM</option>
            <option value="HCC" className="bg-[#131241] text-white">HCC</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-#10b981/50 min-w-[140px] appearance-none cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="All" className="bg-[#131241] text-white">Status: All</option>
            <option value="active" className="bg-[#131241] text-white">Active</option>
            <option value="inactive" className="bg-[#131241] text-white">Inactive</option>
          </select>

          <select 
            value={stateFilter} 
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-#10b981/50 min-w-[140px] appearance-none cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="All" className="bg-[#131241] text-white">State: All</option>
            <option value="Maharashtra" className="bg-[#131241] text-white">Maharashtra</option>
            <option value="Gujarat" className="bg-[#131241] text-white">Gujarat</option>
            <option value="Delhi" className="bg-[#131241] text-white">Delhi</option>
          </select>
          <div className="flex gap-2">
             <button 
               onClick={() => setExpandAll(true)}
               className="bg-#10b981 px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-#10b981 transition-all"
             >
                Expand All
             </button>
             <button 
               onClick={() => setExpandAll(false)}
               className="bg-white/10 px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all"
             >
                Collapse All
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Tree List */}
          <div className="lg:col-span-9 bg-[#131241] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[600px]">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                         <th className="px-8 py-6">MEMBER / LEVEL</th>
                         <th className="px-4 py-6">ROLE</th>
                         <th className="px-4 py-6">LOCATION</th>
                         <th className="px-4 py-6">SALES (₹)</th>
                         <th className="px-4 py-6 text-right">INCOME (₹)</th>
                         <th className="px-4 py-6 text-center">STATUS</th>
                         <th className="px-8 py-6 text-center">ACTION</th>
                      </tr>
                   </thead>
                   <tbody>
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse border-b border-white/5">
                             <td colSpan={7} className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                          </tr>
                        ))
                      ) : filteredTree.length === 0 ? (
                        <tr>
                           <td colSpan={7} className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest">No matching members found</td>
                        </tr>
                      ) : filteredTree.map(root => (
                        <TreeNode key={root._id} node={root} level={0} forceExpand={expandAll} />
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-8">
             {/* Network Distribution */}
             <div className="bg-[#131241] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Network Distribution</h3>
                <div className="h-48 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={distributionData}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-white">{stats ? Math.round((stats.roleDistribution.hba / stats.totalUsers) * 100) : 0}%</span>
                      <span className="text-[8px] font-black text-white/30 uppercase">HBA TIER</span>
                   </div>
                </div>
                <div className="mt-8 space-y-4">
                   {distributionData.map((item) => (
                     <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                           <span className="text-white/40">{item.name}</span>
                        </div>
                        <span className="text-white">{item.value.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Depth vs Count */}
             <div className="bg-[#131241] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Depth vs Count</h3>
                <div className="space-y-6">
                   {depthData.map((item) => (
                     <div key={item.range} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-white/40">{item.range}</span>
                           <span className="text-white">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-#10b981 rounded-full" 
                             style={{ width: `${stats ? (item.count / stats.totalUsers) * 100 : 0}%` }} 
                           />
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

function KpiCard({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-[#131241] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
       <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${color}-500/10 transition-colors`} />
       <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
          <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
             <Icon name={icon} />
          </div>
       </div>
       <h2 className="text-3xl font-black text-white mb-2">{value}</h2>
       <p className={`text-[10px] font-bold ${color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'} uppercase tracking-widest`}>{sub}</p>
    </div>
  );
}

function TreeNode({ node, level, forceExpand }: { node: any, level: number, forceExpand?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsExpanded(forceExpand);
    }
  }, [forceExpand]);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <tr className={`group transition-all duration-300 border-b border-white/[0.03] ${isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.05]'}`}>
        <td className="px-8 py-5">
           <div className="flex items-center gap-6" style={{ paddingLeft: `${level * 32}px` }}>
              <div className="flex items-center gap-3 min-w-[32px]">
                {hasChildren ? (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isExpanded 
                      ? 'bg-#10b981 text-white shadow-lg shadow-#10b981/30' 
                      : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <svg 
                      className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
                 <div className={`w-12 h-12 rounded-2xl p-0.5 border-2 transition-all duration-300 ${
                   isExpanded ? 'border-#10b981 shadow-lg shadow-#10b981/20 scale-110' : 'border-white/10 group-hover:border-white/20'
                 }`}>
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#1a194d]">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${node.name}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <div className="text-[13px] font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{node.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[9px] font-bold text-white/20 tracking-widest uppercase">ID: {node.memberId}</span>
                       <span className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="text-[8px] font-black text-#10b981/50 uppercase tracking-tighter">LVL {level}</span>
                    </div>
                 </div>
              </div>
           </div>
        </td>
        <td className="px-4 py-5">
           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300 ${
             node.role === 'admin' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5 shadow-[0_0_15px_rgba(96,165,250,0.1)]' :
             node.role === 'sh' ? 'text-[#8b7cf8] border-[#8b7cf8]/30 bg-[#8b7cf8]/5' :
             node.role === 'hba' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' :
             node.role === 'hcm' ? 'text-amber-500 border-amber-500/30 bg-amber-500/5' :
             'text-cyan-400 border-cyan-400/30 bg-cyan-400/5'
           }`}>
              {node.role?.toUpperCase()}
           </span>
        </td>
        <td className="px-4 py-5">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{node.state || 'Maharashtra'}</span>
              <span className="text-[8px] font-bold text-white/10 uppercase tracking-tighter">Western Region</span>
           </div>
        </td>
        <td className="px-4 py-5">
           <span className="text-[11px] font-black text-white/40 tabular-nums tracking-tight">₹0</span>
        </td>
        <td className="px-4 py-5 text-right">
           <span className="text-[11px] font-black text-white tabular-nums tracking-tight">₹0</span>
        </td>
        <td className="px-4 py-5 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05]">
              <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-500'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${node.status === 'active' ? 'text-emerald-400/70' : 'text-white/20'}`}>{node.status}</span>
           </div>
        </td>
        <td className="px-8 py-5 text-center">
           <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-400/10 transition-all border border-white/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
           </button>
        </td>
      </tr>
      {isExpanded && hasChildren && node.children.map((child: any) => (
        <TreeNode key={child._id} node={child} level={level + 1} forceExpand={forceExpand} />
      ))}
    </>
  );
}

function Icon({ name }: { name: string }) {
  const s = { width: 18, height: 18, strokeWidth: 3, stroke: 'currentColor' };
  switch (name) {
    case 'users': return <svg {...s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'user-check': return <svg {...s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
    case 'layers': return <svg {...s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
    case 'user-plus': return <svg {...s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="23" y1="11" x2="15" y2="11"/></svg>;
    default: return null;
  }
}


