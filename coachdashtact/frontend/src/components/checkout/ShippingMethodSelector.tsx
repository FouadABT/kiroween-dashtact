'use client';

import { ShippingMethodOption } from '@/types/storefront';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShippingMethodSelectorProps {
  methods: ShippingMethodOption[];
  selectedMethodId?: string;
  isLoading?: boolean;
  onChange: (methodId: string) => void;
}

export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  isLoading,
  onChange,
}: ShippingMethodSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading shipping methods...
        </span>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No shipping methods available.</p>
        <p className="text-sm mt-2">Please complete your shipping address first.</p>
      </div>
    );
  }

  return (
    <RadioGroup value={selectedMethodId} onValueChange={onChange}>
      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className={cn(
              'flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
              selectedMethodId === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              !method.available && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => method.available && onChange(method.id)}
          >
            <RadioGroupItem
              value={method.id}
              id={method.id}
              disabled={!method.available}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={method.id}
                className={cn(
                  'flex items-center justify-between cursor-pointer',
                  !method.available && 'cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    {method.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </div>
                    )}
                    {method.estimatedDays && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Estimated delivery: {method.estimatedDays} business days
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-semibold">
                  {Number(method.price) === 0 ? 'Free' : `$${Number(method.price).toFixed(2)}`}
                </div>
              </Label>
              {!method.available && (
                <div className="text-xs text-destructive mt-2">
                  Not available for your location
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
