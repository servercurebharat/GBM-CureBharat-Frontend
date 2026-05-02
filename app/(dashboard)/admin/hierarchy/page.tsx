'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function AdminHierarchyPage() {
  const [roots, setRoots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandAll, setExpandAll] = useState(true);

  useEffect(() => {
    async function fetchTree() {
      try {
        setLoading(true);
        const res = await adminAPI.getTree();
        if (res.data.success) {
          setRoots(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch tree', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTree();
  }, []);

  return (
    <DashboardLayout pageTitle="Network Hierarchy">
      <div className="space-y-6 pb-20 overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#131241] rounded-[2.5rem] p-10 border border-white/[0.05] shadow-2xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
           <div className="relative z-10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Recursive Organization Map</p>
              <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight mb-6">Network Tree</h1>
              <div className="flex flex-wrap items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sh animate-pulse" />
                    <span className="text-[10px] font-bold uppercase text-white/60">State Head (SH)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8b7cf8] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase text-white/60">HCB</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase text-white/60">HCC / HCM</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Tree Container */}
        <div className="bg-[#131241]/40 backdrop-blur-3xl rounded-[3rem] border border-white/[0.05] p-10 md:p-20 overflow-x-auto min-h-[800px] relative">
           <div className="inline-flex flex-col items-center min-w-full">
              {roots.map(root => (
                <TreeBranch key={root._id} node={root} />
              ))}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TreeBranch({ node }: any) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <div className="relative z-10">
         <NodeCard node={node} isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} hasChildren={hasChildren} />
      </div>

      {/* Connection Line Down */}
      {hasChildren && isExpanded && (
        <div className="w-px h-16 bg-gradient-to-b from-white/20 to-white/10" />
      )}

      {/* Children Container */}
      {hasChildren && isExpanded && (
        <div className="flex gap-12 relative px-10">
           {/* Horizontal Connector Line */}
           {node.children.length > 1 && (
             <div className="absolute top-0 left-[50%] right-[50%] h-px bg-white/20" 
                  style={{ 
                    left: `calc(${100 / node.children.length / 2}% + 40px)`, 
                    right: `calc(${100 / node.children.length / 2}% + 40px)` 
                  }} />
           )}
           
           {node.children.map((child: any) => (
             <TreeBranch key={child._id} node={child} />
           ))}
        </div>
      )}
    </div>
  );
}

function NodeCard({ node, isExpanded, onToggle, hasChildren }: any) {
  const roleColors: any = {
    'SH': 'border-sh shadow-sh/20 text-sh',
    'HCB': 'border-[#8b7cf8] shadow-[#8b7cf8]/20 text-[#8b7cf8]',
    'HCM': 'border-emerald-400 shadow-emerald-400/20 text-emerald-400',
    'HCC': 'border-blue-400 shadow-blue-400/20 text-blue-400'
  };

  const bgColors: any = {
    'SH': 'bg-sh/5',
    'HCB': 'bg-[#8b7cf8]/5',
    'HCM': 'bg-emerald-400/5',
    'HCC': 'bg-blue-400/5'
  };

  return (
    <div className={`w-64 p-6 rounded-[2rem] border-2 bg-[#131241] shadow-2xl transition-all duration-500 hover:scale-110 group ${roleColors[node.role] || 'border-white/10'}`}>
       <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl mb-4 overflow-hidden border border-white/10 ${bgColors[node.role]}`}>
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${node.name}`} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{node.role}</p>
          <h4 className="text-sm font-black text-white uppercase tracking-tight truncate w-full px-2">{node.name}</h4>
          <p className="text-[9px] font-bold text-white/30 uppercase mt-1 tracking-widest">{node.memberId}</p>
          
          <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center px-2">
             <div className="text-left">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter leading-none">TEAM</p>
                <p className="text-[10px] font-bold text-white leading-none mt-1">{node.children?.length || 0}</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter leading-none">STATUS</p>
                <p className={`text-[8px] font-black leading-none mt-1 uppercase ${node.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-400'}`}>{node.status}</p>
             </div>
          </div>

          {hasChildren && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#131241] border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl z-20 group-hover:border-blue-500"
            >
              {isExpanded ? 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14"/></svg> : 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14M5 12h14"/></svg>
              }
            </button>
          )}
       </div>
    </div>
  );
}
