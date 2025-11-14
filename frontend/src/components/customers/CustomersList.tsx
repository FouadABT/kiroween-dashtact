'use client';

import { Customer } from '@/types/ecommerce';
import { CustomerCard } from './CustomerCard';

interface CustomersListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function CustomersList({ customers, onDelete, onView }: CustomersListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
