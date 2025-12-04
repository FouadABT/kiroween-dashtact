'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { featuresConfig } from '@/config/features.config';
import { Loader2 } from 'lucide-react';

interface EcommerceFeatureGuardProps {
  children: React.ReactNode;
}

/**
 * Feature guard for e-commerce routes
 * Redirects to dashboard if e-commerce feature is disabled
 */
export function EcommerceFeatureGuard({ children }: EcommerceFeatureGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!featuresConfig.ecommerce.enabled) {
      router.push('/dashboard');
    }
  }, [router]);

  // Show loading while checking feature flag
  if (!featuresConfig.ecommerce.enabled) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
