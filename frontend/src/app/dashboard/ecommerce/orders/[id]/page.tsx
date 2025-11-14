'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/ecommerce';
import { OrdersApi } from '@/lib/api';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { OrderStatusUpdater } from '@/components/orders/OrderStatusUpdater';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderNotes } from '@/components/orders/OrderNotes';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderPage({ params }: OrderPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await OrdersApi.getById(resolvedParams.id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const handleStatusUpdate = async () => {
    await fetchOrder();
    toast.success('Order status updated successfully');
  };

  const handleNoteAdded = async () => {
    await fetchOrder();
    toast.success('Note added successfully');
  };

  if (isLoading) {
    return (
      <PermissionGuard permission="orders:read">
        <div className="space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </PermissionGuard>
    );
  }

  if (!order) {
    return (
      <PermissionGuard permission="orders:read">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/ecommerce/orders')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="orders:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={`Order #${order.orderNumber}`}
          description={`Created on ${new Date(order.createdAt).toLocaleDateString()}`}
          actions={
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/ecommerce/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <OrderDetails order={order} />

            {/* Tabs for Timeline and Notes */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-6">
                <OrderTimeline order={order} />
              </TabsContent>
              <TabsContent value="notes" className="mt-6">
                <OrderNotes
                  order={order}
                  onNoteAdded={handleNoteAdded}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <OrderStatusUpdater
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
