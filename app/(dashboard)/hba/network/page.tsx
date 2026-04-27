'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TreeView from '@/components/genealogy/TreeView';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ITreeNode } from '@/types';

export default function HbaNetwork() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<ITreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    async function fetchTree() {
      if (!user) return;
      try {
        const res = await usersAPI.getDownline(user._id);
        if (res.data.success) {
          setTreeData(res.data.data || null);
        }
      } catch (err) {
        console.error('Network tree fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTree();
  }, [user]);

  return (
    <DashboardLayout pageTitle="Associate Network Tree">
       <div className="space-y-8 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">Enterprise Hierarchy</h2>
                <p className="text-sm text-muted mt-1 font-medium">Visualizing the full distribution chain under your leadership</p>
             </div>
             <div className="flex bg-surface border border-white/10 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('tree')}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'tree' ? 'bg-hba text-[#0d0f14]' : 'text-muted hover:text-white'}`}
                >
                  Tree View
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-hba text-[#0d0f14]' : 'text-muted hover:text-white'}`}
                >
                  Member List
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <NetworkStat label="Total Network Size" val={String(user?.teamSize || 0)} color="#fbbf24" />
             <NetworkStat label="Frontline HCMs" val="03" color="#f87171" />
             <NetworkStat label="Indirect HCCs" val="12" color="#60a5fa" />
          </div>

          <div className="bg-surface border border-white/[0.07] rounded-[40px] p-10 min-h-[600px] shadow-2xl relative overflow-hidden flex justify-center">
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]" />
             
             {loading ? (
                <div className="flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-hba border-t-transparent rounded-full animate-spin" />
                </div>
             ) : viewMode === 'tree' ? (
                treeData ? (
                   <div className="scale-75 origin-top mt-10">
                      <TreeView node={treeData} />
                   </div>
                ) : (
                   <EmptyNetwork />
                )
             ) : (
                <div className="w-full relative z-10">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-white/10">
                            <th className="px-4 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Name</th>
                            <th className="px-4 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Rank</th>
                            <th className="px-4 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Sales</th>
                            <th className="px-4 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Joined</th>
                            <th className="px-4 py-4 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {flattenTree(treeData).map((member: any) => (
                            <tr key={member._id} className="hover:bg-white/[0.02]">
                               <td className="px-4 py-4">
                                  <div className="text-sm font-bold text-white">{member.name}</div>
                                  <div className="text-[9px] font-mono text-muted">{member.memberId}</div>
                               </td>
                               <td className="px-4 py-4">
                                  <span className="text-[9px] font-black text-hba uppercase">{member.rank}</span>
                               </td>
                               <td className="px-4 py-4 text-sm font-bold text-sh">{member.personalSalesCount}</td>
                               <td className="px-4 py-4 text-[10px] font-medium text-white opacity-60">L{member.level}</td>
                               <td className="px-4 py-4">
                                  <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-sh' : 'bg-hcm'}`} />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
       </div>
    </DashboardLayout>
  );
}

function NetworkStat({ label, val, color }: any) {
  return (
    <div className="bg-surface border border-white/[0.07] rounded-3xl p-6 shadow-lg">
       <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
       <h4 className="text-2xl font-display font-bold text-white" style={{ color }}>{val}</h4>
    </div>
  );
}

function EmptyNetwork() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
       <div className="text-5xl mb-6 opacity-10">🕸️</div>
       <p className="text-xs text-muted font-bold uppercase tracking-widest">No network data available</p>
    </div>
  );
}

function flattenTree(node: ITreeNode | null): any[] {
  if (!node) return [];
  let result: any[] = [{ ...node }];
  if (node.children) {
    node.children.forEach(child => {
      result = [...result, ...flattenTree(child)];
    });
  }
  return result;
}
