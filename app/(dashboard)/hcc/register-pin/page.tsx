'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { epinsAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { IEPin } from '@/types';

export default function RegisterWithPin() {
  const { user } = useAuth();
  const [pins, setPins] = useState<IEPin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    ePinCode: '',
    state: 'Maharashtra',
    referrerId: user?.memberId || ''
  });

  useEffect(() => {
    async function fetchPins() {
      try {
        const res = await epinsAPI.getMyPins();
        if (res.data.success && res.data.data) {
          setPins(res.data.data.unused || []);
          if ((res.data.data.unused || []).length > 0) {
            setFormData(prev => ({ ...prev, ePinCode: res.data.data!.unused[0].pinCode }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch pins', err);
      }
    }
    fetchPins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.ePinCode) {
      setError('Please select an E-Pin first');
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        setSuccess(`Successfully registered ${formData.name}!`);
        setFormData({ ...formData, name: '', mobile: '', email: '', password: '' });
        // Refresh pins
        const pinRes = await epinsAPI.getMyPins();
        if (pinRes.data.data) setPins(pinRes.data.data.unused || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Lakshadweep', 'Puducherry'
  ];

  return (
    <DashboardLayout pageTitle="Manual Onboarding">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#131241] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl border border-white/[0.05] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#60A5FA]/5 blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10 mb-8">
            <h2 className="text-2xl font-bold">Register New Member</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Direct manual entry using E-Pin</p>
          </div>

          {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold px-6 py-4 rounded-2xl mb-8">⚠️ {error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold px-6 py-4 rounded-2xl mb-8">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-3">Select Available E-Pin</label>
              {pins.length === 0 ? (
                <div className="py-2 text-rose-400 text-xs font-bold">No unused E-Pins available in your wallet.</div>
              ) : (
                <select 
                  value={formData.ePinCode}
                  onChange={(e) => setFormData({...formData, ePinCode: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#60A5FA]"
                >
                  {pins.map(pin => (
                    <option key={pin._id} value={pin.pinCode} className="bg-[#131241]">
                      {pin.pinCode} ({pin.plan.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#60A5FA]" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#60A5FA]" 
                  placeholder="9876543210" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#60A5FA]" 
                placeholder="member@email.com" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#60A5FA]" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">State</label>
                <select 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#60A5FA] appearance-none"
                >
                  {states.map(s => <option key={s} value={s} className="bg-[#131241]">{s}</option>)}
                </select>
              </div>
            </div>

            <button 
              disabled={loading || pins.length === 0}
              className="w-full bg-[#60A5FA] py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-black hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#60A5FA]/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
