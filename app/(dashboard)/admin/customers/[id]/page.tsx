'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { publicAPI } from '@/lib/api';
import { ISale } from '@/types';
import toast from 'react-hot-toast';
import { User, MapPin, Briefcase, FileText, Users, HeartPulse, CreditCard, Calendar, Download, FileSpreadsheet } from 'lucide-react';

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<ISale | null>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await publicAPI.getKycSale(params.id as string);
        if (res.data.success) {
          setSale(res.data.data.sale);
          setKycData(res.data.data.kycData);
        }
      } catch (err: any) {
        toast.error('Failed to load customer profile');
        router.push('/admin/customers');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [params.id]);

  const exportPDF = () => {
    window.print();
  };

  const exportExcel = () => {
    if (!sale) return;
    
    let content = `CUSTOMER PROFILE\n\n`;
    content += `Name,${sale.customerName}\n`;
    content += `Mobile,${sale.customerMobile}\n`;
    content += `Email,${sale.customerEmail || 'N/A'}\n`;
    content += `DOB,${sale.customerDOB || 'N/A'}\n`;
    content += `PAN,${sale.customerPAN || 'N/A'}\n`;
    content += `State,${sale.customerState || 'N/A'}\n`;
    
    content += `\nPOLICY DETAILS\n`;
    content += `Policy ID,${sale.policyId}\n`;
    content += `Plan,${(sale.plan as any)?.name || 'N/A'}\n`;
    content += `Amount,Rs. ${sale.saleAmount / 100}\n`;
    content += `Status,${sale.status}\n`;
    content += `Enrollment Date,${new Date(sale.createdAt).toLocaleDateString()}\n`;
    
    if (kycData) {
      content += `\nKYC & ADDRESS\n`;
      content += `Address,${kycData.addressLine1} ${kycData.addressLine2 || ''} ${kycData.city} ${kycData.state} ${kycData.pincode}\n`;
      content += `Occupation,${kycData.occupation || 'N/A'}\n`;
      content += `Marital Status,${kycData.maritalStatus || 'N/A'}\n`;
      content += `Gender,${kycData.gender || 'N/A'}\n`;
      
      content += `\nHEALTH DETAILS\n`;
      content += `Medical Conditions,${kycData.existingMedicalConditions || 'None'}\n`;
      content += `Medications,${kycData.currentMedications || 'None'}\n`;
      content += `Lifestyle,${kycData.lifestyle || 'N/A'}\n`;
      
      content += `\nNOMINEE DETAILS\n`;
      content += `Nominee Name,${kycData.nomineeName || sale.nomineeName}\n`;
      content += `Relation,${kycData.nomineeRelation || sale.nomineeRelation}\n`;
      content += `DOB,${kycData.nomineeDOB || 'N/A'}\n`;
      content += `Contact,${kycData.nomineeContact || 'N/A'}\n`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Customer_${sale.customerName}_${sale.policyId}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Customer Profile">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sale) return null;

  return (
    <DashboardLayout pageTitle="Customer Profile">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#131241] p-6 rounded-3xl border border-white/5 shadow-2xl animate-slide-up no-print">
           <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Profile Details</h1>
              <p className="text-xs text-white/40 font-bold tracking-widest uppercase mt-1">Policy: {sale.policyId}</p>
           </div>
           <div className="flex gap-3">
              <button onClick={exportPDF} className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                <Download size={14} /> Export PDF
              </button>
              <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                <FileSpreadsheet size={14} /> Export Excel
              </button>
              <button onClick={() => router.back()} className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Go Back
              </button>
           </div>
        </div>

        <div id="print-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-[#131241] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-3xl mb-6">
                 {sale.customerName[0]}
               </div>
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">{sale.customerName}</h2>
               <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mt-1">{(sale.plan as any)?.name || 'Health Plan'}</p>
               
               <div className="mt-8 space-y-5">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><User size={18} /></div>
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Mobile</p>
                     <p className="text-sm font-bold text-white">{sale.customerMobile}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><Briefcase size={18} /></div>
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Email ID</p>
                     <p className="text-sm font-bold text-white break-all">{sale.customerEmail || 'Not Provided'}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><Calendar size={18} /></div>
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Date of Birth</p>
                     <p className="text-sm font-bold text-white">{sale.customerDOB || kycData?.dob || 'Not Provided'}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><FileText size={18} /></div>
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">PAN Number</p>
                     <p className="text-sm font-bold text-white uppercase">{sale.customerPAN || kycData?.pan || 'Not Provided'}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><CreditCard size={18} /></div>
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Status</p>
                     <p className="text-sm font-black text-emerald-400 uppercase tracking-wider">{sale.status}</p>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="bg-[#131241] p-8 rounded-3xl border border-white/5 shadow-2xl">
               <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                 <Users size={16} className="text-purple-400" /> Nominee Details
               </h3>
               <div className="space-y-4">
                 <div>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Nominee Name</p>
                   <p className="text-sm font-bold text-white">{kycData?.nomineeName || sale.nomineeName || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Relationship</p>
                   <p className="text-sm font-bold text-white">{kycData?.nomineeRelation || sale.nomineeRelation || 'N/A'}</p>
                 </div>
                 {kycData?.nomineeDOB && (
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Date of Birth</p>
                     <p className="text-sm font-bold text-white">{kycData.nomineeDOB}</p>
                   </div>
                 )}
                 {kycData?.nomineeContact && (
                   <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Contact No</p>
                     <p className="text-sm font-bold text-white">{kycData.nomineeContact}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Column: Address, Family, Health */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {kycData ? (
              <>
                <div className="bg-[#131241] p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <MapPin size={16} className="text-rose-400" /> Address & Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Full Address</p>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {kycData.addressLine1} {kycData.addressLine2 && <br/>} {kycData.addressLine2}
                        <br />{kycData.city}, {kycData.state} - {kycData.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Gender / Marital</p>
                      <p className="text-sm font-bold text-white">{kycData.gender} / {kycData.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Occupation</p>
                      <p className="text-sm font-bold text-white">{kycData.occupation}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#131241] p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <HeartPulse size={16} className="text-emerald-400" /> Health & Wellness
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Existing Medical Conditions</p>
                      <p className="text-sm font-bold text-white">{kycData.existingMedicalConditions || 'None reported'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Current Medications</p>
                      <p className="text-sm font-bold text-white">{kycData.currentMedications || 'None reported'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Lifestyle</p>
                      <p className="text-sm font-bold text-white">{kycData.lifestyle || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#131241] p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <Users size={16} className="text-blue-400" /> Family Members Added ({kycData.familyDetails?.length || 0})
                  </h3>
                  {kycData.familyDetails && kycData.familyDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                            <th className="py-4">Name</th>
                            <th className="py-4">Relation</th>
                            <th className="py-4">DOB</th>
                            <th className="py-4">Gender</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {kycData.familyDetails.map((f: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-4 text-sm font-bold text-white">{f.name}</td>
                              <td className="py-4 text-sm text-white/70">{f.relation}</td>
                              <td className="py-4 text-sm text-white/70">{f.dob}</td>
                              <td className="py-4 text-sm text-white/70">{f.gender}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">No family members added.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#131241] p-12 rounded-3xl border border-white/5 shadow-2xl text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">KYC Not Completed</h3>
                <p className="text-sm text-white/50 max-w-sm">The customer has not completed their detailed profile form yet. Only basic sale details are available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
