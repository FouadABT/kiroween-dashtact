'use client';

/**
 * Low Stock Table Widget
 * Displays products with low inventory levels
 */

import { useState, useEffect, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PackageX, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardApi } from '@/lib/api';

export interface LowStockTableProps {
  title?: string;
  data?: Array<{ id: string; name: string; sku: string; quantity: number; reorderThreshold: number; price: number }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getStockColor(quantity: number): string {
  return quantity === 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-foreground';
}

function getStockBadge(quantity: number, threshold: number) {
  if (quantity === 0) {
    return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
  }
  if (quantity <= threshold) {
    return <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">Low Stock</Badge>;
  }
  return null;
}

export function LowStockTable({
  title = 'Low Stock Products',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'inventory:read',
}: LowStockTableProps) {
  const router = useRouter();
  const [apiData, setApiData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useApi] = useState(!propData);

  useEffect(() => {
    if (!useApi) return;
    const fetchData = async () => {
      try {
        setApiLoading(true);
        const data = await DashboardApi.getInventory();
        setApiData(data);
      } catch (err) {
        setApiError('Failed to load data');
      } finally {
        setApiLoading(false);
      }
    };
    fetchData();
  }, [useApi]);

  const products = useMemo(() => {
    if (propData) return propData;
    if (!apiData) return [];
    return [
      ...(apiData.lowStock || []),
      ...(apiData.outOfStock || []).map((p: any) => ({ ...p, quantity: 0, reorderThreshold: 0, price: 0 })),
    ].sort((a, b) => a.quantity - b.quantity);
  }, [propData, apiData]);

  const loading = propLoading || apiLoading;
  const error = propError || apiError;

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="table" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (products.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={PackageX} title="All Good" description="All products are well stocked" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead className="min-w-[100px]">SKU</TableHead>
              <TableHead className="min-w-[100px] text-right">Current Stock</TableHead>
              <TableHead className="min-w-[120px] text-right">Reorder At</TableHead>
              <TableHead className="min-w-[100px] text-right">Price</TableHead>
              <TableHead className="min-w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className={product.quantity === 0 ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span>{product.name}</span>
                    {getStockBadge(product.quantity, product.reorderThreshold)}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                <TableCell className={`text-right font-semibold ${getStockColor(product.quantity)}`}>{product.quantity}</TableCell>
                <TableCell className="text-right text-muted-foreground">{product.reorderThreshold || '-'}</TableCell>
                <TableCell className="text-right font-medium">{product.price > 0 ? formatCurrency(product.price) : '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/ecommerce/products/${product.id}/edit`)} className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetContainer>
  );
}
