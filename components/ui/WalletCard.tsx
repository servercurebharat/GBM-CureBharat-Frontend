'use client';

interface WalletCardProps {
  provisionalBalance: number;
  finalBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  color: string;
  onWithdraw: () => void;
}

export default function WalletCard({
  provisionalBalance, finalBalance,
  totalEarned, totalWithdrawn,
  color, onWithdraw
}: WalletCardProps) {
  const formatAmount = (val: number) =>
    `₹${(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-surface border border-white/[0.07] rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.07] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}>
        
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20" style={{ backgroundColor: color }} />

        <div className="text-[10px] text-muted mb-1 uppercase font-bold tracking-widest relative z-10">Available For Withdrawal</div>
        <div className="font-display text-3xl font-bold text-white relative z-10 mb-1">
          {formatAmount(finalBalance)}
        </div>
        <div className="text-xs font-medium flex items-center gap-1.5 relative z-10" style={{ color }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          + {formatAmount(provisionalBalance)} pending cycle end
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.07] bg-white/[0.01]">
        <div className="p-5">
          <div className="text-[10px] text-muted mb-1 uppercase font-bold tracking-tighter">Gross Earnings</div>
          <div className="font-display text-lg font-bold text-sh">
            {formatAmount(totalEarned)}
          </div>
        </div>
        <div className="p-5">
          <div className="text-[10px] text-muted mb-1 uppercase font-bold tracking-tighter">Total Withdrawn</div>
          <div className="font-display text-lg font-bold text-white">
            {formatAmount(totalWithdrawn)}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="p-5 mt-auto border-t border-white/[0.07] bg-surface">
        <button
          onClick={onWithdraw}
          disabled={finalBalance < 500}
          className="w-full py-3 rounded-lg text-sm font-bold text-[#0d0f14] 
            transition-all hover:brightness-110 active:scale-[0.98] 
            disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-black/20"
          style={{ backgroundColor: color }}
        >
          {finalBalance < 500 ? 'Minimum ₹500 required' : 'Request Payout'}
        </button>
      </div>
    </div>
  );
}
