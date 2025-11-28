'use client';

import { useState, useEffect } from 'react';
import { CalendarFilters, EventCategory } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, Tag, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CalendarFiltersComponentProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
}

export function CalendarFiltersComponent({
  filters,
  onFiltersChange,
}: CalendarFiltersComponentProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.statuses || []
  );

  // Mock categories - will be replaced with API call
  const mockCategories: EventCategory[] = [
    { id: '1', name: 'Meeting', slug: 'meeting', color: '#3B82F6', isSystem: true, displayOrder: 1, isActive: true },
    { id: '2', name: 'Task', slug: 'task', color: '#10B981', isSystem: true, displayOrder: 2, isActive: true },
    { id: '3', name: 'Deadline', slug: 'deadline', color: '#EF4444', isSystem: true, displayOrder: 3, isActive: true },
    { id: '4', name: 'Booking', slug: 'booking', color: '#8B5CF6', isSystem: true, displayOrder: 4, isActive: true },
  ];

  const statuses = [
    { value: 'SCHEDULED', label: 'Scheduled', icon: CheckCircle2 },
    { value: 'CANCELLED', label: 'Cancelled', icon: X },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  ];

  // Update filters when local state changes
  useEffect(() => {
    const newFilters: CalendarFilters = {
      ...filters,
      search: searchQuery || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses as any : undefined,
    };
    onFiltersChange(newFilters);
  }, [searchQuery, selectedCategories, selectedStatuses]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) + 
    selectedCategories.length + 
    selectedStatuses.length;

  return (
    <Card className="p-4 bg-card text-card-foreground border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search input */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
              aria-label="Search events"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
              aria-label="Filter by category"
            >
              <Tag className="h-4 w-4 mr-2" />
              Categories
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Event Categories</Label>
              </div>
              <div className="space-y-2">
                {mockCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      aria-label={`Filter by ${category.name}`}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span>{category.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Status filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
              aria-label="Filter by status"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Status
              {selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Event Status</Label>
              </div>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                      aria-label={`Filter by ${status.label}`}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                    >
                      <status.icon className="h-4 w-4" />
                      <span>{status.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
            aria-label={`Clear ${activeFilterCount} active filters`}
          >
            <X className="h-4 w-4 mr-2" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              {searchQuery}
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategories.map((categoryId) => {
            const category = mockCategories.find(c => c.id === categoryId);
            if (!category) return null;
            return (
              <Badge key={categoryId} variant="secondary" className="gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                {category.name}
                <button
                  onClick={() => handleCategoryToggle(categoryId)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label={`Remove ${category.name} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedStatuses.map((status) => {
            const statusObj = statuses.find(s => s.value === status);
            if (!statusObj) return null;
            return (
              <Badge key={status} variant="secondary" className="gap-1">
                <statusObj.icon className="h-3 w-3" />
                {statusObj.label}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label={`Remove ${statusObj.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </Card>
  );
}
