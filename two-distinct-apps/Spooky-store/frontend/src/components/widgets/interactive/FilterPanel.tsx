'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterConfig, FilterState } from '../types/widget.types';

export interface FilterPanelProps {
  filters: FilterConfig[];
  defaultOpen?: boolean;
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export function FilterPanel({
  filters,
  defaultOpen = true,
  onFilterChange,
  className,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [filterState, setFilterState] = useState<FilterState>(() => {
    // Initialize from URL query parameters
    const initialState: FilterState = {};
    filters.forEach((filter) => {
      const paramValue = searchParams.get(filter.id);
      if (paramValue) {
        initialState[filter.id] = paramValue;
      } else if (filter.defaultValue !== undefined) {
        initialState[filter.id] = filter.defaultValue;
      }
    });
    return initialState;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(filterState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onFilterChange?.(filterState);
  }, [filterState, pathname, router, searchParams, onFilterChange]);

  const handleFilterChange = (filterId: string, value: string | number | Date | [number, number] | undefined) => {
    setFilterState((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleClearFilter = (filterId: string) => {
    setFilterState((prev) => {
      const newState = { ...prev };
      delete newState[filterId];
      return newState;
    });
  };

  const handleClearAll = () => {
    setFilterState({});
  };

  const renderFilter = (filter: FilterConfig) => {
    const value = filterState[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <div key={filter.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={filter.id}>{filter.label}</Label>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter(filter.id)}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Input
              id={filter.id}
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              placeholder={`Enter ${filter.label.toLowerCase()}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={filter.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={filter.id}>{filter.label}</Label>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter(filter.id)}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={typeof value === 'string' ? value : ''}
              onValueChange={(val) => handleFilterChange(filter.id, val)}
            >
              <SelectTrigger id={filter.id}>
                <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        const dateValue = typeof value === 'string' || value instanceof Date ? value : undefined;
        return (
          <div key={filter.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={filter.id}>{filter.label}</Label>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter(filter.id)}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={filter.id}
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateValue && 'text-muted-foreground'
                  )}
                >
                  {dateValue ? format(new Date(dateValue), 'PPP') : `Pick ${filter.label.toLowerCase()}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue ? new Date(dateValue) : undefined}
                  onSelect={(date) =>
                    handleFilterChange(filter.id, date?.toISOString())
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'range':
        const rangeValue: [number, number] = Array.isArray(value) && value.length === 2 
          ? [Number(value[0]), Number(value[1])] 
          : [0, 100];
        return (
          <div key={filter.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={filter.id}>{filter.label}</Label>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter(filter.id)}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Slider
                id={filter.id}
                value={rangeValue}
                onValueChange={(val) => handleFilterChange(filter.id, val as [number, number])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{rangeValue[0]}</span>
                <span>{rangeValue[1]}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.keys(filterState).length > 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('border rounded-lg bg-card', className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filters</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {Object.keys(filterState).length}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0">
        <div className="space-y-4">
          {filters.map((filter) => renderFilter(filter))}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
