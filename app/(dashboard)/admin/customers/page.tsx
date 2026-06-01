'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI } from '@/lib/api';
import { ISale } from '@/types';

export default function CustomerDatabase() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        const res = await salesAPI.getAll({ 
          page: 1, 
          limit: 100,
          search, 
          status: filter === 'all' ? undefined : filter 
        });
        if (res.data.success) {
          setCustomers(res.data.data || []);
          setTotal(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search, filter]);

  const handleExport = () => {
    if (!customers || customers.length === 0) return;
    
    const headers = ['Customer Name', 'Mobile', 'Email', 'State', 'DOB', 'PAN No', 'Policy ID', 'Plan', 'Sold By (ID)', 'Status', 'Join Date', 'Nominee Name', 'Nominee Relation'];
    const rows = customers.map(c => [
      `"${c.customerName || ''}"`,
      c.customerMobile,
      c.customerEmail || '',
      c.customerState || '',
      c.customerDOB || '',
      c.customerPAN || '',
      c.policyId,
      `"${(c.plan as any)?.name || 'Health Plan'}"`,
      (c.seller as any)?.memberId || '',
      c.status,
      new Date(c.createdAt).toLocaleDateString(),
      `"${c.nomineeName || ''}"`,
      c.nomineeRelation || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CureBharat_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    return {
      total: total,
      active: customers.filter(c => c.status === 'active').length,
      cancelled: customers.filter(c => c.status === 'cancelled').length,
    };
  }, [customers, total]);

  return (
    <DashboardLayout pageTitle="Customer Database">
      <div className="space-y-8 pb-20">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
           <KpiCard label="Total Customers" value={stats.total.toLocaleString()} sub="Lifetime base" icon="users" color="blue" />
           <KpiCard label="Active Policies" value={stats.active.toLocaleString()} sub="Currently live" icon="check-circle" color="emerald" />
           <KpiCard label="Cancelled" value={stats.cancelled.toLocaleString()} sub="Terminated" icon="x-circle" color="red" />
           <KpiCard label="New This Month" value="124" sub="+12.5% vs last" icon="trending-up" color="purple" />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#131241] p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 animate-slide-up">
           <div className="relative w-full lg:max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search by Name, Mobile or Policy ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
           </div>
           
           <div className="flex gap-4 w-full lg:w-auto">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 lg:w-48 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none cursor-pointer hover:bg-white/10 transition-all uppercase tracking-widest appearance-none"
              >
                <option value="all" className="bg-[#131241] text-white">All Status</option>
                <option value="active" className="bg-[#131241]">Active</option>
                <option value="cancelled" className="bg-[#131241]">Cancelled</option>
              </select>
              <button 
                onClick={handleExport}
                className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
              >
                Export CSV
              </button>
           </div>
        </div>

        {/* Main Database Table */}
        <div className="bg-[#131241] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-slide-up">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                       <th className="px-8 py-6">CUSTOMER DETAILS</th>
                       <th className="px-4 py-6">POLICY / PLAN</th>
                       <th className="px-4 py-6">SOLD BY</th>
                       <th className="px-4 py-6 text-center">STATUS</th>
                       <th className="px-8 py-6 text-right">ENROLLMENT</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-8 py-8"><div className="h-6 bg-white/5 rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                           <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                           </div>
                           <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">No records found matching your criteria</p>
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} className="hover:bg-white/[0.02] transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-white/10 flex items-center justify-center text-blue-400 font-black text-lg">
                                    {c.customerName[0]}
                                 </div>
                                 <div>
                                    <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{c.customerName}</div>
                                    <div className="text-[10px] font-bold text-white/30 tracking-widest mt-0.5">{c.customerMobile}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-6">
                              <div className="text-[11px] font-black text-white/80 uppercase tracking-wider">{(c.plan as any)?.name || 'Health Policy'}</div>
                              <div className="text-[10px] font-bold text-blue-500/50 tracking-tighter mt-1">{c.policyId}</div>
                           </td>
                           <td className="px-4 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                                    {((c.seller as any)?.name || 'S')[0]}
                                 </div>
                                 <div>
                                    <div className="text-[10px] font-black text-white/60 uppercase tracking-tight">{(c.seller as any)?.name || 'Direct'}</div>
                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter mt-0.5">ID: {(c.seller as any)?.memberId}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-6 text-center">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                                c.status === 'active' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 
                                'text-red-400 border-red-400/20 bg-red-400/5'
                              }`}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="text-[11px] font-black text-white/60">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                              <div className="text-[9px] font-bold text-white/10 uppercase tracking-tighter mt-1">Enrollment Date</div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
           
           {/* Pagination Footer */}
           <div className="px-8 py-6 flex items-center justify-between border-t border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Showing {customers.length} of {total} records</p>
              <div className="flex gap-2">
                 <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all opacity-50 cursor-not-allowed">Previous</button>
                 <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">Next Page</button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ label, value, sub, icon, color }: any) {
  const colorMap: any = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className="bg-[#131241] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-white/10 transition-all">
       <div className="flex justify-between items-start mb-6">
          <div>
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{label}</p>
             <h2 className="text-3xl font-black text-white tracking-tight">{value}</h2>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
             <Icon name={icon} />
          </div>
       </div>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const s = { width: 20, height: 20, strokeWidth: 3, stroke: 'currentColor' };
  switch (name) {
    case 'users': return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'check-circle': return <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'x-circle': return <svg {...s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
    case 'trending-up': return <svg {...s} viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    default: return null;
  }
}

