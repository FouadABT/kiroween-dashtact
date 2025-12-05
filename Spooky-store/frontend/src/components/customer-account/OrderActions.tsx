'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerOrderDetails } from '@/types/storefront';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OrderActionsProps {
  order: CustomerOrderDetails;
  onUpdate: () => void;
}

export function OrderActions({ order, onUpdate }: OrderActionsProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const canCancel = order.status.toUpperCase() === 'PENDING';

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const token = localStorage.getItem('customer_access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/customer/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer',
        }),
      });

      if (response.ok) {
        toast.success('Order cancelled successfully');
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = async () => {
    try {
      setIsReordering(true);
      const token = localStorage.getItem('customer_access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/customer/orders/${order.id}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Items added to cart');
        router.push('/cart');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error('Failed to reorder');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isCancelling}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleReorder}
          disabled={isReordering}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isReordering ? 'Adding to cart...' : 'Reorder'}
        </Button>

        {order.customerNotes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-1">Order Notes</p>
            <p className="text-sm text-muted-foreground">
              {order.customerNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
