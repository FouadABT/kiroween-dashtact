'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Customer, Order } from '@/types/ecommerce';
import { CustomersApi } from '@/lib/api';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalOrderList } from '@/components/portal/PortalOrderList';
import { PortalOrderDetails } from '@/components/portal/PortalOrderDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CustomerPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const customerData = await CustomersApi.getByPortalToken(token);
        setCustomer(customerData);
      } catch (err) {
        setError('Invalid or expired portal link. Please contact support for a new link.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [token]);

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </PortalLayout>
    );
  }

  if (error || !customer) {
    return (
      <PortalLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Unable to load customer data'}
          </AlertDescription>
        </Alert>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout customer={customer}>
      <div className="space-y-6">
        {selectedOrder ? (
          <PortalOrderDetails
            order={selectedOrder}
            onBack={() => setSelectedOrder(null)}
          />
        ) : (
          <PortalOrderList
            customer={customer}
            onSelectOrder={setSelectedOrder}
          />
        )}
      </div>
    </PortalLayout>
  );
}
