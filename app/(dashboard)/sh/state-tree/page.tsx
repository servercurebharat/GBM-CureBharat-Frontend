'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { teamAPI, authAPI } from '@/lib/api';
import { IUser } from '@/types';
import toast from 'react-hot-toast';

interface TreeNodeProps {
  member: any;
  level: number;
}

const TreeNode = ({ member, level }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = async () => {
    if (!isExpanded && children.length === 0) {
      setLoading(true);
      try {
        const res = await teamAPI.getMembers({ parentId: member._id });
        if (res.data.success) {
          setChildren(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch downline', err);
        toast.error('Failed to load downline members');
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const roleColors: any = {
    sh: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    hba: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    hcm: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    hcc: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  };

  const style = roleColors[member.role] || roleColors.hcc;

  return (
    <div className="relative">
      <div 
        onClick={toggleExpand}
        className={`flex items-center gap-3 bg-[#131241] border ${style.border} rounded-xl px-4 py-2.5 w-max cursor-pointer hover:bg-white/5 transition-all group`}
      >
        <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center ${style.text} font-bold text-xs uppercase`}>
          {member.role}
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-[#60A5FA] transition-colors">{member.name}</p>
          <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">{member.memberId}</p>
        </div>
        {loading ? (
          <div className="w-3 h-3 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin ml-2" />
        ) : (
          <svg 
            className={`w-3 h-3 transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-180' : ''}`} 
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>

      {isExpanded && (
        <div className="ml-[22px] border-l border-white/10 pl-10 space-y-6 pt-6 relative">
          {children.length === 0 && !loading ? (
            <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest py-2">No downline members found</div>
          ) : (
            children.map((child) => (
              <div key={child._id} className="relative">
                <div className="absolute -left-10 top-5 w-10 border-t border-white/10" />
                <TreeNode member={child} level={level + 1} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function NetworkTreePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe().then(res => {
      if (res.data.success && res.data.data) setUser(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout pageTitle="Network Tree">
      <div className="space-y-2 mb-8">
        <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / NETWORK</p>
        <h2 className="text-2xl font-bold text-white tracking-tight">Interactive Network Tree</h2>
        <p className="text-sm text-[#64748B] font-medium opacity-70">Click nodes to expand your team hierarchy and view downline details.</p>
      </div>

      <div className="bg-[#131241] rounded-[24px] p-10 shadow-2xl border border-white/5 min-h-[600px] overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="w-10 h-10 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Generating Network Map...</p>
          </div>
        ) : user ? (
          <div className="p-4">
             <TreeNode member={user} level={0} />
          </div>
        ) : (
          <div className="text-center py-40 text-slate-500">Failed to load user data</div>
        )}
      </div>
    </DashboardLayout>
  );
}
