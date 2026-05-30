'use client';

import { useState, useEffect } from 'react';
import { plansAPI } from '@/lib/api';
import { IPlan, IUser } from '@/types';
import toast from 'react-hot-toast';

export default function ProductCatalog({ user }: { user: IUser }) {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

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
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const generateLink = (planId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/buy/${user.memberId}?planId=${planId}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-[#131241] rounded-[2rem] animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <p className="text-[10px] font-black text-[#49D2B5] uppercase tracking-[0.4em] mb-2">Marketing Tools</p>
           <h2 className="text-3xl font-black text-white tracking-tight uppercase">Product Catalog</h2>
           <p className="text-xs text-white/40 mt-1 font-medium">Select a plan to generate and share your personalized referral link</p>
        </div>

        <div className="flex items-center gap-4 bg-[#131241] p-2 rounded-2xl border border-white/5 shadow-2xl">
           <div className="w-10 h-10 rounded-xl bg-[#49D2B5]/10 flex items-center justify-center text-[#49D2B5]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
           </div>
           <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Link</p>
              <button 
                onClick={() => {
                   const link = `${window.location.origin}/buy/${user.memberId}`;
                   navigator.clipboard.writeText(link);
                   toast.success('Global referral link copied!');
                }}
                className="text-xs font-bold text-white hover:text-[#49D2B5] transition-colors"
              >
                 Copy Root Referral Link
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan._id}
            className={`bg-[#131241] rounded-[2.5rem] p-8 border transition-all duration-500 relative overflow-hidden group ${selectedPlanId === plan._id ? 'border-[#49D2B5] shadow-[0_0_40px_rgba(73,210,181,0.1)]' : 'border-white/5 hover:border-white/10 shadow-2xl'}`}
            onClick={() => setSelectedPlanId(plan._id)}
          >
             {/* Background Gradient */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#49D2B5]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#49D2B5]/10 transition-all duration-700" />
             
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {plan.name.toLowerCase().includes('platinum') ? '💎' : plan.name.toLowerCase().includes('gold') ? '⭐' : <img src="/favicon.ico" alt="Logo" className="w-8 h-8 object-contain" />}
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Business Volume</p>
                      <p className="text-sm font-black text-white">{plan.businessVolume.toLocaleString()}</p>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-white tracking-tight uppercase mb-1">{plan.name}</h3>
                   <p className="text-[10px] text-white/40 font-medium leading-relaxed h-10 line-clamp-2">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-2 pt-4 border-t border-white/5">
                   <span className="text-2xl font-black text-white">₹{(plan.price / 100).toLocaleString()}</span>
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">+18% GST</span>
                </div>

                <div className="space-y-3 pt-2">
                   <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#49D2B5" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Direct Commission Enabled
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#49D2B5" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Instant Policy Generation
                   </div>
                </div>

                <div className="space-y-2">
                  {plan.brochureUrl && (
                    <div className="flex gap-2 w-full">
                      <a 
                        href={plan.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-[#49D2B5]/10 hover:bg-[#49D2B5]/20 text-[#49D2B5] rounded-xl py-4 text-[10px] font-black uppercase tracking-widest border border-[#49D2B5]/20 transition-all"
                      >
                        Brochure
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
                        className="flex-[0.5] bg-white/5 hover:bg-white/10 text-white rounded-xl py-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                      >
                        Share
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      generateLink(plan._id);
                    }}
                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-[#49D2B5] text-white hover:text-[#0d0f14] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-white/10 group-hover:border-[#49D2B5]/50 active:scale-[0.98]"
                  >
                     Generate & Copy Link
                  </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Sharing Tips */}
      <div className="bg-gradient-to-br from-[#131241] to-[#0d0f14] rounded-[3rem] p-10 border border-white/5 flex flex-col md:flex-row items-center gap-10">
         <div className="w-20 h-20 rounded-[2rem] bg-[#49D2B5]/10 flex items-center justify-center text-4xl shadow-2xl">🚀</div>
         <div className="flex-1">
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Grow Your Network Faster</h4>
            <p className="text-xs text-white/40 font-medium leading-relaxed max-w-2xl">
               Generated links include your unique member ID and pre-select the wellness plan for your customers. Sharing a specific plan link reduces friction and increases conversion rates by up to 40%.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-[#49D2B5] transition-all cursor-pointer border border-white/5 hover:border-[#49D2B5]/30">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-[#49D2B5] transition-all cursor-pointer border border-white/5 hover:border-[#49D2B5]/30">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </div>
         </div>
      </div>
    </div>
  );
}
