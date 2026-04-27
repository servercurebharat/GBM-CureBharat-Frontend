'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi, epinsApi } from '../../../../lib/api';
import { IUser, IEPin } from '../../../../types';
export default function HbaBulkPinsPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [pins, setPins] = useState<IEPin[]>([]);
  useEffect(() => {
    authApi.me().then((r) => {
      setUser(r.data.user);
      epinsApi.myPins('unused').then((pr) => setPins(pr.data.data || []));
    });
  }, []);
  return (
    <DashboardLayout user={user} role="hba">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Bulk Pin Management</h1>
          <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full font-medium">{pins.length} available</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          {pins.length === 0 ? <p className="text-slate-500 text-sm text-center py-8">No pins in inventory. Contact your SH to request pins.</p>
            : pins.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                <p className="text-white font-mono text-sm">{p.pinCode}</p>
                <p className="text-slate-400 text-sm">₹{p.value}</p>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">unused</span>
              </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
