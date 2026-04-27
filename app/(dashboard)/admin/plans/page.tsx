'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi } from '../../../../lib/api';
import { IUser } from '../../../../types';

export default function AdminPlansPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  useEffect(() => { authApi.me().then((r) => setUser(r.data.user)); }, []);
  return (
    <DashboardLayout user={user} role="admin">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">Plan Configuration</h1>
        <p className="text-slate-400 text-sm">Create and manage insurance / product plans</p>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-500">
           Plans configuration module loading...
        </div>
      </div>
    </DashboardLayout>
  );
}
