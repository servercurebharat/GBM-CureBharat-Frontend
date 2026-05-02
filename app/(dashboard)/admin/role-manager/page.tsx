'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

const PERMISSIONS_LIST: Permission[] = [
  { id: '1', name: 'View FTD Reports', description: 'Access to real-time daily performance reports.', roles: ['admin', 'sh'] },
  { id: '2', name: 'Edit Commission Config', description: 'Modify commission percentages and rank rules.', roles: ['admin'] },
  { id: '3', name: 'Approve KYC', description: 'Ability to verify and approve member documents.', roles: ['admin'] },
  { id: '4', name: 'Manage E-Pins', description: 'Generate and transfer bulk enrollment pins.', roles: ['admin', 'sh', 'hba'] },
  { id: '5', name: 'View Hierarchy Tree', description: 'Access to the full platform genealogy tree.', roles: ['admin', 'sh'] },
  { id: '6', name: 'Process Payouts', description: 'Finalize and release weekly/monthly payouts.', roles: ['admin'] },
];

export default function PermissionManagement() {
  const [selectedRole, setSelectedRole] = useState('admin');

  return (
    <DashboardLayout pageTitle="Permission Management">
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">SYSTEM ADMINISTRATION / PERMISSIONS</p>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Access Control Matrix</h1>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
             {['admin', 'sh', 'hba', 'hcm', 'hcc'].map((role) => (
               <button 
                 key={role}
                 onClick={() => setSelectedRole(role)}
                 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   selectedRole === role ? 'bg-[#131241] text-white shadow-lg shadow-[#131241]/20' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {role === 'hba' ? 'HCB' : role.toUpperCase()}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Permission Grid */}
           <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Permissions for {selectedRole.toUpperCase()}</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{PERMISSIONS_LIST.filter(p => p.roles.includes(selectedRole)).length} Enabled</span>
              </div>
              <div className="divide-y divide-slate-50">
                 {PERMISSIONS_LIST.map((p) => {
                   const isEnabled = p.roles.includes(selectedRole);
                   return (
                     <div key={p.id} className="px-8 py-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                        <div className="max-w-md">
                           <h4 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className={`text-[10px] font-black tracking-widest uppercase ${isEnabled ? 'text-emerald-500' : 'text-slate-300'}`}>
                              {isEnabled ? 'Authorized' : 'Restricted'}
                           </span>
                           <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isEnabled ? 'left-7' : 'left-1'}`} />
                           </div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Security Insight Card */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#131241] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#60A5FA]/10 blur-3xl -mr-16 -mt-16" />
                 <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-white/40">Security Advisory</h3>
                 <p className="text-xs text-white/60 leading-relaxed mb-8">
                    Permissions for the <span className="text-[#60A5FA] font-bold">{selectedRole.toUpperCase()}</span> role are locked to standard platform defaults. Only super-admins can override global access levels.
                 </p>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-xs font-bold text-white">May 02, 2026 - 17:35 PM</p>
                 </div>
              </div>

              <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 shadow-sm">
                 <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                 </div>
                 <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-2">Audit Requirement</h4>
                 <p className="text-xs text-amber-700/70 leading-relaxed">Changes to role permissions are logged in the global audit trail for compliance monitoring.</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
