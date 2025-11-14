'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ProductInfoProps {
  name: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  isAvailable: boolean;
}

export function ProductInfo({
  name,
  price,
  compareAtPrice,
  sku,
  shortDescription,
  description,
  isAvailable,
}: ProductInfoProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;
  
  return (
    <div className="space-y-4">
      {/* Product Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
        {name}
      </h1>
      
      {/* Price Section */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            ${price.toFixed(2)}
          </span>
          
          {hasDiscount && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
              <Badge variant="destructive" className="text-sm">
                Save {discountPercentage}%
              </Badge>
            </>
          )}
        </div>
      </div>
      
      {/* Availability Status */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">In Stock</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Out of Stock</span>
          </>
        )}
      </div>
      
      {/* SKU */}
      {sku && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">SKU:</span> {sku}
        </div>
      )}
      
      {/* Short Description */}
      {shortDescription && (
        <div className="text-base text-foreground leading-relaxed pt-2">
          {shortDescription}
        </div>
      )}
      
      {/* Full Description */}
      {description && (
        <div className="pt-4 border-t border-border">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Product Description</h2>
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}
    </div>
  );
}
