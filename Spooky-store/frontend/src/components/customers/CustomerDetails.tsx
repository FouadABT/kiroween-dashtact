'use client';

import { Customer } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Building, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerDetailsProps {
  customer: Customer;
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          {customer.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
            </div>
          )}
          {customer.company && (
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{customer.company}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      {customer.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {customer.shippingAddress.apartment && (
                  <p>{customer.shippingAddress.apartment}</p>
                )}
                <p>{customer.shippingAddress.street}</p>
                <p>
                  {customer.shippingAddress.city}, {customer.shippingAddress.state}{' '}
                  {customer.shippingAddress.postalCode}
                </p>
                <p>{customer.shippingAddress.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address */}
      {customer.billingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {customer.billingAddress.apartment && (
                  <p>{customer.billingAddress.apartment}</p>
                )}
                <p>{customer.billingAddress.street}</p>
                <p>
                  {customer.billingAddress.city}, {customer.billingAddress.state}{' '}
                  {customer.billingAddress.postalCode}
                </p>
                <p>{customer.billingAddress.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.createdAt && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Customer Since</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      const date = new Date(customer.createdAt);
                      return isNaN(date.getTime()) 
                        ? 'N/A' 
                        : formatDistanceToNow(date, { addSuffix: true });
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
            </div>
          )}
          {customer.lastOrderAt && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Last Order</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    try {
                      const date = new Date(customer.lastOrderAt);
                      return isNaN(date.getTime()) 
                        ? 'N/A' 
                        : formatDistanceToNow(date, { addSuffix: true });
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
            </div>
          )}
          {customer.tags && customer.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {customer.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {customer.notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
