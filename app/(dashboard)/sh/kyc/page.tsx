'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import KYCManagement from '@/components/sections/KYCManagement';
import { useAuth } from '@/lib/auth';

export default function ShKycPage() {
  const { user, loading, refreshUser } = useAuth();

  if (loading) return null;

  return (
    <DashboardLayout pageTitle="KYC Verification">
      <div className="pb-20">
        {user && <KYCManagement user={user} onUpdate={refreshUser} />}
      </div>
    </DashboardLayout>
  );
}
