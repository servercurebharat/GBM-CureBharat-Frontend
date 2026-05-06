'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import DashboardHome from '@/components/sections/DashboardHome';

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Admin Dashboard">
      <DashboardHome user={user} />
    </DashboardLayout>
  );
}
