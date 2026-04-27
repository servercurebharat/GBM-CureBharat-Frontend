'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi } from '../../../../lib/api';
import { IUser } from '../../../../types';

export default function ShRevenuePage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  useEffect(() => { authApi.me().then((r) => setUser(r.data.user)); }, []);
  return (
    <DashboardLayout user={user} role="sh">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">State Revenue Report</h1>
        <p className="text-slate-400 text-sm">Detailed breakdown of all revenue generated in {user.state || 'your state'}</p>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <p className="text-slate-500 text-xs uppercase tracking-wider">Gross Business Volume</p>
                 <p className="text-white text-2xl font-bold">₹0.00</p>
              </div>
              <div className="text-right">
                 <p className="text-slate-500 text-xs uppercase tracking-wider">Commissionable Volume</p>
                 <p className="text-emerald-400 text-2xl font-bold">₹0.00</p>
              </div>
           </div>
           <p className="text-slate-500 text-sm text-center py-10 border-t border-slate-700/50">
              Transaction details will appear here once sales are recorded in your state.
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
