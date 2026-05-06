'use client';

import { useEffect, useState } from 'react';
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
          limit: 100, // Show a good amount initially 
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
    
    // Add a simple debounce for search
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search, filter]);

  return (
    <DashboardLayout pageTitle="Customer Database">
      <div className="space-y-8 pb-20">
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">NETWORK MANAGEMENT / CUSTOMERS</p>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Customer Records</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search name, mobile or policy ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-80 bg-white border border-slate-200 rounded-2xl px-12 py-3.5 text-sm outline-none focus:border-[#60A5FA] transition-all shadow-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm font-bold outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE ONLY</option>
              <option value="pending">PENDING ONLY</option>
              <option value="lapsed">LAPSED ONLY</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                       <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Details</th>
                       <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sold By</th>
                       <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Join Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</div>
                        </td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No customer records found matching your search</td></tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">{c.customerName[0]}</div>
                                 <div>
                                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#60A5FA] transition-colors">{c.customerName}</div>
                                    <div className="text-[10px] font-bold text-slate-400">{c.customerMobile}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-5">
                              <div className="text-sm font-bold text-slate-700">{(c.plan as any)?.name || 'Unknown Plan'}</div>
                              <div className="text-[10px] font-mono text-[#60A5FA] font-bold mt-0.5">{c.policyId}</div>
                           </td>
                           <td className="px-4 py-5">
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                 <span className="text-xs font-bold text-slate-600">{(c.hccId as any)?.name || 'Unknown'}</span>
                              </div>
                           </td>
                           <td className="px-4 py-5 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                c.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                                c.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <div className="text-xs font-bold text-slate-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InsightCard label="Total Customers" value={total.toLocaleString()} icon="users" color="text-blue-500" />
           <InsightCard label="Active Policies" value={customers.filter(c => c.status === 'active').length.toLocaleString()} icon="trending-up" color="text-emerald-500" />
           <InsightCard label="Pending Policies" value={customers.filter(c => c.status === 'pending').length.toLocaleString()} icon="award" color="text-amber-500" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function InsightCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-2xl font-bold text-slate-900 font-display">{value}</p>
       </div>
       <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}>
          {icon === 'users' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          {icon === 'trending-up' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
          {icon === 'award' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>}
       </div>
    </div>
  );
}
