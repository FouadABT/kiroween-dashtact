'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductStatus } from '@/types/ecommerce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ProductCard({ product, onDelete, onEdit, onView }: ProductCardProps) {
  const canWrite = usePermission('products:write');
  const canDelete = usePermission('products:delete');

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.PUBLISHED:
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case ProductStatus.DRAFT:
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case ProductStatus.ARCHIVED:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Featured
          </Badge>
        )}
        <Badge className={`absolute top-2 right-2 ${getStatusColor(product.status)}`}>
          {product.status}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{product.name}</CardTitle>
            {product.sku && (
              <CardDescription className="text-xs mt-1">SKU: {product.sku}</CardDescription>
            )}
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(product.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {canWrite && (
                <DropdownMenuItem onClick={() => onEdit?.(product.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(product.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {product.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.shortDescription}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatPrice(product.basePrice)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            )}
          </div>
          {product.variants && product.variants.length > 0 && (
            <Badge variant="outline">{product.variants.length} variants</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(product.id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        {canWrite && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(product.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
