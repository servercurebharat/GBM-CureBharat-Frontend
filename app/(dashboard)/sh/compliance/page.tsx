'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authAPI, adminAPI } from '@/lib/api';
import { IUser } from '@/types';

export default function ShCompliancePage() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    authAPI.getMe()
      .then((r) => setUser(r.data.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const kycApproved = user.kycStatus === 'approved';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const sections = [
    {
      id: 'gst',
      title: 'Tax & GST Summary',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      color: '#34d399',
      shadowColor: 'rgba(52,211,153,0.15)',
      status: kycApproved ? 'COMPLIANT' : 'PENDING KYC',
      statusOk: kycApproved,
      description: 'GST summary on commissions earned. Applicable if annual commission exceeds ₹20 Lakh threshold.',
      details: [
        { label: 'GST Registration', value: kycApproved ? 'Active / Exempt' : 'Pending KYC', ok: kycApproved },
        { label: 'Current FY', value: `${currentYear - 1}–${currentYear}`, ok: true },
        { label: 'GSTIN Status', value: kycApproved ? 'Verified' : 'Unverified', ok: kycApproved },
        { label: 'Filing Frequency', value: 'Quarterly', ok: true },
      ]
    },
    {
      id: 'kyc',
      title: 'Member Compliance',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#60A5FA',
      shadowColor: 'rgba(96,165,250,0.15)',
      status: 'ACTIVE MONITORING',
      statusOk: true,
      description: 'KYC verification status of all members under your state. Ensure all agents have completed KYC to remain commission-eligible.',
      details: [
        { label: 'Your KYC Status', value: user.kycStatus?.toUpperCase() || 'PENDING', ok: kycApproved },
        { label: 'State', value: (user as any).state || 'N/A', ok: true },
        { label: 'Member ID', value: user.memberId || '—', ok: true },
        { label: 'Verification Level', value: kycApproved ? 'Full KYC' : 'Basic Only', ok: kycApproved },
      ]
    },
    {
      id: 'tds',
      title: 'TDS Reports',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      color: '#fbbf24',
      shadowColor: 'rgba(251,191,36,0.15)',
      status: 'DEDUCTED @ SOURCE',
      statusOk: true,
      description: 'TDS (Tax Deducted at Source) at 2% is deducted from your commission payouts under Section 194H. You can claim this while filing ITR.',
      details: [
        { label: 'TDS Section', value: 'Sec 194H – Commission', ok: true },
        { label: 'Applicable Rate', value: '2% on Net Payout', ok: true },
        { label: 'Form 26AS', value: 'Updated Quarterly', ok: true },
        { label: 'ITR Form', value: 'ITR-1 / ITR-3', ok: true },
      ]
    },
    {
      id: 'annual',
      title: 'Annual Returns',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: '#a78bfa',
      shadowColor: 'rgba(167,139,250,0.15)',
      status: `FY ${currentYear - 1}–${currentYear}`,
      statusOk: true,
      description: 'Annual Income Tax Return filing obligation. All agents earning commissions above ₹2.5 Lakh must file ITR before July 31st each year.',
      details: [
        { label: 'ITR Deadline', value: `31 July ${currentYear}`, ok: true },
        { label: 'Reporting Year', value: `FY ${currentYear - 1}–${currentYear}`, ok: true },
        { label: 'Audit Requirement', value: 'Only if > ₹1 Cr', ok: true },
        { label: 'Penalty for Late', value: 'Up to ₹10,000', ok: false },
      ]
    },
  ];

  return (
    <DashboardLayout pageTitle="Compliance Reports">
      <div className="space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest mb-1">CUREBHARAT / SH / COMPLIANCE</p>
            <h1 className="text-3xl font-bold text-white font-display">Compliance Reports</h1>
            <p className="text-sm text-white/40 mt-1">Tax, GST, TDS, and member compliance summaries for {currentMonth} {currentYear}</p>
          </div>

          {/* Overall Status Badge */}
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border ${kycApproved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${kycApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${kycApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {kycApproved ? 'All Systems Compliant' : 'Action Required'}
              </p>
              <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">{user.name} · {user.memberId}</p>
            </div>
          </div>
        </div>

        {/* What is this page? — Info Banner */}
        <div className="bg-[#131241] rounded-2xl p-6 border border-[#60A5FA]/10 flex gap-5">
          <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 flex items-center justify-center text-[#60A5FA] flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-white mb-1">What is this page for?</h3>
            <p className="text-[12px] text-white/50 leading-relaxed">
              As a <span className="text-[#60A5FA] font-bold">State Head (SH)</span>, you earn leadership commissions on team sales. This page tracks your <strong className="text-white/70">tax obligations</strong> — including TDS deducted from payouts, GST applicability, and annual ITR filing deadlines. It also monitors the <strong className="text-white/70">KYC compliance</strong> of your downline to ensure they remain eligible for commissions.
            </p>
          </div>
        </div>

        {/* Compliance Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-56 bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((s) => (
              <div
                key={s.id}
                className="bg-[#131241] rounded-[2rem] border border-white/[0.04] shadow-xl overflow-hidden group hover:border-white/10 transition-all duration-300 cursor-pointer"
                style={{ boxShadow: activeSection === s.id ? `0 0 30px ${s.shadowColor}` : undefined }}
                onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              >
                {/* Card Header */}
                <div className="p-7 pb-0">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}15`, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border`}
                      style={{ color: s.statusOk ? s.color : '#fbbf24', borderColor: s.statusOk ? `${s.color}30` : 'rgba(251,191,36,0.3)', background: s.statusOk ? `${s.color}10` : 'rgba(251,191,36,0.1)' }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed mb-5">{s.description}</p>
                </div>

                {/* Divider */}
                <div className="mx-7 h-[1px] bg-white/5" />

                {/* Details Grid */}
                <div className="p-7 pt-5 grid grid-cols-2 gap-4">
                  {s.details.map((d, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">{d.label}</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <p className="text-[11px] font-bold text-white truncate">{d.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand indicator */}
                <div className="px-7 pb-5 flex items-center gap-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>
                    {activeSection === s.id ? 'Click to collapse' : 'Click to view details'}
                  </p>
                  <svg
                    className={`transition-transform duration-300 ${activeSection === s.id ? 'rotate-180' : ''}`}
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="4"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Expanded Detail Panel */}
                {activeSection === s.id && (
                  <div
                    className="mx-7 mb-7 p-5 rounded-2xl border"
                    style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: s.color }}>Quick Action</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      {s.id === 'gst' && 'Contact your CA or log in to the GST portal (gst.gov.in) to verify your GSTIN status and file quarterly returns.'}
                      {s.id === 'kyc' && 'Ensure all your downline agents have submitted valid Aadhaar + PAN documents. Members without approved KYC cannot receive commission payouts.'}
                      {s.id === 'tds' && 'Download your Form 26AS from the Income Tax portal (incometax.gov.in) to verify TDS deducted on your CureBharat commission payouts.'}
                      {s.id === 'annual' && `File your Income Tax Return (ITR) before July 31, ${currentYear} for FY ${currentYear-1}–${currentYear}. Use Form 16 or commission statement provided by CureBharat.`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Compliance Tip Banner */}
        <div className="bg-[#131241] rounded-2xl p-6 border border-amber-500/10 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-400 mb-1">Compliance Reminder</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              TDS is automatically deducted before commission payouts. Ensure your <strong className="text-white/60">PAN card is linked</strong> to your CureBharat profile to receive correct Form 16A certificates for ITR filing.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
