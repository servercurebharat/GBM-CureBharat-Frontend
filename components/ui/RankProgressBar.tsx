'use client';

interface RankProgressBarProps {
  currentRank: string;
  nextRank: string;
  currentSales: number;
  targetSales: number;
  currentRecruits: number;
  targetRecruits: number;
  color: string;
}

export default function RankProgressBar({
  currentRank, nextRank,
  currentSales, targetSales,
  currentRecruits, targetRecruits,
  color
}: RankProgressBarProps) {
  const salesPercent = Math.round(Math.min((currentSales / targetSales) * 100, 100));
  const recruitPercent = Math.round(Math.min((currentRecruits / targetRecruits) * 100, 100));
  const overallPercent = Math.round((salesPercent + recruitPercent) / 2);

  return (
    <div className="bg-[#131241] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.08] blur-3xl rounded-full" style={{ background: color }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-2xl rounded-full" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight mb-1">Rank Progress</h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{currentRank} → {nextRank} Milestone</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 mb-1 uppercase font-bold tracking-[0.2em]">Next Milestone</p>
            <div className="font-display text-2xl font-black text-white tracking-tight">
              {nextRank}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Promotion Progress</span>
            <span style={{ color }} className="text-2xl font-black font-display">{overallPercent}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%`, backgroundColor: color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{currentSales} / {targetSales} SALES</span>
              <span className="text-xs font-black text-white tracking-tighter">{salesPercent}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${salesPercent}%`, background: color }} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{currentRecruits} / {targetRecruits} RECRUITS</span>
              <span className="text-xs font-black text-white tracking-tighter">{recruitPercent}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${recruitPercent}%`, background: color }} />
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Next cycle update: AUTO</span>
          </div>
          <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Calculated on lifetime performance</p>
        </div>
      </div>
    </div>
  );
}
