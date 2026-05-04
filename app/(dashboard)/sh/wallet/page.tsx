import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function WalletPage() {
  const color = '#fb923c'; // SH Orange

  return (
    <DashboardLayout pageTitle="Wallet">
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">CUREBHARAT / DASHBOARD / WALLET</p>
          <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">Financial Command Center</h2>
          <p className="text-sm text-[#64748B] font-medium opacity-70">Real-time overview of your personal earnings and leadership bonuses.</p>
        </div>

        <WalletDashboard color={color} withdrawalPath="/sh/withdrawal" />
      </div>
    </DashboardLayout>
  );
}
