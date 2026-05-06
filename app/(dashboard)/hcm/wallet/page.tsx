'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function HcmWalletPage() {
  const color = '#f87171'; // HCM Red

  return (
    <DashboardLayout pageTitle="Wallet">
      <div className="space-y-8 pb-10">
        <div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / DASHBOARD / WALLET</p>
           <h2 className="font-display text-3xl font-bold text-white tracking-tight">Wallet & Earnings</h2>
           <p className="text-sm text-muted mt-1 font-medium">Complete financial overview and transaction history</p>
        </div>

        <WalletDashboard color={color} withdrawalPath="/hcm/withdrawal" />
      </div>
    </DashboardLayout>
  );
}
