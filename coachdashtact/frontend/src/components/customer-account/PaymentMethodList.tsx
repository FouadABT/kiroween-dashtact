'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodForm } from './PaymentMethodForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cod' | 'bank_transfer';
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  isDefault?: boolean;
}

export function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customer-account/payment-methods');

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      setPaymentMethods(Array.isArray(data) ? data : data.paymentMethods || []);
    } catch (error) {
      console.error('Fetch payment methods error:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customer-account/payment-methods/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }

      setPaymentMethods(prev => prev.filter(m => m.id !== id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Delete payment method error:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(
        `/api/customer-account/payment-methods/${id}/default`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }

      setPaymentMethods(prev =>
        prev.map(m => ({
          ...m,
          isDefault: m.id === id,
        }))
      );

      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Set default error:', error);
      toast.error('Failed to set default payment method');
    }
  };

  const handleSave = (savedMethod: PaymentMethod) => {
    if (editingId) {
      setPaymentMethods(prev =>
        prev.map(m => (m.id === savedMethod.id ? savedMethod : m))
      );
    } else {
      setPaymentMethods(prev => [...prev, savedMethod]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  if (isFormOpen) {
    return (
      <PaymentMethodForm
        id={editingId || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Payment Methods</CardTitle>
        <Button
          onClick={() => setIsFormOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No payment methods saved yet
            </p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map(method => {
              const isExpired = method.cardExpiry
                ? new Date(method.cardExpiry) < new Date()
                : false;

              return (
                <PaymentMethodCard
                  key={method.id}
                  id={method.id}
                  type={method.type}
                  cardLast4={method.cardLast4}
                  cardBrand={method.cardBrand}
                  cardExpiry={method.cardExpiry}
                  isDefault={method.isDefault}
                  isExpired={isExpired}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
