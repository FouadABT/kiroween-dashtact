'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isFeatureEnabled } from '@/config/features.config';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if ecommerce feature is enabled
    if (!isFeatureEnabled('ecommerce')) {
      // Redirect to dashboard if authenticated, otherwise to login
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while loading or redirecting
  if (isLoading || !isFeatureEnabled('ecommerce')) {
    return null;
  }

  return <>{children}</>;
}
