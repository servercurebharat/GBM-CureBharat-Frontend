'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function HbaWalletPage() {
  const color = '#3b82f6'; // HBA Blue

  return (
    <DashboardLayout pageTitle="Wallet">
      <div className="space-y-8 pb-10">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CUREBHARAT / DASHBOARD / WALLET</p>
           <h2 className="font-display text-3xl font-bold text-black tracking-tight">Wallet & Earnings</h2>
           <p className="text-sm text-muted mt-1 font-medium">Complete financial overview and transaction history</p>
        </div>

        <WalletDashboard color={color} withdrawalPath="/hba/withdrawal" />
      </div>
    </DashboardLayout>
  );
}
