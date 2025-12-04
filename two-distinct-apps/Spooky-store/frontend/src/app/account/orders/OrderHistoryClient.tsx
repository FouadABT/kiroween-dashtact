'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { OrderList } from '@/components/customer-account/OrderList';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerOrder } from '@/types/storefront';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function OrderHistoryClient() {
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', '/account/orders');
        router.push('/account/login');
      } else {
        fetchOrders();
      }
    }
  }, [isAuthenticated, authLoading, router, page]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('customer_access_token');
      if (!token) return;

      const response = await fetch(
        `${API_URL}/customer/orders?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && orders.length === 0)) {
    return (
      <AccountLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-2">
            View and track your orders
          </p>
        </div>

        <OrderList
          orders={orders}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AccountLayout>
  );
}
