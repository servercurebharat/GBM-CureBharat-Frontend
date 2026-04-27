'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi } from '../../../../lib/api';
import { IUser } from '../../../../types';

export default function AdminRanksPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  useEffect(() => { authApi.me().then((r) => setUser(r.data.user)); }, []);
  return (
    <DashboardLayout user={user} role="admin">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">Rank Management</h1>
        <p className="text-slate-400 text-sm">Configure rank criteria and promotion logic</p>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-500">
           Rank management module loading...
        </div>
      </div>
    </DashboardLayout>
  );
}
