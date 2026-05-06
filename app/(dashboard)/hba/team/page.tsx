'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import TeamSection from '@/components/sections/TeamSection';
import { useAuth } from '@/lib/auth';

export default function HbaTeamPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Team Management">
      <TeamSection user={user} />
    </DashboardLayout>
  );
}
