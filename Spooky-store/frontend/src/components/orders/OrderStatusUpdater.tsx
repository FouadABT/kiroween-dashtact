'use client';

import { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/ecommerce';
import { OrdersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusUpdate: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function OrderStatusUpdater({ order, onStatusUpdate }: OrderStatusUpdaterProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setIsUpdating(true);
      await OrdersApi.updateStatus(order.id, newStatus, notes || undefined);
      setNotes('');
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (order.status === 'CANCELLED') {
      toast.error('This order is already cancelled');
      return;
    }

    try {
      setIsUpdating(true);
      await OrdersApi.cancel(order.id, notes || undefined);
      setNotes('');
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <Label>Current Status</Label>
          <Badge className={`${statusColors[order.status]} w-full justify-center py-2`}>
            {order.status}
          </Badge>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Badge variant="outline" className="w-full justify-center py-2">
            {order.paymentStatus}
          </Badge>
        </div>

        {/* Fulfillment Status */}
        <div className="space-y-2">
          <Label>Fulfillment Status</Label>
          <Badge variant="outline" className="w-full justify-center py-2">
            {order.fulfillmentStatus.replace('_', ' ')}
          </Badge>
        </div>

        <PermissionGuard permission="orders:write" fallback={null}>
          <div className="pt-4 space-y-4 border-t">
            {/* Update Status */}
            <div className="space-y-2">
              <Label htmlFor="newStatus">Update Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Warning for status changes */}
            {newStatus !== order.status && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Changing the order status will trigger notifications and may affect inventory.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === order.status}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>

              {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                <Button
                  onClick={handleCancelOrder}
                  disabled={isUpdating}
                  variant="destructive"
                  className="w-full"
                >
                  {isUpdating ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}
            </div>
          </div>
        </PermissionGuard>
      </CardContent>
    </Card>
  );
}
