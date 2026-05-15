'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import DashboardHome from '@/components/sections/DashboardHome';
import { Suspense } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Admin Dashboard">
      <Suspense fallback={<div className="p-8 text-white">Loading Dashboard...</div>}>
        <DashboardHome user={user} />
      </Suspense>
    </DashboardLayout>
  );
}
