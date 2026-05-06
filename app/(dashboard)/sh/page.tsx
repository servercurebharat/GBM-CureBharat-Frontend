'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import DashboardHome from '@/components/sections/DashboardHome';

export default function StateHeadDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-10">
        {user.kycStatus !== 'approved' && (
          <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-8 ${
            user.kycStatus === 'pending' 
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
              : 'bg-[#34d399]/5 border-[#34d399]/20 text-[#34d399]'
          }`}>
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl ${
                user.kycStatus === 'pending' ? 'bg-amber-500/10' : 'bg-[#34d399]/10'
              }`}>
                {user.kycStatus === 'pending' ? '⏳' : '🛡️'}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {user.kycStatus === 'pending' ? 'KYC Verification Pending' : 'KYC Verification Required'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mt-1">
                  {user.kycStatus === 'pending' 
                    ? 'Your documents are being reviewed by the administration.' 
                    : 'Complete your profile to enable commission withdrawals and rank rewards.'}
                </p>
              </div>
            </div>
            <a 
              href="/sh/kyc"
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                user.kycStatus === 'pending'
                  ? 'bg-amber-500 text-[#0d0f14] hover:brightness-110'
                  : 'bg-[#34d399] text-[#0d0f14] hover:brightness-110'
              }`}
            >
              {user.kycStatus === 'pending' ? 'View Documents' : 'Complete KYC Now'}
            </a>
          </div>
        )}
        <DashboardHome user={user} />
      </div>
    </DashboardLayout>
  );
}
