'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CommissionConfigPage() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await adminAPI.getCommissionConfig();
      if (res.data.success) {
        setConfig(res.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminAPI.updateCommissionConfig(config);
      if (res.data.success) {
        toast.success('Configuration updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Commission Engine">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Commission Engine">
      <div className="space-y-8 pb-20">
        {/* Header Area */}
        <div className="bg-[#131241] rounded-[2.5rem] p-10 shadow-2xl border border-white/[0.03] relative group">
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-3xl -mr-48 -mt-48 group-hover:bg-[#10b981]/10 transition-all duration-700" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">SYSTEM ADMINISTRATION</p>
            <h1 className="text-4xl font-black text-white tracking-tight font-display">Commission Engine</h1>
            <p className="text-sm text-white/40 mt-6 max-w-2xl leading-relaxed">
              Configure the global commission percentages and financial rules for the CureBharat GBM network. 
              Changes here apply instantly to all new sales generated across the platform.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Configuration Card */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#131241] rounded-[2.5rem] p-10 shadow-2xl border border-white/[0.03] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  Commission Waterfall (%)
                </h3>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#10b981]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><path d="M17 6h6v6"></path></svg>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ConfigInput 
                  label="HCC Direct Commission" 
                  value={config.hcc_direct_percent || '40'} 
                  onChange={(v) => updateField('hcc_direct_percent', v)}
                  description="Percentage of BV earned by the seller (HCC)."
                />
                <ConfigInput 
                  label="HCM Override Bonus" 
                  value={config.hcm_override_percent || '40'} 
                  onChange={(v) => updateField('hcm_override_percent', v)}
                  description="Percentage of the Direct Commission earned by the upline HCM."
                />
                <ConfigInput 
                  label="HBA Override Bonus" 
                  value={config.hba_override_percent || '40'} 
                  onChange={(v) => updateField('hba_override_percent', v)}
                  description="Percentage of the HCM Bonus earned by the upline HBA."
                />
                <ConfigInput 
                  label="SH Leadership Bonus" 
                  value={config.sh_leadership_percent || '2'} 
                  onChange={(v) => updateField('sh_leadership_percent', v)}
                  description="Direct percentage of BV earned by the State Head (SH)."
                />
              </div>
            </div>

            <div className="bg-[#131241] rounded-[2.5rem] p-10 shadow-2xl border border-white/[0.03] relative overflow-hidden group">
               <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                  Financial & Tax Controls
                </h3>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ConfigInput 
                  label="TDS Rate (%)" 
                  value={config.tds_percent || '5'} 
                  onChange={(v) => updateField('tds_percent', v)}
                  description="Tax Deducted at Source percentage for all payouts."
                />
                <ConfigInput 
                  label="Min. Withdrawal (₹)" 
                  value={config.min_withdrawal_amount || '500'} 
                  onChange={(v) => updateField('min_withdrawal_amount', v)}
                  description="Minimum wallet balance required to request a payout."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/[0.03] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl -mr-16 -mt-16" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-center">ACTION HUB</h4>
              <button 
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#10b981]/20 flex items-center justify-center gap-4 active:scale-95"
              >
                {saving ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {saving ? 'UPDATING...' : 'SAVE CONFIGURATION'}
              </button>
              <div className="mt-8 flex items-center justify-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                 <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                   System Online & Syncing
                 </p>
              </div>
              <p className="text-[9px] font-bold text-white/10 uppercase mt-8 text-center leading-relaxed">
                Last Sync: {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'Just Now'}
              </p>
            </div>

            <div className="bg-[#131241] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/[0.03] relative overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">ENGINE PROTOCOLS</h4>
              <div className="space-y-8">
                <InfoItem 
                  label="Settlement Cycle" 
                  value="Monthly (T+5)" 
                  color="text-[#10b981]"
                />
                <InfoItem 
                  label="Commission Logic" 
                  value="Waterfall BV" 
                  color="text-[#10b981]"
                />
                <InfoItem 
                  label="Active Triggers" 
                  value="Real-time" 
                  color="text-[#10b981]"
                />
              </div>
              <div className="mt-10 p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <p className="text-[10px] font-bold text-amber-500/60 leading-relaxed text-center italic">
                  ⚠️ Protocol Note: Changes to commission rates will NOT affect legacy sales processed before the sync date.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function ConfigInput({ label, value, onChange, description }: { label: string, value: string, onChange: (v: string) => void, description: string }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">{label}</label>
      <div className="relative group">
        {/* Issue #5/#6 fix: hide native number spinners, add right padding to avoid overlap */}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          max="100"
          step="0.01"
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 pr-20 text-sm font-black text-white outline-none focus:border-[#10b981]/50 focus:bg-white/[0.05] transition-all tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {/* Badge floats clear of the input value */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 group-focus-within:text-[#10b981] transition-colors tracking-widest pointer-events-none bg-white/5 px-2 py-1 rounded-lg border border-white/5">
          VAL
        </div>
      </div>
      <p className="text-[9px] font-bold text-white/20 pl-1 leading-relaxed">{description}</p>
    </div>
  );
}

function InfoItem({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center pb-5 border-b border-white/[0.03] last:border-0 last:pb-0">
      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-black ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}
