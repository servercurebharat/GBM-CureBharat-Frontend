'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import FinanceHubSection from '@/components/sections/FinanceHubSection';
import { useAuth } from '@/lib/auth';

export default function HbaFinancePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Finance Hub">
      <FinanceHubSection user={user} />
    </DashboardLayout>
  );
}
