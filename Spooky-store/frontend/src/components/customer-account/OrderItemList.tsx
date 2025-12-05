'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  totalPrice?: string;
  image?: string;
}

interface OrderItemListProps {
  items: OrderItem[];
}

export function OrderItemList({ items }: OrderItemListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.productName}</h4>
                {item.variantName && (
                  <p className="text-sm text-muted-foreground">{item.variantName}</p>
                )}
                {item.sku && (
                  <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    ${parseFloat(item.unitPrice).toFixed(2)} each
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold">
                  ${parseFloat(item.totalPrice || (parseFloat(item.unitPrice) * item.quantity).toString()).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
