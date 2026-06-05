'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { salesAPI } from '@/lib/api';
import ExportDropdown from '@/components/dashboard/ExportDropdown';

type Scope = 'FTD' | 'MTD';

export default function PerformanceReport() {
  const [scope, setScope] = useState<Scope>('MTD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [ftdData, setFtdData] = useState<any>(null);
  const [mtdData, setMtdData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const displayMonth = new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (scope === 'FTD') {
          const res = await salesAPI.getFTDAnalytics(date);
          if (res.data.success) setFtdData(res.data.data);
        } else {
          const res = await salesAPI.getMTDAnalytics(month);
          if (res.data.success) setMtdData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [scope, date, month]);

  const getExportData = () => {
    if (scope === 'FTD' && ftdData) {
      const headers = ['Seller Name', 'Member ID', 'Policies Sold', 'Revenue'];
      const rows = ftdData.topPerformers?.hcc?.map((r: any) => [r.name, r.memberId, r.sales, `Rs. ${(r.revenue / 100).toLocaleString()}`]) || [];
      return { headers, rows, title: `Daily Performance - ${displayDate}`, fileName: `FTD_${date}` };
    } else if (scope === 'MTD' && mtdData) {
      const headers = ['Territory', 'Policies Sold', 'Revenue'];
      const rows = mtdData.stateBreakdown?.map((s: any) => [s._id || 'Unknown', s.sales, `Rs. ${(s.revenue / 100).toLocaleString()}`]) || [];
      return { headers, rows, title: `Monthly Performance - ${displayMonth}`, fileName: `MTD_${month}` };
    }
    return { headers: [], rows: [], title: '', fileName: '' };
  };

  return (
    <DashboardLayout pageTitle="Performance Report">
      <div className="space-y-6 pb-20">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
              Reports / {scope === 'FTD' ? 'Daily Pulse' : 'Month-to-Date'}
            </p>
            <h1 className="text-2xl font-bold text-white">
              {scope === 'FTD' ? `📅 ${displayDate}` : `📊 ${displayMonth} Analytics`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Toggle */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setScope('MTD')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${scope === 'MTD' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly View
              </button>
              <button
                onClick={() => setScope('FTD')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${scope === 'FTD' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Daily View
              </button>
            </div>

            {/* Picker */}
            {scope === 'FTD' ? (
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm font-bold px-4 py-2 rounded-xl outline-none cursor-pointer" />
            ) : (
              <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm font-bold px-4 py-2 rounded-xl outline-none cursor-pointer" />
            )}

            <ExportDropdown {...getExportData()} />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading data...</p>
          </div>
        )}

        {!loading && scope === 'FTD' && ftdData && <FTDView data={ftdData} />}
        {!loading && scope === 'MTD' && mtdData && <MTDView data={mtdData} displayMonth={displayMonth} />}

      </div>
    </DashboardLayout>
  );
}

// ─── FTD VIEW ────────────────────────────────────────────────────────────────
function FTDView({ data }: { data: any }) {
  const { metrics, hourlyVelocity, topPerformers } = data;
  const fmt = (v: number) => {
    const r = v / 100;
    if (r >= 10000000) return `₹${(r / 10000000).toFixed(2)} Cr`;
    if (r >= 100000) return `₹${(r / 100000).toFixed(2)} L`;
    if (r >= 1000) return `₹${(r / 1000).toFixed(1)}K`;
    return `₹${r.toLocaleString('en-IN')}`;
  };

  const maxH = Math.max(...hourlyVelocity.map((h: any) => h.sales), 1);
  const activeBars = hourlyVelocity.filter((h: any) => h.sales > 0 || (h.hour >= 7 && h.hour <= 21));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(metrics?.totalRevenue || 0)} sub="Gross sales today" accent="emerald" icon="💰" />
        <StatCard label="Policies Sold" value={(metrics?.totalSales || 0).toString()} sub="Total transactions" accent="blue" icon="📋" />
        <StatCard
          label="Avg. Ticket Size"
          value={metrics?.totalSales > 0 ? fmt(Math.round(metrics.totalRevenue / metrics.totalSales)) : '₹0'}
          sub="Per policy average"
          accent="amber"
          icon="🎯"
        />
        <StatCard label="Active Sellers" value={(topPerformers?.hcc?.length || 0).toString()} sub="Members with sales" accent="purple" icon="👤" />
      </div>

      {/* Hourly Chart */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Intraday Sales Velocity</h3>
              <p className="text-xs text-slate-500 mt-1">Hourly transaction breakdown — hover bars for details</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <div className="w-3 h-3 rounded-sm bg-blue-500" /> Policies sold
            </div>
          </div>

          {metrics?.totalSales === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm font-bold">
              📭 No sales recorded for this date
            </div>
          ) : (
            <div className="h-52 flex items-end gap-1 border-b border-slate-700 pb-6 relative">
              {hourlyVelocity.map((h: any) => {
                const heightPct = (h.sales / maxH) * 100;
                const isActive = h.hour >= 7 && h.hour <= 21;
                if (!isActive && h.sales === 0) return null;
                return (
                  <div key={h.hour} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                    <div
                      className="w-full rounded-t transition-all duration-500 group-hover:brightness-125 cursor-pointer"
                      style={{
                        height: h.sales > 0 ? `${Math.max(heightPct, 4)}%` : '2px',
                        background: h.sales > 0 ? 'linear-gradient(to top, #3b82f6, #60a5fa)' : '#1e293b',
                        opacity: h.sales > 0 ? 1 : 0.3,
                        boxShadow: h.sales > 0 ? '0 0 12px rgba(59,130,246,0.4)' : 'none'
                      }}
                    >
                      {h.sales > 0 && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] font-black px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl pointer-events-none">
                          <div className="text-blue-600 font-black">{h.hour}:00 — {h.hour + 1}:00</div>
                          <div>{h.sales} {h.sales === 1 ? 'policy' : 'policies'} • {fmt(h.revenue)}</div>
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-5 text-[8px] font-bold text-slate-600">{h.hour}h</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="h-6" />
        </div>
      </div>

      {/* Top Performers by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformersTable title="Top HCC (Sellers)" data={topPerformers?.hcc || []} roleColor="blue" fmt={fmt} />
        <PerformersTable title="Top HCM (Managers)" data={topPerformers?.hcm || []} roleColor="emerald" fmt={fmt} />
      </div>
    </div>
  );
}

// ─── MTD VIEW ────────────────────────────────────────────────────────────────
function MTDView({ data, displayMonth }: { data: any; displayMonth: string }) {
  const { metrics, stateBreakdown, newMembersCount, topPerformers } = data;

  const fmt = (v: number) => {
    const r = v / 100;
    if (r >= 10000000) return `₹${(r / 10000000).toFixed(2)} Cr`;
    if (r >= 100000) return `₹${(r / 100000).toFixed(2)} L`;
    if (r >= 1000) return `₹${(r / 1000).toFixed(1)}K`;
    return `₹${r.toLocaleString('en-IN')}`;
  };

  const avgTicket = metrics?.totalSales > 0
    ? Math.round((metrics?.totalRevenue || 0) / metrics.totalSales)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(metrics?.totalRevenue || 0)} sub="Gross for the month" accent="emerald" icon="💰" />
        <StatCard label="Policies Sold" value={(metrics?.totalSales || 0).toString()} sub="Active transactions" accent="blue" icon="📋" />
        <StatCard label="Avg. Ticket Size" value={avgTicket > 0 ? fmt(avgTicket) : '₹0'} sub="Per policy average" accent="amber" icon="🎯" />
        <StatCard label="New Members" value={(newMembersCount || 0).toString()} sub="Joined this month" accent="purple" icon="🙋" />
      </div>

      {/* Territory + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Territory Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
            <span className="text-lg">🗺️</span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Territory Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Revenue generated by state</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {stateBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm font-bold">
                📭 No territory data for this period
              </div>
            ) : stateBreakdown.map((s: any, i: number) => {
              const maxRev = stateBreakdown[0].revenue;
              const pct = Math.max((s.revenue / maxRev) * 100, 2);
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
              const color = colors[i % colors.length];
              return (
                <div key={s._id || i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-sm font-bold text-white">{s._id || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                      <span>{s.sales} {s.sales === 1 ? 'policy' : 'policies'}</span>
                      <span className="text-white">{fmt(s.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <TopPerformerCard title="🏆 Top HCC This Month" data={topPerformers?.hcc || []} fmt={fmt} accent="#3b82f6" />
          <TopPerformerCard title="⚡ Top HCM This Month" data={topPerformers?.hcm || []} fmt={fmt} accent="#10b981" />
        </div>
      </div>

      {/* HBA & SH tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformersTable title="Top HBA (Business Associates)" data={topPerformers?.hba || []} roleColor="amber" fmt={fmt} />
        <PerformersTable title="Top SH (State Heads)" data={topPerformers?.sh || []} roleColor="purple" fmt={fmt} />
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon }: { label: string; value: string; sub: string; accent: string; icon: string }) {
  const styles: Record<string, { bg: string; border: string; text: string; sub: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', sub: 'text-emerald-600' },
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    sub: 'text-blue-600'    },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   sub: 'text-amber-600'   },
    purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  sub: 'text-purple-600'  },
  };
  const s = styles[accent] || styles.blue;
  return (
    <div className={`${s.bg} border ${s.border} rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-default`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-black ${s.text} mb-1 truncate`}>{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${s.sub}`}>{sub}</p>
    </div>
  );
}

function PerformersTable({ title, data, roleColor, fmt }: { title: string; data: any[]; roleColor: string; fmt: (v: number) => string }) {
  const clr: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="py-10 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">No data for this period</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
                <th className="px-6 py-3">#</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3 text-center">Policies</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 6).map((row: any, i: number) => (
                <tr key={row._id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-600">#{i + 1}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                        style={{ background: avatarColors[i % avatarColors.length] }}>
                        {row.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{row.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{row.memberId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${clr[roleColor]}`}>{row.sales}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-black text-white">{fmt(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TopPerformerCard({ title, data, fmt, accent }: { title: string; data: any[]; fmt: (v: number) => string; accent: string }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{title}</h4>
      {data.length === 0 ? (
        <p className="text-slate-600 text-xs font-bold text-center py-4">No data</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 4).map((row: any, i: number) => (
            <div key={row._id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-black text-slate-600 w-4">#{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{row.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{row.memberId}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black" style={{ color: accent }}>{fmt(row.revenue)}</p>
                <p className="text-[10px] font-bold text-slate-600">{row.sales} {row.sales === 1 ? 'sale' : 'sales'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
