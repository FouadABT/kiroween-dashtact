'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { UploadType, Visibility, GetUploadsQuery } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaFiltersProps {
  filters: GetUploadsQuery;
  onFiltersChange: (filters: GetUploadsQuery) => void;
  isAdmin?: boolean;
}

export function MediaFilters({ filters, onFiltersChange, isAdmin = false }: MediaFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleFilterChange = (key: keyof GetUploadsQuery, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    handleFilterChange('startDate', date ? date.toISOString() : undefined);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    handleFilterChange('endDate', date ? date.toISOString() : undefined);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = !!(
    filters.type ||
    filters.visibility ||
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    filters.uploadedBy
  );

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search files..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">File Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value={UploadType.IMAGE}>Images</SelectItem>
              <SelectItem value={UploadType.DOCUMENT}>Documents</SelectItem>
              <SelectItem value={UploadType.AVATAR}>Avatars</SelectItem>
              <SelectItem value={UploadType.EDITOR_IMAGE}>Editor Images</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={filters.visibility || 'all'}
            onValueChange={(value) =>
              handleFilterChange('visibility', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="visibility">
              <SelectValue placeholder="All visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value={Visibility.PUBLIC}>Public</SelectItem>
              <SelectItem value={Visibility.PRIVATE}>Private</SelectItem>
              <SelectItem value={Visibility.ROLE_BASED}>Role-based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PP') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Uploaded</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) => handleFilterChange('sortOrder', value)}
          >
            <SelectTrigger id="sortOrder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
