'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import WalletCard from '@/components/ui/WalletCard';
import { useAuth } from '@/lib/auth';
import { walletAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale } from '@/types';

export default function HbaDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [teamSales, setTeamSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [walletRes, salesRes] = await Promise.all([
          walletAPI.getMyWallet(),
          salesAPI.getAll({ page: 1, limit: 10 }),
        ]);
        if (walletRes.data.success) setWallet(walletRes.data.data || null);
        if (salesRes.data.success) setTeamSales(salesRes.data.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const color = '#fbbf24'; // HBA Gold

  return (
    <DashboardLayout pageTitle="Business Associate Portal">
       {loading ? <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-hba border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-8 pb-10">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-3xl font-bold text-white tracking-tight">HBA Management Console</h2>
              <p className="text-sm text-muted mt-1 font-medium">Overseeing Health Care Managers and downline network volume</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Override Dividends" value={`₹${((wallet?.provisionalBalance || 0) / 100).toLocaleString('en-IN')}`} change="40% of HCM earnings" color={color} />
            <StatCard label="Network HCMs" value="03" change="Direct downline managers" color={color} />
            <StatCard label="Total Network Volume" value="₹0" change="All-time BV" color={color} />
            <StatCard label="Promotion Status" value="HBA" change="Rank active" color={color} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
               {wallet && <WalletCard provisionalBalance={wallet.provisionalBalance / 100} finalBalance={wallet.finalBalance / 100} totalEarned={wallet.totalEarned / 100} totalWithdrawn={wallet.totalWithdrawn / 100} color={color} onWithdraw={() => {}} />}
            </div>
            <div className="lg:col-span-7">
               <div className="bg-surface border border-white/[0.07] rounded-3xl p-8 shadow-xl">
                  <h3 className="font-display text-lg font-bold text-white mb-6 uppercase tracking-wider">Manager Performance</h3>
                  <div className="space-y-6">
                     <p className="text-xs text-muted font-medium italic">Detailed HCM-wise revenue breakdown will be displayed here based on downline sales aggregation.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
       )}
    </DashboardLayout>
  );
}
