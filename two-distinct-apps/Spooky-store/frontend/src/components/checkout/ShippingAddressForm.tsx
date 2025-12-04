'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckoutFormState } from '@/types/storefront';

interface ShippingAddressFormProps {
  address: Partial<CheckoutFormState['shippingAddress']>;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  errors: Record<string, string>;
  onChange: (updates: Partial<CheckoutFormState>) => void;
}

export function ShippingAddressForm({
  address,
  customerEmail,
  customerName,
  customerPhone,
  customerNotes,
  errors,
  onChange,
}: ShippingAddressFormProps) {
  const handleAddressChange = (field: string, value: string) => {
    onChange({
      shippingAddress: {
        ...address,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => onChange({ customerEmail: e.target.value })}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone</Label>
        <Input
          id="customerPhone"
          type="tel"
          value={customerPhone || ''}
          onChange={(e) => onChange({ customerPhone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Shipping Address */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-4">Shipping Address</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={address.firstName || ''}
                onChange={(e) => handleAddressChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={address.lastName || ''}
                onChange={(e) => handleAddressChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">
              Address Line 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addressLine1"
              value={address.addressLine1 || ''}
              onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={address.addressLine2 || ''}
              onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={address.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State/Province <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                value={address.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                value={address.postalCode || ''}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              value={address.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="United States"
              required
            />
          </div>
        </div>
      </div>

      {/* Order Notes */}
      <div className="pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="customerNotes">Order Notes (Optional)</Label>
          <Textarea
            id="customerNotes"
            value={customerNotes || ''}
            onChange={(e) => onChange({ customerNotes: e.target.value })}
            placeholder="Any special instructions for your order..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
