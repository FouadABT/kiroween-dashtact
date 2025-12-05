'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Trash2, Star, AlertTriangle, CreditCard } from 'lucide-react';

interface PaymentMethodCardProps {
  id: string;
  type: 'card' | 'cod' | 'bank_transfer';
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  isDefault?: boolean;
  isExpired?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const CARD_BRANDS: Record<string, { name: string; color: string }> = {
  visa: { name: 'Visa', color: 'bg-blue-100 text-blue-900' },
  mastercard: { name: 'Mastercard', color: 'bg-red-100 text-red-900' },
  amex: { name: 'American Express', color: 'bg-green-100 text-green-900' },
  discover: { name: 'Discover', color: 'bg-orange-100 text-orange-900' },
};

export function PaymentMethodCard({
  id,
  type,
  cardLast4,
  cardBrand,
  cardExpiry,
  isDefault = false,
  isExpired = false,
  onEdit,
  onDelete,
  onSetDefault,
}: PaymentMethodCardProps) {
  const getPaymentMethodLabel = () => {
    switch (type) {
      case 'cod':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return 'Credit/Debit Card';
    }
  };

  const getBrandInfo = () => {
    if (!cardBrand) return null;
    const brand = cardBrand.toLowerCase();
    return CARD_BRANDS[brand] || { name: cardBrand, color: 'bg-gray-100 text-gray-900' };
  };

  const brandInfo = getBrandInfo();

  return (
    <Card className={isDefault ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{getPaymentMethodLabel()}</h3>
              {brandInfo && (
                <Badge variant="outline" className={`mt-1 ${brandInfo.color}`}>
                  {brandInfo.name}
                </Badge>
              )}
            </div>
            {isDefault && (
              <Badge variant="default" className="gap-1 ml-auto">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isExpired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This payment method has expired and cannot be used for checkout.
            </AlertDescription>
          </Alert>
        )}

        {type === 'card' && cardLast4 && (
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Card Number</p>
              <p className="font-mono font-medium">•••• •••• •••• {cardLast4}</p>
            </div>

            {cardExpiry && (
              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">{cardExpiry}</p>
              </div>
            )}
          </div>
        )}

        {type === 'cod' && (
          <div>
            <p className="text-sm text-muted-foreground">
              Pay when your order is delivered
            </p>
          </div>
        )}

        {type === 'bank_transfer' && (
          <div>
            <p className="text-sm text-muted-foreground">
              Bank transfer details will be provided after order confirmation
            </p>
          </div>
        )}

        {!isDefault && !isExpired && onSetDefault && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSetDefault(id)}
          >
            <Star className="h-4 w-4 mr-2" />
            Set as Default
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
