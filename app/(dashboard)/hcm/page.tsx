'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import WalletCard from '@/components/ui/WalletCard';
import { useAuth } from '@/lib/auth';
import { walletAPI, salesAPI } from '@/lib/api';
import { IWallet, ISale } from '@/types';

export default function HcmDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [walletRes] = await Promise.all([
          walletAPI.getMyWallet(),
        ]);
        if (walletRes.data.success) setWallet(walletRes.data.data || null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const color = '#f87171'; // HCM Red

  return (
    <DashboardLayout pageTitle="Manager Dashboard">
       {loading ? <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-hcm border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-8 pb-10">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-display text-3xl font-bold text-white tracking-tight">HCM Team Operations</h2>
              <p className="text-sm text-muted mt-1 font-medium">Monitoring Health Care Consultants and monthly team activity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Manager Override" value={`₹${((wallet?.provisionalBalance || 0) / 100).toLocaleString('en-IN')}`} change="40% of HCC earnings" color={color} />
            <StatCard label="Active HCCs" value={String(user.teamSize)} change="Managed consultants" color={color} />
            <StatCard label="Team Sales" value="0" change="This cycle" color={color} />
            <StatCard label="Goal to HBA" value="33%" change="Need 2 more HCMs" color={color} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
               {wallet && <WalletCard provisionalBalance={wallet.provisionalBalance / 100} finalBalance={wallet.finalBalance / 100} totalEarned={wallet.totalEarned / 100} totalWithdrawn={wallet.totalWithdrawn / 100} color={color} onWithdraw={() => {}} />}
            </div>
            <div className="lg:col-span-7 space-y-6">
               <div className="bg-surface border border-white/[0.07] rounded-3xl p-8 shadow-xl">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-6">HCC Activity Monitor</h3>
                  <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center">
                     <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em]">Live team sales feed integration pending</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
       )}
    </DashboardLayout>
  );
}
