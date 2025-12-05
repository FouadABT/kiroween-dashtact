'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { AddressList } from '@/components/customer-account/AddressList';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AddressesPageClient() {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', '/account/addresses');
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
        <h1 className="text-3xl font-bold">Manage Addresses</h1>
        <p className="text-muted-foreground mt-2">
          Add and manage your shipping and billing addresses
        </p>
      </div>

      <Tabs defaultValue="shipping" className="w-full">
        <TabsList>
          <TabsTrigger value="shipping">Shipping Addresses</TabsTrigger>
          <TabsTrigger value="billing">Billing Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="shipping" className="mt-6">
          <AddressList type="shipping" />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <AddressList type="billing" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
