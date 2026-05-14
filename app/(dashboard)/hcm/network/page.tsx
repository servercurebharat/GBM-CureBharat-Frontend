'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TreeView from '@/components/ui/TreeView';
import { useAuth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function HcmNetworkPage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, depth: 0 });

  useEffect(() => {
    const fetchTree = async () => {
      if (!user?._id) return;
      try {
        const res = await usersAPI.getDownline(user._id);
        if (res.data.success) {
          setTreeData(res.data.data ? [res.data.data] : []);
          
          let total = 0, active = 0, maxDepth = 0;
          const traverse = (node: any, depth: number) => {
            if (!node) return;
            total++;
            if (node.status === 'active') active++;
            maxDepth = Math.max(maxDepth, depth);
            node.children?.forEach((child: any) => traverse(child, depth + 1));
          };
          if (res.data.data) {
            traverse(res.data.data, 1);
            setStats({ total, active, depth: maxDepth });
          }
        }
      } catch (err) {
        toast.error('Failed to load network tree');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [user?._id]);

  return (
    <DashboardLayout pageTitle="Network Tree">
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-black text-slate-800 tracking-tight">Team Genealogy</h2>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Visual hierarchy of your HCM network</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Total Network', value: String(stats.total), sub: 'Full Team Depth' },
            { label: 'Active Reach', value: String(stats.active), sub: `${stats.total - stats.active} Pending` },
            { label: 'Org Depth', value: `${stats.depth} Levels`, sub: 'Current Hierarchy' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#131241] rounded-[24px] p-8 shadow-2xl border border-white/5">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{stat.label}</p>
               <h4 className="text-3xl font-black text-white mb-1">{stat.value}</h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tree View Container */}
        <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative min-h-[500px]">
           <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
           
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Genealogy Structure</h3>
                 <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase"><div className="w-2 h-2 rounded-full bg-red-500"/> HCM</span>
                    <span className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase"><div className="w-2 h-2 rounded-full bg-cyan-500"/> HCC</span>
                 </div>
              </div>

              <div className="overflow-x-auto pb-10 no-scrollbar">
                 {loading ? (
                   <div className="py-20 flex flex-col items-center animate-pulse">
                      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Network...</p>
                   </div>
                 ) : (
                   <div className="min-w-[800px] flex justify-center py-10">
                      {treeData?.length > 0 ? <TreeView nodes={treeData} /> : <p className="text-white/20 uppercase font-black tracking-widest text-[10px]">No downline found</p>}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
