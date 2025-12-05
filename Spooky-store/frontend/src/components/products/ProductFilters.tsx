'use client';

import React from 'react';
import { ProductStatus, ProductQueryDto } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  filters: ProductQueryDto;
  onFiltersChange: (filters: ProductQueryDto) => void;
  onReset: () => void;
}

export function ProductFilters({ filters, onFiltersChange, onReset }: ProductFiltersProps) {
  const hasActiveFilters = 
    filters.status || 
    filters.isVisible !== undefined || 
    filters.isFeatured !== undefined;

  return (
    <div className="space-y-6 py-6">
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === 'all' ? undefined : (value as ProductStatus),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={ProductStatus.PUBLISHED}>Published</SelectItem>
              <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={ProductStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Visibility</Label>
          <Select
            value={
              filters.isVisible === undefined
                ? 'all'
                : filters.isVisible
                ? 'visible'
                : 'hidden'
            }
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                isVisible:
                  value === 'all' ? undefined : value === 'visible',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Featured</Label>
          <Select
            value={
              filters.isFeatured === undefined
                ? 'all'
                : filters.isFeatured
                ? 'featured'
                : 'not-featured'
            }
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                isFeatured:
                  value === 'all' ? undefined : value === 'featured',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              <SelectItem value="featured">Featured only</SelectItem>
              <SelectItem value="not-featured">Not featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-medium">Sort by</Label>
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sortBy: value as ProductQueryDto['sortBy'],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="basePrice">Price</SelectItem>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="publishedAt">Published date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Order</Label>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sortOrder: value as 'asc' | 'desc',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
