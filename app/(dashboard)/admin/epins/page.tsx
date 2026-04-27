'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authAPI, epinsAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function AdminEpinsPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [form, setForm] = useState({ planId: '', quantity: 10, assignToUserId: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { authAPI.getMe().then((r) => setUser(r.data.user || {})); }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const r = await epinsAPI.generate(form);
      setSuccess(`✅ Generated ${r.data.count} pins successfully`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to generate pins');
    } finally { setLoading(false); }
  }

  return (
    <DashboardLayout pageTitle="E-Pin Management">
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">E-Pin Management</h1>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 max-w-md">
          <h2 className="text-white font-semibold mb-4">Generate E-Pins</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Plan ID</label>
              <input value={form.planId} onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                placeholder="MongoDB Plan ObjectId"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Quantity (max 500)</label>
              <input type="number" min={1} max={500} value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Assign to SH/HBA (User ID)</label>
              <input value={form.assignToUserId} onChange={(e) => setForm((f) => ({ ...f, assignToUserId: e.target.value }))}
                placeholder="Optional — defaults to admin"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Pins'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
