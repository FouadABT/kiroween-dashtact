'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerAddress } from '@/types/ecommerce';
import { Edit, Trash2, Star } from 'lucide-react';

interface AddressCardProps {
  address: CustomerAddress;
  isDefault?: boolean;
  onEdit?: (address: CustomerAddress) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export function AddressCard({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <Card className={isDefault ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold capitalize">
              {address.type} Address
            </h3>
            {isDefault && (
              <Badge variant="default" className="gap-1">
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
                onClick={() => onEdit(address)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(address.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">{address.street}</p>
          {address.apartment && (
            <p className="text-sm text-muted-foreground">{address.apartment}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">City</p>
            <p className="font-medium">{address.city}</p>
          </div>
          <div>
            <p className="text-muted-foreground">State</p>
            <p className="font-medium">{address.state}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Postal Code</p>
            <p className="font-medium">{address.postalCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Country</p>
            <p className="font-medium">{address.country}</p>
          </div>
        </div>

        {address.phone && (
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{address.phone}</p>
          </div>
        )}

        {!isDefault && onSetDefault && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSetDefault(address.id)}
          >
            <Star className="h-4 w-4 mr-2" />
            Set as Default
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
