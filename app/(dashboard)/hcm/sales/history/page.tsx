'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import SalesHistorySection from '@/components/sections/SalesHistorySection';
import { useAuth } from '@/lib/auth';

export default function HcmSalesHistoryPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout pageTitle="My Sales">
      <SalesHistorySection user={user} />
    </DashboardLayout>
  );
}
