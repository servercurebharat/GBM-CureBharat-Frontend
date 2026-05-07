'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI } from '@/lib/api';
import { ISale } from '@/types';
import { toast } from 'react-hot-toast';

export default function SalesHistory() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await salesAPI.getAll({ page: 1, limit: 100 });
        if (res.data.success) {
          setSales(res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load sales history');
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  return (
    <DashboardLayout pageTitle="My Sales History">
      <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-2xl border border-white/5">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sales History</h2>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Full transaction ledger</p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Sales: </span>
             <span className="text-xs font-bold text-white ml-1">{sales.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-4 py-5">Policy ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Plan Amount</th>
                <th className="px-4 py-4">Direct Earnings</th>
                <th className="px-4 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-8"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                    No policies issued yet ✨
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-6">
                       <span className="text-xs font-mono font-bold text-hcc">{sale.policyId}</span>
                    </td>
                    <td className="px-4 py-6">
                      <div className="text-sm font-bold text-white">{sale.customerName}</div>
                      <div className="text-[10px] text-white/40 font-medium uppercase">{sale.plan.name}</div>
                    </td>
                    <td className="px-4 py-6 text-xs text-slate-500 font-bold uppercase">
                      {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-6 text-sm font-bold text-slate-800">
                      ₹{(sale.saleAmount / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-6 text-sm font-black text-sh">
                      + ₹{((sale.businessVolume * 0.4) / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-sh/10 text-sh border border-sh/20">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
