'use client';

import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';
import { IUser } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api, { walletAPI } from '@/lib/api';
import AddMemberModal from '../dashboard/AddMemberModal';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface DashboardHomeProps {
  user: IUser;
}

export default function DashboardHome({ user }: DashboardHomeProps) {
  const [summary, setSummary] = useState<any>(null);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Hierarchy States
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const [childrenData, setChildrenData] = useState<Record<string, any[]>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});

  // Filter States
  const [period, setPeriod] = useState('mtd');
  const [selectedState, setSelectedState] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<'period' | 'state' | null>(null);

  const searchParams = useSearchParams();

  const STATES = ['all', 'Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Rajasthan', 'Uttar Pradesh'];
  const PERIODS = [
    { label: 'Current Month', value: 'mtd' },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'All Time', value: 'all' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, leadersRes, walletRes] = await Promise.all([
        dashboardAPI.getSummary({ period, state: selectedState }),
        dashboardAPI.getLeaders(),
        walletAPI.getMyWallet()
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (leadersRes.data.success) setLeaders(leadersRes.data.data);
      if (walletRes.data.success) setTransactions(walletRes.data.data?.ledger || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, selectedState]);

  useEffect(() => {
    if (searchParams.get('enroll') === 'true') setIsModalOpen(true);
  }, [searchParams]);

  const toggleHierarchy = async (leaderId: string) => {
    if (expandedLeader === leaderId) {
      setExpandedLeader(null);
      return;
    }
    
    setExpandedLeader(leaderId);
    if (!childrenData[leaderId]) {
      setLoadingChildren(prev => ({ ...prev, [leaderId]: true }));
      try {
        const res = await api.get(`/team/members?parentId=${leaderId}`);
        if (res.data.success) {
          setChildrenData(prev => ({ ...prev, [leaderId]: res.data.data }));
        }
      } catch (err) {
        console.error('Hierarchy fetch error:', err);
      } finally {
        setLoadingChildren(prev => ({ ...prev, [leaderId]: false }));
      }
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '01', color: 'from-amber-400 to-orange-600', text: 'STATE LEADER' };
    if (index === 1) return { label: '02', color: 'from-slate-300 to-slate-500', text: 'TOP PERFORMER' };
    if (index === 2) return { label: '03', color: 'from-amber-600 to-amber-800', text: 'RISING STAR' };
    return null;
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100); // Fixed: prices are in paise
  };

  const COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#06b6d4'];

  const roleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'sh': return 'State Head';
      case 'hba': return 'HBA Associate';
      case 'hcm': return 'HCM Manager';
      case 'hcc': return 'Consultant';
      default: return role;
    }
  };

  const handleExport = () => {
    if (!leaders || leaders.length === 0) return;
    
    const headers = ['Rank', 'Name', 'Member ID', 'State', 'Directs', 'Team Sales', 'Income'];
    const rows = leaders.map((l, i) => [
      i + 1,
      l.name,
      l.memberId,
      l.state,
      l.directCount,
      l.teamSalesValue,
      l.totalIncome
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CureBharat_Leaders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">Welcome Back, {user.name}</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Performance Overview & Business Analytics</p>
        </div>
        <div className="flex items-center gap-3">
           {/* Period Filter */}
           <div className="relative">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'period' ? null : 'period')}
                className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Period: <span className="text-slate-900">{PERIODS.find(p => p.value === period)?.label}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {activeDropdown === 'period' && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                  {PERIODS.map((p) => (
                    <div 
                      key={p.value}
                      onClick={() => { setPeriod(p.value); setActiveDropdown(null); }}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {p.label}
                    </div>
                  ))}
                </div>
              )}
           </div>

           {/* State Filter */}
           <div className="relative">
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'state' ? null : 'state')}
                className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  State: <span className="text-slate-900">{selectedState === 'all' ? 'All States' : selectedState}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {activeDropdown === 'state' && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
                  {STATES.map((s) => (
                    <div 
                      key={s}
                      onClick={() => { setSelectedState(s); setActiveDropdown(null); }}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {s === 'all' ? 'All States' : s}
                    </div>
                  ))}
                </div>
              )}
           </div>

           <button 
             onClick={fetchData}
             className="p-3 bg-[#131241] text-white rounded-2xl shadow-lg shadow-blue-900/20 hover:scale-105 transition-all active:scale-95"
           >
              <svg className={loading ? 'animate-spin' : ''} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-8 py-3 cb-gradient text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shadow-cb-teal/20"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              Enroll Member
           </button>
           <button 
             onClick={handleExport}
             className="px-8 py-3 bg-[#131241] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1e1c5c] transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
           </button>
        </div>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        currentUser={user} 
        onSuccess={() => {
           // Refresh leaders
           dashboardAPI.getLeaders().then(res => {
             if (res.data.success) setLeaders(res.data.data);
           });
        }} 
      />

      
      {/* Sales Gateway removed from here */}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
         {[
           { label: 'Total Users', value: summary?.metrics?.totalUsers || 0, icon: 'users', color: 'blue' },
           { label: 'Active Users', value: summary?.metrics?.activeUsers || 0, icon: 'user-check', color: 'emerald' },
           { label: 'Inactive Users', value: summary?.metrics?.inactiveUsers || 0, icon: 'user-x', color: 'slate' },
           { label: 'Total Sales', value: formatCurrency(summary?.metrics?.totalRevenue || 0), icon: 'trending-up', color: 'indigo' },
           { label: 'FTD Revenue', value: formatCurrency(summary?.metrics?.ftdRevenue || 0), icon: 'zap', color: 'amber', sub: 'Today' },
           { label: 'MTD Revenue', value: formatCurrency(summary?.metrics?.mtdRevenue || 0), icon: 'calendar', color: 'rose', sub: 'Month' },
         ].map((stat, i) => (
           <div key={i} className="bg-[#131241] rounded-3xl p-6 shadow-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                {stat.label}
                {stat.sub && <span className="bg-white/5 px-2 py-0.5 rounded text-[7px] text-white/40">{stat.sub}</span>}
              </p>
              <h4 className="text-xl font-black text-white mb-1 truncate">{stat.value}</h4>
              <div className={`h-1 w-12 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'emerald' ? 'bg-emerald-500' :
                stat.color === 'indigo' ? 'bg-indigo-500' :
                stat.color === 'amber' ? 'bg-amber-500' :
                stat.color === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
              } opacity-40 group-hover:opacity-100 transition-opacity`} />
           </div>
         ))}
      </div>

      {/* Dynamic Sales Gateway Hub - Balanced Position */}
      <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#131241] to-[#49D2B5] rounded-[32px] blur-lg opacity-10 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#49D2B5]/5 blur-[100px] -mr-40 -mt-40" />
             
             <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#131241] to-[#49D2B5] flex items-center justify-center shadow-lg shadow-[#49D2B5]/20">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                   </div>
                  <div>
                     <h3 className="text-xl font-black text-white tracking-tight">Your Referral Gateway</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Unlock 40% Commission on Direct Referrals</p>
                  </div>
               </div>

               <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full px-6 py-4 bg-black/40 rounded-xl border border-white/5 flex items-center overflow-hidden">
                     <code className="text-[#49D2B5] font-bold text-xs truncate flex-1">
                        {typeof window !== 'undefined' ? `${window.location.origin}/buy/${user.memberId}` : `buy/${user.memberId}`}
                     </code>
                     <button 
                        onClick={() => {
                           const link = `${window.location.origin}/buy/${user.memberId}`;
                           navigator.clipboard.writeText(link);
                        }}
                        className="ml-4 text-slate-500 hover:text-[#49D2B5] transition-colors"
                     >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                     </button>
                  </div>
                  <button 
                     onClick={() => {
                        const link = `${window.location.origin}/buy/${user.memberId}`;
                        const text = `Hi! Check out CureBharat Wellness: ${link}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                     }}
                     className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                  >
                     <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.657 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                     Share Link
                  </button>
               </div>
            </div>
         </div>
      </div>


      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* State Contribution */}
        <div className="lg:col-span-3 bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col">
           <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              State Contribution
           </h5>
           <div className="space-y-8 flex-1">
              {summary?.stateContribution?.map((s: any, i: number) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                      <span className="text-white">{s.state}</span>
                      <span className="text-slate-400">{formatCurrency(s.revenue)}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(s.revenue / summary.metrics.mtdRevenue) * 100}%` }} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Revenue Trends */}
        <div className="lg:col-span-6 bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5">
           <div className="flex items-center justify-between mb-8">
              <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 Revenue Trends
              </h5>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black">+12.5% vs Last Mo</span>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary?.revenueTrends}>
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight={800} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#131241', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: 800, color: 'white' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  >
                    {summary?.revenueTrends?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#3b82f6' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Role Distribution */}
        <div className="lg:col-span-3 bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col">
           <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Role Distribution
           </h5>
           <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                  >
                    {summary?.roleDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                 <h6 className="text-2xl font-black text-white">{summary?.metrics?.totalUsers}</h6>
              </div>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-4">
              {summary?.roleDistribution?.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{r.role} ({r.count})</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Activity Pulse & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#131241] rounded-[40px] p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-700" />
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               Network Activity Pulse
            </h5>
            <div className="space-y-10">
               <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                     <span>Monthly Sales Velocity</span>
                     <span className="text-white">
                        {Math.min(100, Math.round(((summary?.metrics?.mtdRevenue || 0) / 10000000) * 100))}%
                     </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.round(((summary?.metrics?.mtdRevenue || 0) / 10000000) * 100))}%` }} 
                     />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                     <span>Active Member Ratio</span>
                     <span className="text-white">
                        {summary?.metrics?.totalUsers > 0 ? Math.round((summary?.metrics?.activeUsers / summary?.metrics?.totalUsers) * 100) : 0}%
                     </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-400 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-1000" 
                        style={{ width: `${summary?.metrics?.totalUsers > 0 ? Math.round((summary?.metrics?.activeUsers / summary?.metrics?.totalUsers) * 100) : 0}%` }} 
                     />
                  </div>
               </div>
            </div>
            <div className="mt-10 p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group-hover:bg-white/[0.05] transition-all">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
               </div>
               <p className="text-[11px] font-bold text-slate-400">Current cycle activity is on track for payout and promotion review.</p>
            </div>
         </div>

         <div className="bg-[#131241] rounded-[40px] p-10 shadow-2xl border border-white/5 flex flex-col justify-between">
            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
               Quick Business Actions
            </h5>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Register New', sub: 'Add Downline', icon: 'user-plus', color: 'blue', href: '/sh?enroll=true', action: () => setIsModalOpen(true) },
                 { 
                   label: 'Process Sale', 
                   sub: 'New Policy', 
                   icon: 'zap', 
                   color: 'amber', 
                   href: user.role === 'admin' ? '/admin/customers' : `/${user.role}/sales/new` 
                 },
                 { 
                   label: 'Wallet Ledger', 
                   sub: 'Financials', 
                   icon: 'wallet', 
                   color: 'indigo', 
                   href: user.role === 'admin' ? '/admin/wallet-ledger' : `/${user.role}/finance` 
                 },
                 { 
                   label: 'Team Map', 
                   sub: 'Genealogy', 
                   icon: 'git-branch', 
                   color: 'purple', 
                   href: user.role === 'admin' ? '/admin/hierarchy' : `/${user.role}/team` 
                 },
               ].map((item, i) => (
                 <Link 
                   key={i} 
                   href={item.href}
                   onClick={(e) => { if(item.action) { e.preventDefault(); item.action(); } }}
                   className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-white/[0.05] hover:border-white/10 transition-all group block"
                 >
                    <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 mb-4 group-hover:scale-110 transition-transform`}>
                       {getIcon(item.icon, 'currentColor')}
                    </div>
                    <p className="text-xs font-black text-white mb-1">{item.label}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.sub}</p>
                 </Link>
               ))}
            </div>
         </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-[#131241] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
         <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Top 10 {roleLabel(getNextRole(user.role))}s (By Earnings)</h3>
            </div>
            <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">View Rankings</button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                     <th className="px-10 py-6">Rank</th>
                     <th className="px-10 py-6">{getNextRole(user.role)} Name</th>
                     <th className="px-10 py-6">State</th>
                     <th className="px-10 py-6">Direct {getNextRole(getNextRole(user.role))}s</th>
                     <th className="px-10 py-6 text-right">Team Sales</th>
                     <th className="px-10 py-6 text-right">Override (2%)</th>
                     <th className="px-10 py-6 text-right">Total Income</th>
                     <th className="px-10 py-6 text-center">Hierarchy</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {leaders.map((leader, i) => {
                    const badge = getRankBadge(i);
                    return (
                      <React.Fragment key={leader._id}>
                        <tr className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-10 py-8">
                              {badge ? (
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center relative shadow-xl scale-90 group-hover:scale-100 transition-transform`}>
                                   <div className="absolute inset-0.5 bg-[#131241] rounded-[14px] flex items-center justify-center overflow-hidden">
                                      <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-20`} />
                                      <span className="text-xl font-black text-white relative z-10">{badge.label}</span>
                                      <div className="absolute -top-1 -right-1">
                                         <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                      </div>
                                   </div>
                                </div>
                              ) : (
                                <span className="text-xs font-black text-slate-600 ml-4">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                              )}
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div>
                                    <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{leader.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{leader.memberId}</span>
                                       {badge && <span className={`bg-gradient-to-r ${badge.color} text-transparent bg-clip-text text-[8px] font-black uppercase tracking-widest`}>{badge.text}</span>}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className="text-xs font-bold text-slate-400">{leader.state}</span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className="text-xs font-black text-white">{leader.directCount}</span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <span className="text-xs font-black text-white">{formatCurrency(leader.teamSalesValue)}</span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <span className="text-xs font-black text-emerald-400">{formatCurrency(leader.overrideValue)}</span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <span className="text-xs font-black text-blue-400">{formatCurrency(leader.totalIncome)}</span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <button 
                                onClick={() => toggleHierarchy(leader._id)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto ${
                                  expandedLeader === leader._id 
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                 {expandedLeader === leader._id ? 'Hide Hierarchy' : 'View Hierarchy'}
                                 <svg className={`transition-transform duration-300 ${expandedLeader === leader._id ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                           </td>
                        </tr>
                        {expandedLeader === leader._id && (
                          <tr>
                            <td colSpan={8} className="px-6 py-0">
                               <div className="my-3 bg-[#0d0f1a] border border-blue-500/20 rounded-2xl overflow-hidden">
                                 {/* Header */}
                                 <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/10 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                   <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">
                                     Downline of {leader.name}
                                   </span>
                                 </div>
                                 
                                 {loadingChildren[leader._id] ? (
                                   <div className="flex items-center gap-3 px-6 py-6">
                                     <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fetching Hierarchy Data...</p>
                                   </div>
                                 ) : !childrenData[leader._id]?.length ? (
                                   <div className="px-6 py-8 text-center">
                                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No direct downline found</p>
                                   </div>
                                 ) : (
                                   <table className="w-full text-left">
                                      <thead>
                                         <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/5">
                                            <th className="px-6 py-4">Member Name</th>
                                            <th className="px-4 py-4">Role</th>
                                            <th className="px-4 py-4">State</th>
                                            <th className="px-4 py-4 text-right">Team Sales</th>
                                            <th className="px-4 py-4 text-center">Action</th>
                                         </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/[0.04]">
                                         {childrenData[leader._id].map((child: any) => (
                                           <tr key={child._id} className="hover:bg-white/[0.03] transition-colors">
                                              <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-300 flex-shrink-0">
                                                    {child.name?.[0]?.toUpperCase() || '?'}
                                                  </div>
                                                  <div>
                                                     <p className="text-[11px] font-black text-white">{child.name}</p>
                                                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{child.memberId}</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-4 py-4">
                                                <span className="text-[9px] font-black text-blue-300 uppercase bg-blue-500/10 px-2 py-1 rounded-lg">{child.role?.toUpperCase()}</span>
                                              </td>
                                              <td className="px-4 py-4 text-[11px] text-slate-400 font-bold">{child.state || '—'}</td>
                                              <td className="px-4 py-4 text-[11px] font-black text-white text-right">{formatCurrency(child.teamSalesValue || 0)}</td>
                                              <td className="px-4 py-4 text-center">
                                                 <button 
                                                   onClick={() => toggleHierarchy(child._id)}
                                                   className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                                                 >
                                                   Expand
                                                 </button>
                                              </td>
                                           </tr>
                                         ))}
                                      </tbody>
                                   </table>
                                 )}
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Admin Specific: Pending Withdrawals */}
      {user.role === 'admin' && summary?.pendingWithdrawals?.length > 0 && (
        <div className="bg-[#131241] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
           <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Pending Withdrawals</h3>
              <div className="flex gap-4">
                 <button className="px-6 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-400/20 hover:bg-blue-600 hover:text-white transition-all">Batch Approve</button>
                 <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">View All</button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                       <th className="px-10 py-6">ID</th>
                       <th className="px-10 py-6">Cycle</th>
                       <th className="px-10 py-6">Role</th>
                       <th className="px-10 py-6 text-right">Amount</th>
                       <th className="px-10 py-6 text-right">TDS</th>
                       <th className="px-10 py-6 text-center">Status</th>
                       <th className="px-10 py-6 text-center">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {summary.pendingWithdrawals.map((w: any) => (
                      <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-10 py-6 text-[10px] font-black text-blue-400 uppercase tracking-widest">#{w._id.slice(-6)}</td>
                         <td className="px-10 py-6 text-[10px] font-black text-white uppercase">{w.cycleMonth}</td>
                         <td className="px-10 py-6 text-[10px] font-bold text-slate-400">{w.user?.role?.toUpperCase()}</td>
                         <td className="px-10 py-6 text-right text-[11px] font-black text-white">{formatCurrency(w.amount)}</td>
                         <td className="px-10 py-6 text-right text-[10px] font-black text-slate-500">{formatCurrency(w.amount * 0.05)}</td>
                         <td className="px-10 py-6 text-center">
                            <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Review</span>
                         </td>
                         <td className="px-10 py-6 text-center">
                            <button className="text-white/40 hover:text-white transition-colors font-black">•••</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Recent Ledger Transactions */}
      <div className="bg-[#131241] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
         <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Recent Transactions</h3>
            <a href={`/${user.role}/finance`} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">View Hub</a>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                     <th className="px-10 py-6">Description</th>
                     <th className="px-10 py-6">Type</th>
                     <th className="px-10 py-6 text-right">Amount</th>
                     <th className="px-10 py-6 text-center">Status</th>
                     <th className="px-10 py-6 text-right">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-10 py-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent ledger activity</td></tr>
                  ) : (
                    transactions.slice(0, 5).map((entry) => (
                      <tr key={entry._id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-10 py-6">
                            <p className="text-[11px] font-black text-white">{entry.description}</p>
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">Ref: #{entry._id.slice(-8)}</p>
                         </td>
                         <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.type}</td>
                         <td className="px-10 py-6 text-right">
                            <span className={`text-[11px] font-black ${entry.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-center">
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                              entry.status === 'final' ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {entry.status}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-[10px] font-black text-slate-500 text-right">{new Date(entry.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function getNextRole(current: string) {
  switch (current.toLowerCase()) {
    case 'admin': return 'SH';
    case 'sh': return 'HBA';
    case 'hba': return 'HCM';
    case 'hcm': return 'HCC';
    case 'hcc': return 'HCC';
    default: return 'Member';
  }
}

function getIcon(name: string, color: string = 'currentColor') {
  const s = { width: 18, height: 18, strokeWidth: 3, stroke: color };
  if (name === 'users') return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === 'user-check') return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
  if (name === 'user-x') return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>;
  if (name === 'trending-up') return <svg {...s} viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  if (name === 'zap') return <svg {...s} viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if (name === 'calendar') return <svg {...s} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === 'user-plus') return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="23" y1="11" x2="15" y2="11"/></svg>;
  if (name === 'wallet') return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>;
  if (name === 'git-branch') return <svg {...s} viewBox="0 0 24 24" fill="none"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>;
  return null;
}
