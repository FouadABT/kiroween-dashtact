'use client';

import { useState, useEffect } from 'react';
import { OrderQueryDto, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderFiltersProps {
  filters: OrderQueryDto;
  onFiltersChange: (filters: OrderQueryDto) => void;
  onReset: () => void;
}

export function OrderFilters({ filters, onFiltersChange, onReset }: OrderFiltersProps) {
  const [localFilters, setLocalFilters] = useState<OrderQueryDto>(filters);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    const updatedFilters = {
      ...localFilters,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    };
    onFiltersChange(updatedFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    onReset();
  };

  return (
    <div className="space-y-6 py-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Search</Label>
        <Input
          id="search"
          placeholder="Order number, customer name..."
          value={localFilters.search || ''}
          onChange={(e) =>
            setLocalFilters({ ...localFilters, search: e.target.value || undefined })
          }
        />
      </div>

      {/* Order Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">Order Status</Label>
        <Select
          value={localFilters.status || 'all'}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              status: value === 'all' ? undefined : (value as OrderStatus),
            })
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Status */}
      <div className="space-y-2">
        <Label htmlFor="paymentStatus" className="text-sm font-medium">Payment Status</Label>
        <Select
          value={localFilters.paymentStatus || 'all'}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              paymentStatus: value === 'all' ? undefined : (value as PaymentStatus),
            })
          }
        >
          <SelectTrigger id="paymentStatus">
            <SelectValue placeholder="All payment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fulfillment Status */}
      <div className="space-y-2">
        <Label htmlFor="fulfillmentStatus" className="text-sm font-medium">Fulfillment Status</Label>
        <Select
          value={localFilters.fulfillmentStatus || 'all'}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              fulfillmentStatus: value === 'all' ? undefined : (value as FulfillmentStatus),
            })
          }
        >
          <SelectTrigger id="fulfillmentStatus">
            <SelectValue placeholder="All fulfillment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fulfillment statuses</SelectItem>
            <SelectItem value="UNFULFILLED">Unfulfilled</SelectItem>
            <SelectItem value="PARTIALLY_FULFILLED">Partially Fulfilled</SelectItem>
            <SelectItem value="FULFILLED">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2 pt-4 border-t">
        <Label className="text-sm font-medium">Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'MMM dd, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'MMM dd, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="sortBy" className="text-sm font-medium">Sort By</Label>
        <Select
          value={localFilters.sortBy || 'createdAt'}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              sortBy: value as 'orderNumber' | 'createdAt' | 'total',
            })
          }
        >
          <SelectTrigger id="sortBy">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="orderNumber">Order Number</SelectItem>
            <SelectItem value="total">Total Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</Label>
        <Select
          value={localFilters.sortOrder || 'desc'}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              sortOrder: value as 'asc' | 'desc',
            })
          }
        >
          <SelectTrigger id="sortOrder">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-6 border-t">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}
