'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi } from '../../../../lib/api';
import { IUser } from '../../../../types';

export default function AdminTaxReportsPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  useEffect(() => { authApi.me().then((r) => setUser(r.data.user)); }, []);
  return (
    <DashboardLayout user={user} role="admin">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">TDS & GST Reports</h1>
        <p className="text-slate-400 text-sm">Download monthly tax deduction and GST liability reports</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Cycle {i} - Apr 2024</p>
                <p className="text-slate-500 text-xs">Total TDS: ₹24,500</p>
              </div>
              <button className="text-emerald-400 hover:text-emerald-300">📥 Download</button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
