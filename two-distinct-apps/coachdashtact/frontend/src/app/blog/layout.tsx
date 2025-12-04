'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isFeatureEnabled } from '@/config/features.config';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if blog feature is enabled
    if (!isFeatureEnabled('blog')) {
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
  if (isLoading || !isFeatureEnabled('blog')) {
    return null;
  }

  return <>{children}</>;
}
