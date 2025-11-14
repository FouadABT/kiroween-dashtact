'use client';

import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { StorefrontCategoryResponseDto } from '@/types/ecommerce';

export interface ProductFiltersState {
  search: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
}

interface ProductFiltersProps {
  categories: StorefrontCategoryResponseDto[];
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  priceRange?: { min: number; max: number };
}

export function ProductFilters({
  categories,
  filters,
  onFiltersChange,
  priceRange = { min: 0, max: 1000 },
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [priceValues, setPriceValues] = useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleCategoryClick = (categorySlug: string) => {
    onFiltersChange({
      ...filters,
      categorySlug: filters.categorySlug === categorySlug ? undefined : categorySlug,
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceValues([values[0], values[1]]);
  };

  const handlePriceCommit = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0] === priceRange.min ? undefined : values[0],
      maxPrice: values[1] === priceRange.max ? undefined : values[1],
    });
  };

  const handleFeaturedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isFeatured: checked ? true : undefined,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      inStock: checked ? true : undefined,
    });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setPriceValues([priceRange.min, priceRange.max]);
    onFiltersChange({
      search: '',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.categorySlug ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.isFeatured ||
    filters.inStock;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">Filters</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-xs min-h-[44px] sm:min-h-[32px] touch-manipulation"
          >
            <X className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm text-foreground">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 min-h-[44px] text-base"
            />
          </div>
        </div>

        {/* Categories */}
        <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
            <Label className="cursor-pointer text-sm font-semibold text-foreground">Categories</Label>
            {isCategoriesOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories available</p>
            ) : (
              categories.map((category) => (
                <div key={category.id}>
                  <Button
                    variant={filters.categorySlug === category.slug ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start min-h-[44px] touch-manipulation"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <span className="flex-1 text-left text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({category.productCount})
                    </span>
                  </Button>
                  
                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.children.map((child) => (
                        <Button
                          key={child.id}
                          variant={filters.categorySlug === child.slug ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start text-sm min-h-[44px] touch-manipulation"
                          onClick={() => handleCategoryClick(child.slug)}
                        >
                          <span className="flex-1 text-left">{child.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({child.productCount})
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
            <Label className="cursor-pointer text-sm font-semibold text-foreground">Price Range</Label>
            {isPriceOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10}
              value={priceValues}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceCommit}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${priceValues[0].toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                ${priceValues[1].toFixed(0)}
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Additional Options */}
        <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
            <Label className="cursor-pointer text-sm font-semibold text-foreground">Options</Label>
            {isOptionsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 min-h-[44px]">
              <Checkbox
                id="featured"
                checked={filters.isFeatured || false}
                onCheckedChange={handleFeaturedChange}
                className="h-5 w-5"
              />
              <Label
                htmlFor="featured"
                className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
              >
                Featured Products Only
              </Label>
            </div>
            <div className="flex items-center space-x-2 min-h-[44px]">
              <Checkbox
                id="inStock"
                checked={filters.inStock || false}
                onCheckedChange={handleInStockChange}
                className="h-5 w-5"
              />
              <Label
                htmlFor="inStock"
                className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
              >
                In Stock Only
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
