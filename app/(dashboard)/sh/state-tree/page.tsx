'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import TreeView from '../../../../components/ui/TreeView';
import { authApi, usersApi } from '../../../../lib/api';
import { IUser } from '../../../../types';

export default function ShStateTreePage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then((r) => {
      setUser(r.data.user);
      usersApi.getDownline(r.data.user.id, 5)
        .then((tr) => setTree(tr.data.data || []))
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <DashboardLayout user={user} role="sh">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">Full State Tree</h1>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          {loading ? <p className="text-slate-500 text-sm text-center py-8">Loading tree...</p>
            : <TreeView nodes={tree} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
