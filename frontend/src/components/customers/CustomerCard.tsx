'use client';

import { Customer } from '@/types/ecommerce';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { formatDistanceToNow } from 'date-fns';

interface CustomerCardProps {
  customer: Customer;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function CustomerCard({ customer, onDelete, onView }: CustomerCardProps) {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const hasOrders = customer.lastOrderAt !== null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Name and Company */}
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              {customer.company && (
                <p className="text-sm text-muted-foreground">{customer.company}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.shippingAddress && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {customer.shippingAddress.city}, {customer.shippingAddress.state}
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                </span>
              </div>
              {hasOrders && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last order {formatDistanceToNow(new Date(customer.lastOrderAt!), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(customer.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <PermissionGuard permission="customers:delete" fallback={null}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(customer.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
