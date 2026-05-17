'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileView from '@/components/sections/ProfileView';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { IWallet } from '@/types';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState<IWallet | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletRes = await walletAPI.getMyWallet();
        if (walletRes.data.success && walletRes.data.data) {
          setWallet(walletRes.data.data);
        }
      } catch (error: any) {
        console.error('Error fetching wallet:', error);
      }
    };

    if (user) {
      fetchWallet();
    }
  }, [user]);

  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Profile">
      <ProfileView user={user} wallet={wallet} refreshUser={refreshUser} />
    </DashboardLayout>
  );
}

