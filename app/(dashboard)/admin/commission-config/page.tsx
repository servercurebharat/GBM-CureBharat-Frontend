'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function CommissionConfig() {
  const [config, setConfig] = useState({
    hcc_direct_percent: 40,
    hcm_override_percent: 40,
    hba_override_percent: 40,
    sh_leadership_percent: 2,
    min_sales_active: 1,
    hcc_to_hcm_sales: 12,
    hcc_to_hcm_recruits: 12
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const res = await adminAPI.getCommissionConfig();
      if (res.data.success) {
        setConfig(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      addToast({ message: 'Failed to load system config', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await adminAPI.updateCommissionConfig(config);
      if (res.data.success) {
        addToast({ message: 'Configuration saved successfully', type: 'success' });
      }
    } catch (err: any) {
      addToast({ message: err.response?.data?.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  // Live Preview Calculation
  const sampleSale = 199900; // ₹1999
  const sampleBV = Math.round(sampleSale / 1.18); // GST deduction simulation
  const hccIncome = Math.round((sampleBV * config.hcc_direct_percent) / 100);
  const hcmIncome = Math.round((hccIncome * config.hcm_override_percent) / 100);
  const hbaIncome = Math.round((hcmIncome * config.hba_override_percent) / 100);
  const shIncome = Math.round((sampleBV * config.sh_leadership_percent) / 100);

  const format = (v: number) => `₹${(v / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout pageTitle="System Configuration">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Settings Column */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-surface border border-white/[0.07] rounded-[32px] p-8 md:p-10 shadow-2xl">
              <div className="mb-10">
                 <h3 className="font-display text-xl font-bold text-white mb-1 tracking-tight">Commission Engine Parameters</h3>
                 <p className="text-xs text-muted font-medium uppercase tracking-widest">Adjust the waterfall distribution percentages</p>
              </div>

              <div className="space-y-10">
                 <ConfigSlider 
                   label="HCC Direct Commission" 
                   desc="% of Business Volume (BV) paid to the seller"
                   val={config.hcc_direct_percent}
                   onChange={(v) => setConfig({...config, hcc_direct_percent: v})}
                   color="#60a5fa"
                 />
                 <ConfigSlider 
                   label="HCM Override Bonus" 
                   desc="% of HCC earnings paid to the direct Manager"
                   val={config.hcm_override_percent}
                   onChange={(v) => setConfig({...config, hcm_override_percent: v})}
                   color="#f87171"
                 />
                 <ConfigSlider 
                   label="HBA Override Bonus" 
                   desc="% of HCM earnings paid to the Business Associate"
                   val={config.hba_override_percent}
                   onChange={(v) => setConfig({...config, hba_override_percent: v})}
                   color="#3b82f6"
                 />
                 <ConfigSlider 
                   label="SH Leadership Bonus" 
                   desc="% of total State BV paid to the State Head"
                   val={config.sh_leadership_percent}
                   max={5}
                   onChange={(v) => setConfig({...config, sh_leadership_percent: v})}
                   color="#34d399"
                 />

                 <div className="pt-10 border-t border-white/[0.07] grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ConfigInput 
                      label="Active Threshold" 
                      desc="Min sales/month"
                      val={config.min_sales_active}
                      onChange={(v) => setConfig({...config, min_sales_active: v})}
                    />
                    <ConfigInput 
                      label="Rank Sales" 
                      desc="HCC → HCM sales"
                      val={config.hcc_to_hcm_sales}
                      onChange={(v) => setConfig({...config, hcc_to_hcm_sales: v})}
                    />
                    <ConfigInput 
                      label="Rank Team" 
                      desc="HCC → HCM recruits"
                      val={config.hcc_to_hcm_recruits}
                      onChange={(v) => setConfig({...config, hcc_to_hcm_recruits: v})}
                    />
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/[0.07] flex gap-4">
                 <button 
                   disabled={saving || loading}
                   onClick={handleSave}
                   className="flex-1 py-5 rounded-2xl bg-white text-[#0d0f14] font-black text-sm uppercase tracking-widest hover:bg-admin transition-all disabled:opacity-20 shadow-2xl shadow-white/5"
                 >
                   {saving ? 'Applying Updates...' : 'Save Configuration'}
                 </button>
                 <button 
                   onClick={fetchConfig}
                   className="px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/[0.05] transition-all"
                 >
                   Reset
                 </button>
              </div>
           </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-surface border border-white/[0.07] rounded-[32px] p-8 shadow-2xl sticky top-24 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-admin/5 blur-3xl -mr-16 -mt-16 group-hover:bg-admin/10 transition-colors" />
              
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-8 relative z-10">Waterfall Simulation</h4>
              <div className="space-y-6 relative z-10">
                 <div className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl mb-8">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Scenario: Super Suraksha Sale</p>
                    <p className="text-xl font-display font-bold text-white">₹1,999.00 <span className="text-[10px] text-muted font-sans font-medium uppercase tracking-tighter">(BV: {format(sampleBV)})</span></p>
                 </div>

                 <PreviewRow label="HCC Income (Direct)" val={format(hccIncome)} percent={config.hcc_direct_percent} color="#60a5fa" />
                 <PreviewRow label="HCM Income (Override)" val={format(hcmIncome)} percent={config.hcm_override_percent} color="#f87171" />
                 <PreviewRow label="HBA Income (Override)" val={format(hbaIncome)} percent={config.hba_override_percent} color="#3b82f6" />
                 <PreviewRow label="SH Income (Leadership)" val={format(shIncome)} percent={config.sh_leadership_percent} color="#34d399" />

                 <div className="pt-6 mt-6 border-t border-white/[0.07] flex justify-between items-center">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Total Distributed</p>
                    <p className="text-sm font-black text-admin">{format(hccIncome + hcmIncome + hbaIncome + shIncome)}</p>
                 </div>
              </div>

              <div className="mt-8 p-4 bg-admin/5 border border-admin/10 rounded-xl">
                 <p className="text-[9px] font-bold text-admin uppercase tracking-widest leading-relaxed text-center">
                   Changes apply globally to all subsequent commission calculations once saved.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ConfigSlider({ label, desc, val, onChange, color, max = 100 }: any) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-end">
          <div>
             <h5 className="text-sm font-bold text-white tracking-tight uppercase">{label}</h5>
             <p className="text-[10px] text-muted font-medium">{desc}</p>
          </div>
          <div className="text-xl font-display font-bold" style={{ color }}>{val}%</div>
       </div>
       <input 
         type="range" min="0" max={max} step="1"
         value={val}
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="w-full h-1.5 bg-surface2 rounded-full appearance-none cursor-pointer accent-white"
         style={{ background: `linear-gradient(to right, ${color} ${val * (100 / max)}%, #1c2030 ${val * (100 / max)}%)` }}
       />
    </div>
  );
}

function ConfigInput({ label, desc, val, onChange }: any) {
  return (
    <div className="space-y-2">
       <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
       <input 
         type="number"
         value={val}
         onChange={(e) => onChange(parseInt(e.target.value) || 0)}
         className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-admin/50 transition-all"
       />
       <p className="text-[8px] text-muted font-medium uppercase tracking-tighter">{desc}</p>
    </div>
  );
}

function PreviewRow({ label, val, percent, color }: any) {
  return (
    <div className="flex justify-between items-center group/row">
       <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest group-hover/row:text-white transition-colors">{label}</span>
       </div>
       <div className="text-right">
          <div className="text-xs font-bold text-white">{val}</div>
          <div className="text-[8px] text-muted font-bold uppercase tracking-tighter" style={{ color }}>{percent}%</div>
       </div>
    </div>
  );
}
