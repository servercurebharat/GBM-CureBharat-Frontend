'use client';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  color: string;
}

export default function StatCard({ label, value, change, isPositive = true, color }: StatCardProps) {
  return (
    <div className="bg-surface border border-white/[0.07] rounded-xl p-5 
      relative overflow-hidden hover:border-white/[0.12] transition-all group">
      {/* Accent corner */}
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
        style={{ backgroundColor: color }}
      />
      
      <div className="text-xs text-muted mb-2 uppercase tracking-wider font-semibold">{label}</div>
      <div className="font-display text-2xl font-bold text-white leading-none mb-2">
        {value}
      </div>
      
      {change && (
        <div className={`text-[10px] font-medium ${isPositive ? 'text-sh' : 'text-hcm'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}
