'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { plansAPI } from '@/lib/api';
import { IPlan } from '@/types';
import { toast } from 'react-hot-toast';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    category: 'service',
    price: 0,
    businessVolume: 0,
    isCommissionable: true,
    description: '',
    isActive: true
  });
  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await plansAPI.getAllAdmin();
      if (res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (error: any) {
      toast.error('Failed to fetch plans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan: IPlan | null = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        category: plan.category || 'service',
        price: plan.price / 100, // Convert paise to rupees
        businessVolume: (plan.businessVolume || 0) / 100,
        isCommissionable: plan.isCommissionable,
        description: plan.description || '',
        isActive: plan.isActive
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        category: 'service',
        price: 0,
        businessVolume: 0,
        isCommissionable: true,
        description: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', String(formData.price * 100));
    data.append('businessVolume', String(formData.businessVolume * 100));
    data.append('isCommissionable', String(formData.isCommissionable));
    data.append('description', formData.description);
    data.append('isActive', String(formData.isActive));
    if (brochureFile) {
      data.append('brochure', brochureFile);
    }

    try {
      let res;
      if (editingPlan) {
        res = await plansAPI.update(editingPlan._id, data);
      } else {
        res = await plansAPI.create(data);
      }

      if (res.data.success) {
        toast.success(editingPlan ? 'Plan updated' : 'Plan created');
        setIsModalOpen(false);
        setBrochureFile(null);
        fetchPlans();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await plansAPI.delete(id);
      if (res.data.success) {
        toast.success('Plan deleted');
        fetchPlans();
      }
    } catch (error: any) {
      toast.error('Failed to delete plan');
    }
  };

  const filteredPlans = filterCategory === 'all' 
    ? plans 
    : plans.filter(p => p.category === filterCategory);

  return (
    <DashboardLayout pageTitle="Plans & Products">
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">CUREBHARAT / ADMIN / PLANS & PRODUCTS</p>
            <h1 className="text-3xl font-bold text-[#000000] font-display">Product Catalog</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Issue #7 fix: was plain white bg, now themed to match app dark palette */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#131241] text-white border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#6029F1]/60 shadow-sm appearance-none cursor-pointer hover:border-white/20 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="onboarding">Onboarding</option>
              <option value="service">Service</option>
            </select>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#6029F1] px-6 py-2.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#6029F1]/20 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Plan
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PlanStat label="TOTAL PLANS" value={String(plans.length)} sub="In database" icon="plan" color="text-[#60A5FA]" />
          <PlanStat label="ACTIVE PLANS" value={String(plans.filter(p => p.isActive).length)} sub="Live on marketplace" icon="bolt" color="text-[#34d399]" />
          <PlanStat label="ONBOARDING" value={String(plans.filter(p => p.category === 'onboarding').length)} sub="Entry level" icon="ticket" color="text-[#fbbf24]" />
          <PlanStat label="COMMISSIONABLE" value={String(plans.filter(p => p.isCommissionable).length)} sub="Earnings eligible" icon="key" color="text-[#6029F1]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Plans Grid */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading catalog...</div>
            ) : filteredPlans.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No plans found in this category.</div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan._id} className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03] group hover:border-[#6029F1]/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#6029F1]/10 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6029F1" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-widest border ${
                          plan.isActive ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30' : 'bg-white/5 text-white/20 border-white/10'
                        }`}>
                          {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{plan.category}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
                    <p className="text-xs text-white/40 font-medium mb-6 leading-relaxed h-10 line-clamp-2">{plan.description}</p>

                    <div className="mb-8">
                      <p className="text-3xl font-bold font-display text-white">₹{(plan.price / 100).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
                        {plan.isCommissionable ? 'Commissionable' : 'No Payout'}
                      </p>
                    </div>

                    <div className="flex gap-3 mb-3">
                      {plan.brochureUrl && (
                        <>
                          <a 
                            href={plan.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-[#6029F1]/10 hover:bg-[#6029F1]/20 text-[#6029F1] rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-[#6029F1]/20 transition-all"
                          >
                            View Brochure
                          </a>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                toast.loading('Preparing brochure...', { id: 'share-brochure' });
                                const response = await fetch(plan.brochureUrl!);
                                const blob = await response.blob();
                                const extension = plan.brochureUrl!.split('.').pop()?.split('?')[0] || 'pdf';
                                const file = new File([blob], `${plan.name}-Brochure.${extension}`, { type: blob.type });
                                
                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                  await navigator.share({
                                    title: plan.name + ' Brochure',
                                    files: [file]
                                  });
                                  toast.success('Shared successfully!', { id: 'share-brochure' });
                                } else {
                                  navigator.clipboard.writeText(plan.brochureUrl!);
                                  toast.success('Brochure link copied to clipboard!', { id: 'share-brochure' });
                                }
                              } catch (error) {
                                console.error(error);
                                navigator.clipboard.writeText(plan.brochureUrl!);
                                toast.success('Brochure link copied!', { id: 'share-brochure' });
                              }
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                          >
                            Share
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleOpenModal(plan)}
                        className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(plan._id)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-[#131241] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#131241] border-b border-white/10 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6029F1]/20 blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <h2 className="text-2xl font-bold font-display relative z-10">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10 mt-1">Product Configuration</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#6029F1] focus:ring-1 focus:ring-[#6029F1] transition-all"
                    placeholder="e.g. Super Suraksha"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#12151c] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#6029F1] transition-all appearance-none"
                  >
                    <option value="service">Service Sale (Commissionable)</option>
                    <option value="onboarding">Onboarding (Entry Only)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#6029F1] focus:ring-1 focus:ring-[#6029F1] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Brochure (Image/PDF)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setBrochureFile(e.target.files?.[0] || null)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none focus:border-[#6029F1] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-[#6029F1] file:text-white hover:file:brightness-110 cursor-pointer"
                />
                {editingPlan?.brochureUrl && !brochureFile && (
                  <p className="text-[10px] text-white/40 mt-1">Current brochure exists. Uploading a new one will replace it.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-[#6029F1] focus:ring-1 focus:ring-[#6029F1] transition-all min-h-[100px]"
                  placeholder="Short product overview..."
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.isActive ? 'bg-[#6029F1]' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Status</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.isCommissionable ? 'bg-[#34d399]' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isCommissionable ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.isCommissionable}
                    onChange={(e) => setFormData({...formData, isCommissionable: e.target.checked})}
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Eligible</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-[#6029F1] hover:brightness-110 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#6029F1]/20 transition-all"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function PlanStat({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-[#131241] rounded-[1.5rem] p-6 text-white shadow-xl border border-white/[0.03] relative group">
       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-3xl font-bold font-display mb-2">{value}</p>
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
       <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-40 ${color}`}>
          {icon === 'plan' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"></path></svg>}
          {icon === 'ticket' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
          {icon === 'key' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z"></path></svg>}
          {icon === 'bolt' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>}
       </div>
    </div>
  );
}
