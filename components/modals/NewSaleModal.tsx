'use client';

import { useState, useEffect } from 'react';
import { plansAPI, salesAPI } from '@/lib/api';
import { IPlan } from '@/types';
import { toast } from 'react-hot-toast';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewSaleModal({ isOpen, onClose, onSuccess }: NewSaleModalProps) {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    planId: '',
    ePinCode: '',
  });

  const selectedPlan = plans.find(p => p._id === formData.planId);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await plansAPI.getAll();
      if (res.data.success) {
        setPlans((res.data.data ?? []).filter((p: any) => p.isActive));
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planId) return toast.error('Please select a plan');
    
    setSubmitting(true);
    try {
      const res = await salesAPI.create(formData);
      if (res.data.success) {
        toast.success('Sale recorded successfully!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-[#6029F1] to-[#131241] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32" />
          <h2 className="text-2xl font-bold font-display relative z-10">Record New Sale</h2>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest relative z-10 mt-1">Personal Business Submission</p>
          
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all z-20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
              <input 
                type="text" 
                required
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#6029F1] focus:bg-white transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <input 
                type="tel" 
                required
                pattern="[0-9]{10}"
                value={formData.customerMobile}
                onChange={(e) => setFormData({...formData, customerMobile: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#6029F1] focus:bg-white transition-all"
                placeholder="10-digit number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product/Plan</label>
            <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-4 text-[10px] font-bold text-slate-400 animate-pulse">FETCHING PLANS...</div>
              ) : plans.map((plan) => (
                <label 
                  key={plan._id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData.planId === plan._id 
                    ? 'bg-[#6029F1]/5 border-[#6029F1] shadow-sm' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="plan" 
                      className="hidden"
                      checked={formData.planId === plan._id}
                      onChange={() => setFormData({...formData, planId: plan._id})}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.planId === plan._id ? 'border-[#6029F1]' : 'border-slate-300'}`}>
                      {formData.planId === plan._id && <div className="w-2 h-2 rounded-full bg-[#6029F1]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{plan.name}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{plan.category}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-[#6029F1]">₹{(plan.price / 100).toLocaleString('en-IN')}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Pin Code (Optional)</label>
            <input 
              type="text" 
              value={formData.ePinCode}
              onChange={(e) => setFormData({...formData, ePinCode: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-[#6029F1] focus:bg-white transition-all tracking-[0.2em] uppercase"
              placeholder="ENTER PIN IF PAID VIA EPIN"
            />
          </div>

          {selectedPlan && (
            <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Amount</span>
                <span className="text-sm font-bold text-slate-700">₹{(selectedPlan.price / 118 * 100 / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GST (18%)</span>
                <span className="text-sm font-bold text-slate-700">₹{(selectedPlan.price / 118 * 18 / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#6029F1] uppercase tracking-[0.2em]">Total Premium</span>
                <span className="text-xl font-bold text-[#6029F1]">₹{(selectedPlan.price / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={submitting}
            className={`w-full bg-[#6029F1] text-white rounded-[1.25rem] py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#6029F1]/20 transition-all active:scale-95 ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
          >
            {submitting ? 'PROCESSING SALE...' : 'CONFIRM & SUBMIT SALE'}
          </button>
        </form>
      </div>
    </div>
  );
}
