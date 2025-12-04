'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { CustomerAddress } from '@/types/ecommerce';
import { Plus } from 'lucide-react';

interface AddressListProps {
  type: 'shipping' | 'billing';
}

export function AddressList({ type }: AddressListProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [type]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/customer-account/addresses?type=${type}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(Array.isArray(data) ? data : data.addresses || []);
    } catch (error) {
      console.error('Fetch addresses error:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customer-account/addresses/${addressId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      setAddresses(prev => prev.filter(a => a.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(
        `/api/customer-account/addresses/${addressId}/default`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set default address');
      }

      // Update local state
      setAddresses(prev =>
        prev.map(a => ({
          ...a,
          isDefault: a.id === addressId,
        }))
      );

      toast.success('Default address updated');
    } catch (error) {
      console.error('Set default error:', error);
      toast.error('Failed to set default address');
    }
  };

  const handleSave = (savedAddress: CustomerAddress) => {
    if (editingAddress) {
      setAddresses(prev =>
        prev.map(a => (a.id === savedAddress.id ? savedAddress : a))
      );
    } else {
      setAddresses(prev => [...prev, savedAddress]);
    }

    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  if (isFormOpen) {
    return (
      <AddressForm
        address={editingAddress || undefined}
        type={type}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="capitalize">
          {type} Addresses
        </CardTitle>
        <Button
          onClick={() => setIsFormOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No {type} addresses yet
            </p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map(address => (
              <AddressCard
                key={address.id}
                address={address}
                isDefault={address.isDefault}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
