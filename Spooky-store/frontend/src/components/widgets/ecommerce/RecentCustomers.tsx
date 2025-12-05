'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Customer } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { Users, Eye, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { CustomersApi } from '@/lib/api';

export interface RecentCustomersProps {
  title?: string;
  limit?: number;
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function RecentCustomers({
  title = 'Recent Customers',
  limit = 5,
  loading: externalLoading = false,
  error: externalError,
  permission = 'customers:read',
}: RecentCustomersProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await CustomersApi.getAll({
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [limit, externalLoading]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/dashboard/ecommerce/customers/${customerId}`);
  };

  const handleViewAll = () => {
    router.push('/dashboard/ecommerce/customers');
  };

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="table" count={limit} />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={Users}
          title="Failed to load customers"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  const safeCustomers = Array.isArray(customers) ? customers : [];

  if (safeCustomers.length === 0) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers will appear here once they place orders"
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      title={title}
      permission={permission}
      actions={
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-3">
        {safeCustomers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {customer.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewCustomer(customer.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
