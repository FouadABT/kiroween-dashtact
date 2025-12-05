'use client';

import { useState, useEffect } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Product } from '@/types/ecommerce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductsApi } from '@/lib/api';

export interface TopProductsProps {
  title?: string;
  limit?: number;
  period?: '7d' | '30d' | '90d';
  loading?: boolean;
  error?: string;
  permission?: string;
}

interface ProductWithSales extends Product {
  salesCount?: number;
  revenue?: string;
}

export function TopProducts({
  title = 'Top Selling Products',
  limit = 5,
  period = '30d',
  loading: externalLoading = false,
  error: externalError,
  permission = 'products:read',
}: TopProductsProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalLoading) {
      setLoading(true);
      return;
    }

    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all published products
        const data = await ProductsApi.getAll({
          status: 'PUBLISHED' as any,
          limit: limit * 3,
        });
        
        const allProducts = Array.isArray(data.products) ? data.products : [];
        
        // For now, just show the first products (in production, you'd sort by actual sales data)
        // You can enhance this by fetching order items and calculating sales per product
        const topProducts = allProducts.slice(0, limit).map((product: any, index: number) => ({
          ...product,
          salesCount: Math.max(0, 50 - (index * 5)), // Mock sales count for demo
          revenue: (parseFloat(product.basePrice) * Math.max(0, 50 - (index * 5))).toString(),
        }));
        
        setProducts(topProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [limit, period, externalLoading]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const handleViewProducts = () => {
    router.push('/dashboard/ecommerce/products');
  };

  if (loading) {
    return (
      <WidgetContainer title={title} loading>
        <SkeletonLoader variant="table" count={limit} />
      </WidgetContainer>
    );
  }

  if (error || externalError) {
    return (
      <WidgetContainer title={title} error={error || externalError}>
        <EmptyState
          icon={TrendingUp}
          title="Failed to load products"
          description={error || externalError}
        />
      </WidgetContainer>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];

  if (safeProducts.length === 0) {
    return (
      <WidgetContainer title={title} permission={permission}>
        <EmptyState
          icon={Package}
          title="No sales data"
          description="Product sales data will appear once orders are placed"
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      title={title}
      permission={permission}
      actions={
        <Button variant="ghost" size="sm" onClick={handleViewProducts}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-3">
        {safeProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                {index + 1}
              </Badge>
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0 w-12 h-12 relative rounded-md overflow-hidden bg-muted">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {product.salesCount || 0} sold
                </span>
                {product.revenue && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-medium">
                      {formatCurrency(product.revenue)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right">
              <p className="font-semibold">{formatCurrency(product.basePrice)}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
