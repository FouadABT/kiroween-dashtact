'use client';

import { PaymentMethodOption } from '@/types/storefront';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  selectedMethodId?: string;
  onChange: (methodId: string) => void;
}

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'COD':
      return Banknote;
    case 'CARD':
      return CreditCard;
    default:
      return Wallet;
  }
};

export function PaymentMethodSelector({
  methods,
  selectedMethodId,
  onChange,
}: PaymentMethodSelectorProps) {
  if (methods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payment methods available.</p>
      </div>
    );
  }

  return (
    <RadioGroup value={selectedMethodId} onValueChange={onChange}>
      <div className="space-y-3">
        {methods.map((method) => {
          const Icon = getPaymentIcon(method.type);
          
          return (
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
                    'flex items-start justify-between cursor-pointer',
                    !method.available && 'cursor-not-allowed'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      {method.description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-md">
                          {method.description}
                        </div>
                      )}
                      {method.type === 'COD' && (
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>• Pay with cash when your order is delivered</p>
                          <p>• No online payment required</p>
                          {method.fee && method.fee > 0 && (
                            <p>• Additional fee: ${method.fee.toFixed(2)}</p>
                          )}
                        </div>
                      )}
                      {method.minOrderAmount && method.minOrderAmount > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Minimum order: ${method.minOrderAmount.toFixed(2)}
                        </div>
                      )}
                      {method.maxOrderAmount && (
                        <div className="text-xs text-muted-foreground">
                          Maximum order: ${method.maxOrderAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  {method.fee && method.fee > 0 && (
                    <div className="text-sm font-medium">
                      +${method.fee.toFixed(2)}
                    </div>
                  )}
                </Label>
                {!method.available && (
                  <div className="text-xs text-destructive mt-2">
                    Not available for your order
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
}
