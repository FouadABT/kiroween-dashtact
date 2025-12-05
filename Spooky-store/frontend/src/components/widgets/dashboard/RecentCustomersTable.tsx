'use client';

/**
 * Recent Customers Table Widget
 * Displays the last 10 customers registered
 */

import { useMemo, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Users, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export interface RecentCustomersTableProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; customerId: string; name: string; email: string; phone?: string; registrationDate: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

function formatPhone(phone: string | undefined): string {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function RecentCustomersTable({
  title = 'Recent Customers',
  limit = 10,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'customers:read',
}: RecentCustomersTableProps) {
  const router = useRouter();
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const customers = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.type === 'customer')
      .map(activity => ({
        id: activity.id,
        customerId: activity.entityId,
        name: activity.metadata?.name || 'Unknown Customer',
        email: activity.metadata?.email || '-',
        phone: activity.metadata?.phone,
        registrationDate: activity.timestamp,
      }))
      .slice(0, limit);
  }, [propData, useContext, context.recentActivity, limit]);

  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="table" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (customers.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Users} title="No Customers" description="No recent customers found" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[140px]">Phone</TableHead>
              <TableHead className="min-w-[120px]">Registration Date</TableHead>
              <TableHead className="min-w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell className="text-muted-foreground">{formatPhone(customer.phone)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(customer.registrationDate)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/ecommerce/customers/${customer.customerId}`)} className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetContainer>
  );
}
