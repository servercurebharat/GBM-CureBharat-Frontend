'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OTP verification is deprecated. 
 * This page now redirects to the password-based login page.
 */
export default function OTPVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060818' }}>
      <p className="text-white/40 text-sm">Redirecting to login...</p>
    </div>
  );
}
