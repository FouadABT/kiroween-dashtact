'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { ProfileEditForm } from '@/components/customer-account/ProfileEditForm';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfilePageClient() {
  const { user, isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', '/account/profile');
        router.push('/account/login');
      } else {
        setIsInitializing(false);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isInitializing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information
        </p>
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}
