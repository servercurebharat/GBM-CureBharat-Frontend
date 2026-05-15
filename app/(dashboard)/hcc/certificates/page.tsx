'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ExportDropdown from '@/components/dashboard/ExportDropdown';

export default function Certificates() {
  return (
    <DashboardLayout pageTitle="Policy Certificates">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#131241] rounded-[2rem] p-6 text-white shadow-xl border border-white/[0.03] group hover:border-[#10b981]/30 transition-all">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-6 text-[#10b981]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Policy Cert #POL-10{i}</h3>
            <p className="text-xs text-white/40 mb-6">Issued on 12 Jun 2024</p>
            <ExportDropdown 
              title={`Policy Certificate #POL-10${i}`}
              headers={['Policy ID', 'Issue Date', 'Status']}
              rows={[[`POL-10${i}`, '12 Jun 2024', 'ACTIVE']]}
              fileName={`Policy_Cert_10${i}`}
            />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
