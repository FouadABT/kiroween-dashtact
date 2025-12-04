'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { PaymentMethodList } from '@/components/customer-account/PaymentMethodList';
import { Skeleton } from '@/components/ui/skeleton';

export function PaymentMethodsPageClient() {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', '/account/payment-methods');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <p className="text-muted-foreground mt-2">
          Add and manage your saved payment methods for faster checkout
        </p>
      </div>

      <PaymentMethodList />
    </div>
  );
}
