'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { ProfileCard } from '@/components/customer-account/ProfileCard';
import { RecentOrders } from '@/components/customer-account/RecentOrders';
import { QuickActions } from '@/components/customer-account/QuickActions';
import { Skeleton } from '@/components/ui/skeleton';

export function AccountDashboardClient() {
  const { user, isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store current URL for redirect after login
        sessionStorage.setItem('returnUrl', '/account');
        router.push('/account/login');
      } else {
        setIsInitializing(false);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isInitializing) {
    return (
      <AccountLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AccountLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.customer?.firstName || 'Customer'}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProfileCard user={user} />
          <QuickActions />
        </div>

        <RecentOrders />
      </div>
    </AccountLayout>
  );
}
