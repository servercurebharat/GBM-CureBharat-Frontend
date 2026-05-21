'use client';

import { useState, useEffect } from 'react';
import { salesAPI, plansAPI } from '@/lib/api';
import { IPlan, IUser } from '@/types';
import toast from 'react-hot-toast';

export default function NewSaleSection({ user }: { user: IUser }) {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    planId: ''
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansAPI.getAll();
        if (res.data.success) {
          setPlans((res.data.data || []).filter((p: IPlan) => p.isActive));
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planId) return toast.error('Please select a plan');
    
    setSubmitting(true);
    try {
      const res = await salesAPI.create(formData);
      if (res.data.success) {
        toast.success('Sale recorded successfully!');
        setFormData({ customerName: '', customerMobile: '', planId: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = plans.find(p => p._id === formData.planId);
  const gstAmount = selectedPlan ? Math.round((selectedPlan.price * (selectedPlan.gstPercent || 18)) / 100) : 0;
  const totalAmount = selectedPlan ? selectedPlan.price + gstAmount : 0;
  const estimatedCommission = selectedPlan ? Math.round(selectedPlan.businessVolume * 0.4) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      
      {/* Main Entry Form */}
      <div className="lg:col-span-8">
        <div className="bg-[#131241] rounded-[32px] p-10 shadow-2xl border border-white/5 space-y-10 min-h-[600px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32" />
          
          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-bold text-white tracking-tight">Record New Policy Sale</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Authorized Transaction Form</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#B5B8BD] uppercase tracking-[0.2em] pl-1">Customer Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[#60A5FA]/40 transition-all shadow-inner"
                    placeholder="Enter customer name"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#B5B8BD] uppercase tracking-[0.2em] pl-1">Customer Mobile Number</label>
                  <input 
                    required
                    maxLength={10}
                    type="text" 
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({...formData, customerMobile: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[#60A5FA]/40 transition-all shadow-inner"
                    placeholder="10-digit mobile"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#B5B8BD] uppercase tracking-[0.2em] pl-1">Select Wellness Plan</label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.planId}
                      onChange={(e) => setFormData({...formData, planId: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer focus:border-[#60A5FA]/40 transition-all shadow-inner"
                    >
                       <option value="" className="bg-[#131241]">Choose a plan...</option>
                       {plans.map(p => (
                         <option key={p._id} value={p._id} className="bg-[#131241]">
                            {p.name} (₹{(p.price / 100).toLocaleString()})
                         </option>
                       ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
               </div>
               {/* E-Pin logic removed */}
            </div>

            <div className="pt-10 border-t border-white/5">
              <button 
                disabled={submitting || loadingPlans}
                type="submit"
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? 'Transmitting Data...' : 'Confirm & Process Sale'}
              </button>
              <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest mt-4">
                By submitting, you confirm the customer details are accurate and verified.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar Summary */}
      <div className="lg:col-span-4 space-y-6">
         
         {/* Live Billing Preview */}
         <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#60A5FA]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#60A5FA]/10 transition-colors" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8 flex items-center gap-2">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
               Billing Preview
            </h3>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Base Plan Amount</span>
                  <span className="text-sm font-bold text-white">₹{(selectedPlan?.price || 0) / 100}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">GST ({selectedPlan?.gstPercent || 18}%)</span>
                  <span className="text-sm font-bold text-white">₹{gstAmount / 100}</span>
               </div>
               <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs font-black text-[#60A5FA] uppercase tracking-widest">Total Payable</span>
                  <span className="text-2xl font-black text-white">₹{(totalAmount / 100).toLocaleString('en-IN')}</span>
               </div>
            </div>
         </div>

         {/* Estimated Commission */}
         <div className="bg-[#131241] rounded-[32px] p-8 shadow-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-8 flex items-center gap-2">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
               Commission Estimate
            </h3>
            
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Direct Sponsor Income</p>
               <h4 className="text-2xl font-black text-white">₹{(estimatedCommission / 100).toLocaleString('en-IN')}</h4>
               <p className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-tighter mt-1">40% OF BUSINESS VOLUME</p>
            </div>

            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mt-0.5">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[10px] font-medium text-[#B5B8BD] leading-relaxed">Commission credited to <span className="text-white font-bold">Provisional Wallet</span> instantly.</p>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mt-0.5">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[10px] font-medium text-[#B5B8BD] leading-relaxed">Override flow triggered for upline managers automatically.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
