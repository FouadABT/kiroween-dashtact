'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckoutFormState } from '@/types/storefront';

interface BillingAddressFormProps {
  address: Partial<CheckoutFormState['billingAddress']>;
  sameAsShipping: boolean;
  shippingAddress: Partial<CheckoutFormState['shippingAddress']>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CheckoutFormState>) => void;
}

export function BillingAddressForm({
  address,
  sameAsShipping,
  shippingAddress,
  errors,
  onChange,
}: BillingAddressFormProps) {
  const handleAddressChange = (field: string, value: string) => {
    onChange({
      billingAddress: {
        ...address,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Same as Shipping Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAsShipping"
          checked={sameAsShipping}
          onCheckedChange={(checked) => {
            onChange({
              sameAsBilling: checked as boolean,
              billingAddress: checked ? {} : address,
            });
          }}
        />
        <Label
          htmlFor="sameAsShipping"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Same as shipping address
        </Label>
      </div>

      {/* Billing Address Fields (only shown if not same as shipping) */}
      {!sameAsShipping && (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingFirstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billingFirstName"
                value={address.firstName || ''}
                onChange={(e) => handleAddressChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingLastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billingLastName"
                value={address.lastName || ''}
                onChange={(e) => handleAddressChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddressLine1">
              Address Line 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="billingAddressLine1"
              value={address.addressLine1 || ''}
              onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddressLine2">Address Line 2</Label>
            <Input
              id="billingAddressLine2"
              value={address.addressLine2 || ''}
              onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billingCity"
                value={address.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingState">
                State/Province <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billingState"
                value={address.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPostalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="billingPostalCode"
                value={address.postalCode || ''}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCountry">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="billingCountry"
              value={address.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="United States"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}
