'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LedgerTable from '@/components/ui/LedgerTable';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/lib/auth';
import { walletAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function HbaOverrideIncomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await walletAPI.getMyWallet();
        if (res.data.success) {
          const walletData = res.data.data;
          setWallet(walletData);

          const overrideEntries = (walletData.ledger || []).filter((e: any) => e.type === 'override');
          
          const total = overrideEntries.reduce((sum: number, e: any) => sum + e.amount, 0);
          const month = overrideEntries
            .filter((e: any) => e.cycleMonth === currentMonth)
            .reduce((sum: number, e: any) => sum + e.amount, 0);
          const pending = overrideEntries
            .filter((e: any) => e.status === 'provisional')
            .reduce((sum: number, e: any) => sum + e.amount, 0);

          setStats({ total, thisMonth: month, pending });
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
        toast.error('Could not load override earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [currentMonth]);

  const overrideEntries = wallet?.ledger?.filter((e: any) => e.type === 'override') || [];
  const color = '#3b82f6';

  return (
    <DashboardLayout pageTitle="Override Income">
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-black text-slate-800 tracking-tight">Team Overrides</h2>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Real-time 40% commissions from your Regional Network</p>
          </div>
          <div className="flex items-center gap-4 bg-[#131241]/5 p-2 rounded-2xl border border-[#131241]/10">
             <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {loading ? 'Syncing...' : 'Live Ledger'}
             </div>
             <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-[10px] font-black text-hba uppercase tracking-widest hover:bg-white/50 transition-all">Refresh Data</button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <StatCard 
            label="Total Override Earned" 
            value={`₹${(stats.total / 100).toLocaleString('en-IN')}`} 
            change="Cumulative team income" 
            color="#3b82f6" 
          />
          <StatCard 
            label="Current Month" 
            value={`₹${(stats.thisMonth / 100).toLocaleString('en-IN')}`} 
            change={`${new Date().toLocaleString('default', { month: 'long' })} Cycle`} 
            color="#10b981" 
          />
          <StatCard 
            label="Pending Settlement" 
            value={`₹${(stats.pending / 100).toLocaleString('en-IN')}`} 
            change="Awaiting cycle completion" 
            color="#f59e0b" 
          />
        </div>

        {/* Ledger Container */}
        <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden relative group min-h-[400px]">
           {/* Decorative Background Glows */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-hba/5 blur-[120px] rounded-full -mr-48 -mt-48" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

           <div className="relative z-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                  <div className="w-16 h-16 border-4 border-hba border-t-transparent rounded-full animate-spin mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Auditing Team Ledger...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest">Transaction Audit</h3>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Audit-ready income records</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                       <span className="w-2 h-2 rounded-full bg-hba animate-pulse" />
                       <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{overrideEntries.length} Records</span>
                    </div>
                  </div>
                  
                  <LedgerTable entries={overrideEntries} color={color} title="Override Income History" />
                </div>
              )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
