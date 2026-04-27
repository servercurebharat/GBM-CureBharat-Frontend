'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { authApi, epinsApi } from '../../../../lib/api';
import { IUser, IEPin } from '../../../../types';
export default function HcmPushPinsPage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [pins, setPins] = useState<IEPin[]>([]);
  const [toUserId, setToUserId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    authApi.me().then((r) => {
      setUser(r.data.user);
      epinsApi.myPins('unused').then((pr) => setPins(pr.data.data || []));
    });
  }, []);
  function togglePin(code: string) {
    setSelected((s) => s.includes(code) ? s.filter((c) => c !== code) : [...s, code]);
  }
  async function handlePush() {
    if (!toUserId || selected.length === 0) return;
    setLoading(true); setMsg('');
    try {
      await epinsApi.transfer(selected, toUserId);
      setMsg(`✅ ${selected.length} pin(s) pushed to HCC`);
      setSelected([]);
      epinsApi.myPins('unused').then((pr) => setPins(pr.data.data || []));
    } catch { setMsg('❌ Transfer failed'); }
    finally { setLoading(false); }
  }
  return (
    <DashboardLayout user={user} role="hcm">
      <div className="space-y-6 max-w-lg">
        <h1 className="text-white text-2xl font-bold">Push Pins to HCC</h1>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <label className="block text-slate-400 text-sm mb-1.5">HCC User ID</label>
          <input value={toUserId} onChange={(e) => setToUserId(e.target.value)} placeholder="MongoDB ObjectId of HCC"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500" />
          <p className="text-slate-500 text-xs mb-3">Select pins to transfer:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pins.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">No pins available</p>
              : pins.map((p) => (
                <label key={p._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selected.includes(p.pinCode) ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800 hover:bg-slate-700/60'}`}>
                  <input type="checkbox" checked={selected.includes(p.pinCode)} onChange={() => togglePin(p.pinCode)} className="accent-emerald-500" />
                  <span className="text-white font-mono text-sm">{p.pinCode}</span>
                  <span className="text-slate-400 text-xs ml-auto">₹{p.value}</span>
                </label>
              ))}
          </div>
          {msg && <p className="text-sm mt-3 text-emerald-400">{msg}</p>}
          <button onClick={handlePush} disabled={loading || !selected.length || !toUserId}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity">
            {loading ? 'Transferring...' : `Push ${selected.length} Pin(s)`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
