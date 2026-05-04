'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import TreeView from '@/components/ui/TreeView';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function HbaNetworkPage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    depth: 0
  });

  useEffect(() => {
    const fetchTree = async () => {
      if (!user?._id) return;
      
      try {
        const result = await usersAPI.getDownline(user._id);
        
        if (result.data.success) {
          // The API returns a single object representing the root user and their children
          setTreeData(result.data.data ? [result.data.data] : []);
          
          // Calculate stats from the real tree
          let total = 0;
          let active = 0;
          let maxDepth = 0;

          const traverse = (node: any, depth: number) => {
            if (!node) return;
            total++;
            if (node.status === 'active') active++;
            maxDepth = Math.max(maxDepth, depth);
            if (node.children && Array.isArray(node.children)) {
              node.children.forEach((child: any) => traverse(child, depth + 1));
            }
          };

          if (result.data.data) {
            traverse(result.data.data, 1);
            setStats({ total, active, depth: maxDepth });
          }
        }
      } catch (error) {
        console.error('Failed to fetch network tree:', error);
        toast.error('Could not load real network data');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [user?._id]);

  return (
    <DashboardLayout pageTitle="Network Hierarchy">
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-black text-slate-800 tracking-tight">Team Genealogy</h2>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Visual hierarchy of your Regional Network</p>
          </div>
          <div className="flex items-center gap-4 bg-[#131241]/5 p-2 rounded-2xl border border-[#131241]/10">
             <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {loading ? 'Syncing...' : 'Live System'}
             </div>
             <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-[10px] font-black text-hba uppercase tracking-widest hover:bg-white/50 transition-all">Refresh Tree</button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <StatCard label="Total Network Size" value={String(stats.total)} change="Full Team Depth" color="#3b82f6" />
          <StatCard label="Active Reach" value={String(stats.active)} change={`${stats.total - stats.active} Pending Activity`} color="#10b981" />
          <StatCard label="Organization Depth" value={`${stats.depth} Levels`} change="Current Hierarchy" color="#f59e0b" />
        </div>

        {/* Tree View Container */}
        <div className="bg-[#131241] border border-white/[0.07] rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative group min-h-[600px]">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-hba/5 blur-[120px] rounded-full -mr-48 -mt-48" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

           <div className="relative z-10">
             <div className="flex items-center justify-between mb-12">
               <div>
                 <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest">Genealogy Structure</h3>
                 <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Real-time team reporting</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span className="text-[9px] font-bold text-white/40 uppercase">HBA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <span className="text-[9px] font-bold text-white/40 uppercase">HCM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                    <span className="text-[9px] font-bold text-white/40 uppercase">HCC</span>
                  </div>
               </div>
             </div>
             
             <div className="overflow-x-auto pb-10 custom-scrollbar">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                    <div className="w-16 h-16 border-4 border-hba border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Decrypting Network Tree...</p>
                 </div>
               ) : (
                 <div className="min-w-[1000px] flex justify-center py-10">
                   {treeData && treeData.length > 0 ? (
                     <TreeView nodes={treeData} />
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-7xl mb-6 opacity-10 grayscale">🌳</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center max-w-xs">You are currently the root of your organization. No downline found.</p>
                     </div>
                   )}
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
