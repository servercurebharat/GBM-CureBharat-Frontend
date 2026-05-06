'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import NewSaleSection from '@/components/sections/NewSaleSection';
import { useAuth } from '@/lib/auth';

export default function HcmNewSalePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout pageTitle="New Sale">
      <NewSaleSection user={user} />
    </DashboardLayout>
  );
}
