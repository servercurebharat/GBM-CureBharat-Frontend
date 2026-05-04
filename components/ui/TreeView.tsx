'use client';

import { ITreeNode } from '@/types';
import { ROLE_COLORS } from '@/lib/constants';

interface TreeViewProps {
  nodes: ITreeNode[];
  depth?: number;
}

function TreeNodeCard({ node, depth }: { node: ITreeNode; depth: number }) {
  const color = (ROLE_COLORS as any)[node.rank.toLowerCase()] || '#ffffff';

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <div 
        className="w-56 bg-[#1a1c3d]/50 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 shadow-2xl relative z-10 hover:border-white/30 transition-all group"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div 
            className="px-3 py-1 rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {node.rank}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${node.status === 'active' ? 'bg-sh shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{node.status}</span>
          </div>
        </div>
        
        <div className="text-sm font-black text-white truncate tracking-tight group-hover:text-hba transition-colors">{node.name}</div>
        <div className="text-[10px] text-white/30 font-mono mt-1 font-bold">{node.memberId}</div>
        
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/[0.05]">
           <div>
              <div className="text-[8px] text-white/20 font-black uppercase tracking-widest">Sales</div>
              <div className="text-xs font-black text-white mt-0.5">{node.personalSalesCount || 0}</div>
           </div>
           <div className="text-right">
              <div className="text-[8px] text-white/20 font-black uppercase tracking-widest">Team</div>
              <div className="text-xs font-black text-white mt-0.5">{node.teamSize || 0}</div>
           </div>
        </div>

        {/* Hover Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
      </div>

      {/* Connection Lines for Children */}
      {node.children && node.children.length > 0 && (
        <>
          <div className="w-0.5 h-12 bg-gradient-to-b from-white/20 to-white/5" />
          <div className="flex gap-10 relative">
            {/* Horizontal Line connecting children */}
            {node.children.length > 1 && (
              <div className="absolute top-0 left-[12%] right-[12%] h-0.5 bg-white/10 rounded-full" />
            )}
            {node.children.map((child) => (
              <div key={child._id} className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-white/10" />
                <TreeNodeCard node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TreeView({ nodes }: TreeViewProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-7xl mb-6 opacity-10 grayscale">🌳</div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Empty Organization Structure</p>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center p-12">
      {nodes.map((node) => (
        <TreeNodeCard key={node._id} node={node} depth={0} />
      ))}
    </div>
  );
}
