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
    <div className="bg-[#131241] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-2xl relative group">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-all group-hover:scale-150" style={{ backgroundColor: color }} />
      
      {/* Header Area */}
      <div className="p-8 border-b border-white/[0.03] relative z-10">
        <div className="flex justify-between items-start mb-6">
           <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total My Wallet</p>
              <h2 className="font-display text-4xl font-black text-white tracking-tighter">
                {formatAmount(finalBalance + provisionalBalance)}
              </h2>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
              💳
           </div>
        </div>

        <div className="space-y-4">
           {/* Available Payout */}
           <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div>
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Available for Withdrawal</p>
                 <p className="text-lg font-black text-white mt-0.5">{formatAmount(finalBalance)}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
           </div>

           {/* Pending Settlement */}
           <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-80">
              <div>
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Pending Cycle End (Provisional)</p>
                 <p className="text-lg font-black text-white/60 mt-0.5">{formatAmount(provisionalBalance)}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
           </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-white/5 bg-white/[0.02]">
        <div className="p-6">
          <div className="text-[10px] text-white/40 mb-1 uppercase font-black tracking-tight">Gross Earnings</div>
          <div className="font-display text-xl font-black text-sh tracking-tighter">
            {formatAmount(totalEarned)}
          </div>
        </div>
        <div className="p-6">
          <div className="text-[10px] text-white/40 mb-1 uppercase font-black tracking-tight">Total Withdrawn</div>
          <div className="font-display text-xl font-black text-white tracking-tighter">
            {formatAmount(totalWithdrawn)}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.02]">
        <button
          onClick={onWithdraw}
          disabled={finalBalance < 500}
          className="w-full py-3 rounded-xl text-sm font-bold text-white 
            transition-all hover:brightness-110 active:scale-[0.98] 
            disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 4px 16px ${color}30`
          }}
        >
          {finalBalance < 500 ? 'Minimum ₹500 required' : 'Request Payout'}
        </button>
      </div>
    </div>
  );
}
