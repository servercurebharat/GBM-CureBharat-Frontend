'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { usersAPI, salesAPI, walletAPI } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingKYC: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, salesRes] = await Promise.all([
          usersAPI.getAll({ limit: 1 }),
          salesAPI.getAll({ limit: 1 })
        ]);

        setStats({
          totalMembers: usersRes.data.pagination.total || 0,
          totalSales: salesRes.data.pagination.total || 0,
          totalRevenue: 0, // In production, sum saleAmount
          pendingKYC: 0 // Fetch count where kycStatus is pending
        });
      } catch (err) {
        console.error('Admin stats fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const color = '#8b7cf8'; // Admin Purple

  return (
    <DashboardLayout pageTitle="System Administration">
      <div className="space-y-8 pb-10">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">System Health Overview</h2>
            <p className="text-sm text-muted mt-1 font-medium">Real-time monitoring of members, sales, and platform infrastructure</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 rounded-xl bg-admin/10 border border-admin/20 text-admin text-xs font-bold uppercase tracking-widest hover:bg-admin/20 transition-all">
                Download Global Report
              </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Platform Members" value={String(stats.totalMembers)} change="+12 this week" color={color} />
          <StatCard label="Total Policies Sold" value={String(stats.totalSales)} change="+5 today" color={color} />
          <StatCard label="Platform Revenue" value="₹0" change="Manual calculation" color={color} />
          <StatCard label="Pending KYC Requests" value="0" change="Needs action" color={color} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Admin Actions */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface border border-white/[0.07] rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-admin/5 blur-3xl -mr-32 -mt-32" />
              <h3 className="font-display text-lg font-bold text-white mb-6 uppercase tracking-wider relative z-10">Management Hub</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                <AdminAction icon="🔑" label="Generate E-Pins" desc="Bulk activation codes" />
                <AdminAction icon="💰" label="Authorize Payouts" desc="Monthly cycle settlement" />
                <AdminAction icon="🛡️" label="Verify Documents" desc="KYC approval vault" />
                <AdminAction icon="⚙️" label="Commission Config" desc="Edit reward structure" />
                <AdminAction icon="📦" label="Plan Management" desc="Product definitions" />
                <AdminAction icon="📋" label="System Audit" desc="Security logs" />
              </div>
            </div>

            {/* Recent Global Sales */}
            <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Latest Platform Sales</h3>
                  <button className="text-[10px] font-bold text-admin uppercase tracking-widest hover:underline">Monitor All</button>
                </div>
                <div className="divide-y divide-white/[0.04] py-10 text-center text-xs text-muted font-bold uppercase tracking-widest">
                   Integrate global sales feed from /api/sales
                </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-surface border border-white/[0.07] rounded-3xl p-6 shadow-xl h-full">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Network Distribution</h4>
                <div className="space-y-6">
                   <ProgressItem label="HCC (Distributors)" val="85%" color="#60a5fa" />
                   <ProgressItem label="HCM (Managers)" val="12%" color="#f87171" />
                   <ProgressItem label="HBA (Assocs)" val="2%" color="#fbbf24" />
                   <ProgressItem label="SH (State Heads)" val="1%" color="#34d399" />
                </div>
                <div className="mt-10 p-4 bg-admin/5 border border-admin/10 rounded-2xl">
                   <p className="text-[10px] text-admin font-bold uppercase tracking-widest leading-relaxed">
                      💡 Network is growing at 4.2% month-over-month. SH rank availability: Restricted.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AdminAction({ icon, label, desc }: any) {
  return (
    <button className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-admin/40 hover:bg-admin/5 transition-all text-left group">
      <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-sm font-bold text-white tracking-tight">{label}</div>
      <div className="text-[10px] text-muted font-medium mt-1 leading-tight">{desc}</div>
    </button>
  );
}

function ProgressItem({ label, val, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
        <span className="text-muted">{label}</span>
        <span style={{ color }}>{val}</span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: val, backgroundColor: color }} />
      </div>
    </div>
  );
}
