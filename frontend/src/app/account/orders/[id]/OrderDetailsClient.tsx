'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { OrderHeader } from '@/components/customer-account/OrderHeader';
import { OrderItemList } from '@/components/customer-account/OrderItemList';
import { OrderTimeline } from '@/components/customer-account/OrderTimeline';
import { ShippingInfo } from '@/components/customer-account/ShippingInfo';
import { BillingInfo } from '@/components/customer-account/BillingInfo';
import { OrderActions } from '@/components/customer-account/OrderActions';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerOrderDetails } from '@/types/storefront';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OrderDetailsClientProps {
  orderId: string;
}

export function OrderDetailsClient({ orderId }: OrderDetailsClientProps) {
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [order, setOrder] = useState<CustomerOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', `/account/orders/${orderId}`);
        router.push('/account/login');
      } else {
        fetchOrderDetails();
      }
    }
  }, [isAuthenticated, authLoading, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('customer_access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        setError('Order not found');
      } else if (response.status === 403) {
        setError('You do not have permission to view this order');
      } else {
        setError('Failed to load order details');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AccountLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AccountLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Order not found'}</AlertDescription>
        </Alert>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <OrderHeader order={order} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <OrderItemList items={order.items || []} />
            <OrderTimeline order={order} />
          </div>

          <div className="space-y-6">
            <ShippingInfo order={order} />
            <BillingInfo order={order} />
            <OrderActions order={order} onUpdate={fetchOrderDetails} />
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
