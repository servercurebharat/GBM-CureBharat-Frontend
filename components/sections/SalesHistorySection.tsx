'use client';

import { useState, useEffect } from 'react';
import { salesAPI } from '@/lib/api';
import { ISale, IUser } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';
import { exportToCSV } from '@/lib/utils/export';

export default function SalesHistorySection({ user }: { user: IUser }) {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await salesAPI.getAll({ page, limit });
        if (res.data.success) {
          setSales(res.data.data);
          setTotal(res.data.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [page]);

  const handleExport = () => {
    if (!sales || sales.length === 0) return;
    
    const headers = ['Policy ID', 'Date', 'Customer Name', 'Mobile', 'Plan', 'Amount', 'Status'];
    const rows = sales.map(s => [
      s.policyId,
      new Date(s.createdAt).toLocaleDateString(),
      s.customerName,
      s.customerMobile,
      (s.plan as any)?.name || 'Health Plan',
      s.saleAmount / 100,
      s.status.toUpperCase()
    ]);

    exportToCSV(headers, rows, 'CureBharat_Sales_History');
  };

  const color = ROLE_COLORS[user.role] || '#60A5FA';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Personal Sales', value: user.personalSalesCount.toString() },
          { label: 'Active Policies', value: total.toString() },
          { label: 'Monthly Growth', value: '+12.5%', isTrend: true },
          { label: 'Customer Satisfaction', value: '98%', isTrend: true },
        ].map((stat, i) => (
          <div key={i} className="bg-[#131241] border border-white/5 p-6 rounded-[24px] shadow-xl">
             <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest mb-4">{stat.label}</p>
             <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                {stat.isTrend && <span className="text-[10px] text-emerald-400 font-bold">↑</span>}
             </div>
          </div>
        ))}
      </div>

      {/* Main Ledger Area */}
      <div className="bg-[#131241] rounded-[32px] shadow-2xl border border-white/5 flex flex-col min-h-[600px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>
              <p className="text-[9px] text-[#B5B8BD] font-bold uppercase tracking-widest mt-1 opacity-50">Authorized Sales History</p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={handleExport}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Export CSV
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-white/5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Policy ID / Date</th>
                    <th className="px-8 py-5">Customer Details</th>
                    <th className="px-8 py-5">Plan Detail</th>
                    <th className="px-8 py-5 text-right">Premium Paid</th>
                    <th className="px-8 py-5 text-center">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                 {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${color}40`, borderTopColor: color }} />
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-4">Syncing Ledger...</p>
                      </td>
                    </tr>
                 ) : sales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="text-4xl mb-4 opacity-20">📂</div>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">No transactions found</p>
                      </td>
                    </tr>
                 ) : (
                    sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-white/1 transition-colors group">
                         <td className="px-8 py-6">
                            <p className="text-xs font-bold text-white group-hover:text-[#60A5FA] transition-colors">{sale.policyId}</p>
                            <p className="text-[9px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">
                              {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#B5B8BD]">
                                  {sale.customerName.substring(0, 2).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-white">{sale.customerName}</p>
                                  <p className="text-[9px] text-[#64748B] font-bold mt-0.5 tracking-tighter">+91 {sale.customerMobile}</p>
                                </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-md uppercase tracking-widest border border-indigo-400/20">
                               {(sale.plan as any)?.name}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <p className="text-sm font-black text-white">₹{(sale.saleAmount / 100).toLocaleString('en-IN')}</p>
                            <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">INCL. GST</p>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${
                              sale.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {sale.status}
                            </span>
                         </td>
                      </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             Showing <span className="text-white">{(page-1)*limit + 1}-{Math.min(page*limit, total)}</span> of <span className="text-white">{total}</span> records
           </p>
           <div className="flex gap-3">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="flex items-center px-4 bg-white/5 border border-white/10 rounded-xl">
                 <span className="text-xs font-black text-white">{page}</span>
              </div>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
