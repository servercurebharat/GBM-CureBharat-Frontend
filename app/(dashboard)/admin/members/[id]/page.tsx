'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersAPI, adminAPI, plansAPI } from '@/lib/api';
import { IUser, IPlan } from '@/types';
import Link from 'next/link';
import ExportDropdown from '@/components/dashboard/ExportDropdown';
import toast from 'react-hot-toast';

export default function MemberDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<IUser | null>(null);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KYC' | 'NETWORK'>('OVERVIEW');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await usersAPI.getById(id as string);
        if (res.data.success) {
          setMember(res.data.data as IUser);
        }
      } catch (err) {
        console.error('Failed to fetch member details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [id]);

  useEffect(() => {
    plansAPI.getAll().then(res => {
      if (res.data.success) {
        setPlans((res.data.data || []).filter((p: IPlan) => p.isActive));
      }
    }).catch(err => console.error('Error fetching plans:', err));
  }, []);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!member) return;
    setUpdating(true);
    try {
      const res = await adminAPI.updateUserStatus(member._id, newStatus);
      if (res.data.success) {
        setMember({ ...member, status: newStatus as any });
      }
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleKYCUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!member) return;
    setUpdating(true);
    try {
      const res = await adminAPI.updateKYCStatus(member._id, newStatus);
      if (res.data.success) {
        setMember({ ...member, kycStatus: newStatus });
      }
    } catch (err) {
      console.error('KYC update failed', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Member...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10b981]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout pageTitle="Member Not Found">
        <div className="p-20 text-center">
           <h2 className="text-white text-2xl font-bold">Member not found in our database.</h2>
           <Link href="/admin/members" className="mt-6 inline-block text-[#10b981] font-bold underline">Back to List</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={`Audit: ${member.name}`}>
      <div className="space-y-6 pb-20 animate-fade-in max-w-[1600px] mx-auto">
        
        {/* Modern Header Section */}
        <div className="bg-[#131241] rounded-2xl sm:rounded-[32px] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/10 blur-[120px] -mr-48 -mt-48" />
           
           <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
              {/* Identity Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                 <button onClick={() => router.back()} className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl text-white transition-all group active:scale-95">
                    <svg className="group-hover:-translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 </button>
                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[24px] bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl uppercase">
                       {member.name.slice(0, 1)}
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{member.name}</h1>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             member.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                             {member.status}
                          </span>
                       </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-4">
                          <span className="text-xs sm:text-sm font-black text-[#10b981] tracking-widest uppercase">ID: {member.memberId}</span>
                          <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/10" />
                          <div className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border flex items-center gap-2.5 transition-all duration-500 shadow-2xl backdrop-blur-md ${
                             member.role === 'hcc' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5' :
                             member.role === 'hcm' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/5' :
                             member.role === 'hba' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5' :
                             member.role === 'sh' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-purple-500/5' :
                             'bg-white/5 border-white/10 text-white/40'
                          }`}>
                             <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${
                                member.role === 'hcc' ? 'bg-emerald-400' :
                                member.role === 'hcm' ? 'bg-blue-400' :
                                member.role === 'hba' ? 'bg-amber-400' :
                                member.role === 'sh' ? 'bg-purple-400' :
                                'bg-white/20'
                             }`} />
                             <span className="text-[12px] font-black uppercase tracking-[0.3em]">{member.role}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                 <div className="flex bg-black/40 p-1.5 rounded-[20px] border border-white/5 backdrop-blur-md">
                    {(['OVERVIEW', 'KYC', 'NETWORK'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-[12px] sm:rounded-[14px] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          activeTab === tab ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                 </div>
                 <div className="h-10 w-px bg-white/5 hidden xl:block mx-2" />
                 <div className="flex items-center gap-3">
                    {member.status === 'blocked' ? (
                      <button 
                        disabled={updating}
                        onClick={() => handleStatusUpdate('active')}
                        className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-[#131241] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#10b981]/10 disabled:opacity-50"
                      >
                         Activate
                      </button>
                    ) : (
                      <button 
                        disabled={updating}
                        onClick={() => handleStatusUpdate('blocked')}
                        className="px-8 py-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                      >
                         Block
                      </button>
                    )}
                     <ExportDropdown 
                       title={`Member Profile: ${member.name}`}
                       headers={['Field', 'Value']}
                       rows={[
                         ['Name', member.name],
                         ['Member ID', member.memberId],
                         ['Role', member.role],
                         ['Status', member.status],
                         ['Mobile', member.mobile],
                         ['Email', member.email || 'N/A'],
                         ['State', member.state],
                         ['Rank', member.rank],
                         ['Team Size', member.teamSize.toString()],
                         ['Joined', new Date(member.createdAt).toLocaleDateString()]
                       ]}
                       fileName={`Profile_${member.memberId}`}
                       variant="ghost"
                     />
                     <button className="px-8 py-4 bg-white/5 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Reset PWD
                     </button>
                 </div>
              </div>
           </div>
        </div>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Core Info */}
                <div className="lg:col-span-8 space-y-6">
                   <div className="bg-[#131241] rounded-2xl sm:rounded-[32px] p-6 sm:p-10 border border-white/5 shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10b981]" />
                      <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-8 sm:mb-12 flex items-center gap-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                         Profile Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-12">
                         <DetailBlock label="Full Legal Name" value={member.name} icon="user" />
                         <DetailBlock label="Mobile Number" value={member.mobile} icon="phone" />
                         <DetailBlock label="Email Address" value={member.email || 'Not Provided'} icon="mail" />
                         <DetailBlock label="State / Territory" value={member.state} icon="map-pin" />
                         <DetailBlock label="Sponsor Details" value={typeof member.referrerId === 'object' ? `${member.referrerId.name} (${member.referrerId.memberId})` : 'System Direct'} icon="users" />
                         <DetailBlock label="Member Since" value={new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} icon="calendar" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <MiniStat label="Team Size" value={member.teamSize} icon="users" color="blue" />
                      <MiniStat label="Total Sales" value={member.personalSalesCount} icon="zap" color="indigo" />
                      <MiniStat label="Recruits" value={member.personalSalesThisMonth || 0} icon="user-plus" color="emerald" sub="This Month" />
                      <MiniStat label="Rank" value={member.rank} icon="award" color="amber" />
                   </div>
                </div>

                {/* Right: Status & Logs */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-[#131241] rounded-2xl sm:rounded-[32px] p-6 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-10">Access Audit</h3>
                      <div className="space-y-8">
                         <AuditItem label="Account Status" value={member.status} status={member.status} />
                         <AuditItem label="KYC Status" value={member.kycStatus} status={member.kycStatus === 'approved' ? 'active' : 'inactive'} />
                         <div className="h-px bg-white/5" />
                         <AuditItem label="Last Login IP" value={member.lastLoginIP || 'Never Login'} />
                         <AuditItem label="Last Login Time" value={member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'N/A'} />
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-[32px] p-8 shadow-2xl shadow-[#10b981]/10 text-[#131241]">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                         </div>
                         <h4 className="text-sm font-black uppercase tracking-widest">Admin Note</h4>
                      </div>
                      <p className="text-[11px] font-bold leading-relaxed opacity-80">This member is active in the network. Blocking will disable their dashboard access immediately.</p>
                   </div>
                </div>

             </div>

             {/* Referral & Gateway Links Section (FULL WIDTH!) */}
             <div className="bg-[#131241] rounded-[32px] p-8 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                
                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                   Active Referral Gateways
                </h3>

                <div className="space-y-4 relative z-10">
                   {/* Recruiter Link Row */}
                   <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-black/25 rounded-2xl border border-white/5 gap-5 hover:border-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                         <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                         </div>
                         <div className="truncate">
                            <p className="text-[12px] font-black text-white uppercase tracking-widest font-sans">Recruiter Link</p>
                            <p className="text-[9px] font-bold text-slate-500 mt-1.5 truncate">Invite new partners to join downline network</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 w-full xl:w-auto">
                         <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${member.memberId}`}
                            className="flex-1 xl:flex-initial xl:w-[480px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-emerald-400 focus:outline-none select-all"
                         />
                         <button
                            onClick={() => {
                               const link = `${window.location.origin}/register?ref=${member.memberId}`;
                               navigator.clipboard.writeText(link);
                               toast.success('Recruiter link copied!');
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 active:scale-95 transition-all flex-shrink-0"
                            title="Copy Link"
                         >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                         </button>
                         <button
                            onClick={() => {
                               const link = `${window.location.origin}/register?ref=${member.memberId}`;
                               const shareText = `🌟 Join CureBharat Wellness as a Partner! Build your own downline network and unlock real-time overrides and commissions.\n\nRegister now under me 👇\n${link}`;
                               window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
                            title="Share on WhatsApp"
                         >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                         </button>
                      </div>
                   </div>

                   {/* Global Sales Link Row */}
                   <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-black/25 rounded-2xl border border-white/5 gap-5 hover:border-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                         <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                         </div>
                         <div className="truncate">
                            <p className="text-[12px] font-black text-white uppercase tracking-widest font-sans">Global Sales Link (All Plans)</p>
                            <p className="text-[9px] font-bold text-slate-500 mt-1.5 truncate">Let client purchase any wellness plan</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 w-full xl:w-auto">
                         <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/buy/${member.memberId}`}
                            className="flex-1 xl:flex-initial xl:w-[480px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-emerald-400 focus:outline-none select-all"
                         />
                         <button
                            onClick={() => {
                               const link = `${window.location.origin}/buy/${member.memberId}`;
                               navigator.clipboard.writeText(link);
                               toast.success('Global sales link copied!');
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 active:scale-95 transition-all flex-shrink-0"
                            title="Copy Link"
                         >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                         </button>
                         <button
                            onClick={() => {
                               const link = `${window.location.origin}/buy/${member.memberId}`;
                               const shareText = `🌟 Preventative healthcare plans & 10,000+ network hospitals with CureBharat Wellness!\n\nBuy wellness plan now 👇\n${link}`;
                               window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
                            title="Share on WhatsApp"
                         >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                         </button>
                      </div>
                   </div>

                   {/* Individual Sales Plan Links */}
                   {plans.map((plan) => (
                      <div key={plan._id} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-black/25 rounded-2xl border border-white/5 gap-5 hover:border-emerald-500/20 transition-all duration-300">
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 17 22 12"/></svg>
                            </div>
                            <div className="truncate">
                               <p className="text-[12px] font-black text-white uppercase tracking-widest font-sans">{plan.name} Link</p>
                               <p className="text-[9px] font-bold text-slate-500 mt-1.5">Price: ₹{(plan.price / 100).toLocaleString('en-IN')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 w-full xl:w-auto">
                            <input
                               type="text"
                               readOnly
                               value={`${typeof window !== 'undefined' ? window.location.origin : ''}/buy/${member.memberId}?planId=${plan._id}`}
                               className="flex-1 xl:flex-initial xl:w-[480px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-emerald-400 focus:outline-none select-all"
                            />
                            <button
                               onClick={() => {
                                  const link = `${window.location.origin}/buy/${member.memberId}?planId=${plan._id}`;
                                  navigator.clipboard.writeText(link);
                                  toast.success(`${plan.name} link copied!`);
                               }}
                               className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 active:scale-95 transition-all flex-shrink-0"
                               title="Copy Link"
                            >
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                            <button
                               onClick={() => {
                                  const link = `${window.location.origin}/buy/${member.memberId}?planId=${plan._id}`;
                                  const shareText = `🌟 Preventative healthcare plans & 10,000+ network hospitals with CureBharat Wellness!\n\nBuy ${plan.name} plan now 👇\n${link}`;
                                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
                               }}
                               className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
                               title="Share on WhatsApp"
                            >
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>
        )}

        {activeTab === 'KYC' && (
          <div className="space-y-6 animate-slide-up">
             <div className="bg-[#131241] rounded-2xl sm:rounded-[40px] p-6 sm:p-12 border border-white/5 shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-10 mb-10 sm:mb-16">
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">KYC Document Verification</h3>
                      <div className="flex items-center gap-3 mt-3">
                         <div className={`w-2 h-2 rounded-full ${member.kycStatus === 'approved' ? 'bg-[#10b981]' : 'bg-rose-400'} animate-pulse`} />
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Verification Status: {member.kycStatus}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button 
                        disabled={updating || member.kycStatus === 'approved'}
                        onClick={() => handleKYCUpdate('approved')}
                        className="px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-[#131241] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/10 disabled:opacity-40"
                      >
                         Approve Identity
                      </button>
                      <button 
                        disabled={updating || member.kycStatus === 'rejected'}
                        onClick={() => handleKYCUpdate('rejected')}
                        className="px-10 py-5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-rose-500 hover:text-white disabled:opacity-40"
                      >
                         Reject Documents
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <DocumentBox label="Aadhaar Front View" url={member.kycDocuments?.aadhaarFrontUrl} number={member.kycDocuments?.aadhaarNumber} />
                   <DocumentBox label="Aadhaar Back View" url={member.kycDocuments?.aadhaarBackUrl} />
                   <DocumentBox label="Permanent Account Number (PAN)" url={member.kycDocuments?.panUrl} number={member.kycDocuments?.panNumber} />
                   <DocumentBox label="Bank Proof / Passbook" url={member.kycDocuments?.bankProofUrl} number={member.kycDocuments?.accountNumber} sub={member.kycDocuments?.bankName} />
                   <DocumentBox label="Official Selfie" url={member.kycDocuments?.selfieUrl} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'NETWORK' && (
          <div className="bg-[#131241] rounded-2xl sm:rounded-[40px] p-8 sm:p-16 border border-white/5 shadow-2xl text-center">
             <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-white/10">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Genealogy Extension</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-4 leading-relaxed">
                   The full downline hierarchy for this member is available in the main Genealogy Tree module. 
                </p>
                <Link href="/admin/hierarchy" className="mt-8 inline-block px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                   Open Genealogy Tree
                </Link>
             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function DetailBlock({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="group">
       <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-[#10b981] transition-colors">
             {getIcon(icon)}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
       </div>
       <p className="text-sm font-bold text-white pl-11 tracking-tight">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, icon, color, sub }: { label: string; value: any; icon: string; color: string; sub?: string }) {
  // Mapping provided brand theme colors
  const colors: any = {
    blue: 'text-[#10b981] bg-[#10b981]/10',
    indigo: 'text-[#059669] bg-[#059669]/10',
    emerald: 'text-[#10b981] bg-[#10b981]/10',
    amber: 'text-[#047857] bg-[#047857]/10',
  };
  return (
    <div className={`p-6 rounded-[24px] ${colors[color]} border border-white/5 hover:border-[#10b981]/30 transition-all group shadow-xl backdrop-blur-sm`}>
       <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-current group-hover:scale-110 transition-transform">
             {getIcon(icon)}
          </div>
          {sub && <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{sub}</span>}
       </div>
       <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
       <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function AuditItem({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          {status && <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' || status === 'approved' ? 'bg-[#10b981]' : 'bg-rose-400'}`} />}
          <span className={`text-[10px] font-black uppercase tracking-widest ${status ? 'text-white' : 'text-white/40'}`}>{value}</span>
       </div>
    </div>
  );
}

function DocumentBox({ label, url, number, sub }: { label: string; url?: string; number?: string; sub?: string }) {
  return (
    <div className="bg-black/20 rounded-[32px] p-8 border border-white/5 group hover:border-[#10b981]/30 transition-all flex flex-col h-full">
       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">{label}</p>
       <div className="flex-1 aspect-[4/3] bg-[#131241] rounded-[24px] mb-6 overflow-hidden border border-white/5 flex items-center justify-center relative">
          {url ? (
            <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/5">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
               <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Upload</span>
            </div>
          )}
          {url && (
            <a href={url} target="_blank" className="absolute inset-0 bg-[#10b981]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[#131241] transition-all backdrop-blur-sm">
               <svg className="mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">Inspect Original</span>
            </a>
          )}
       </div>
       <div className="mt-auto">
          {number && <p className="text-[11px] font-black text-[#10b981] tracking-widest">{number}</p>}
          {sub && <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{sub}</p>}
       </div>
    </div>
  );
}

function getIcon(name: string) {
  const s = { width: 16, height: 16, stroke: 'currentColor', strokeWidth: 3, fill: 'none' };
  switch (name) {
    case 'user': return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'phone': return <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'mail': return <svg {...s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case 'map-pin': return <svg {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'users': return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'calendar': return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'zap': return <svg {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'user-plus': return <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
    case 'award': return <svg {...s}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
    default: return null;
  }
}
