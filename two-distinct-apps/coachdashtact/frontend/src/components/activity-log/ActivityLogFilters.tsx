'use client';

import { useState } from 'react';
import { Search, X, Calendar, User, FileText, Activity } from 'lucide-react';
import { ActivityLogFilters as Filters, ActivityAction } from '@/types/activity-log';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface ActivityLogFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onReset: () => void;
}

// Group actions by category
const actionGroups = {
  Authentication: [
    ActivityAction.USER_LOGIN,
    ActivityAction.USER_LOGOUT,
    ActivityAction.USER_REGISTER,
    ActivityAction.PASSWORD_CHANGED,
  ],
  'User Management': [
    ActivityAction.USER_CREATED,
    ActivityAction.USER_UPDATED,
    ActivityAction.USER_DELETED,
    ActivityAction.USER_ROLE_CHANGED,
  ],
  'Content Management': [
    ActivityAction.PAGE_CREATED,
    ActivityAction.PAGE_UPDATED,
    ActivityAction.PAGE_DELETED,
    ActivityAction.PAGE_PUBLISHED,
    ActivityAction.BLOG_POST_CREATED,
    ActivityAction.BLOG_POST_UPDATED,
    ActivityAction.BLOG_POST_DELETED,
    ActivityAction.BLOG_POST_PUBLISHED,
  ],
  'E-commerce': [
    ActivityAction.PRODUCT_CREATED,
    ActivityAction.PRODUCT_UPDATED,
    ActivityAction.PRODUCT_DELETED,
    ActivityAction.ORDER_CREATED,
    ActivityAction.ORDER_UPDATED,
    ActivityAction.ORDER_STATUS_CHANGED,
  ],
  Settings: [
    ActivityAction.SETTINGS_UPDATED,
    ActivityAction.MENU_UPDATED,
    ActivityAction.WIDGET_ADDED,
    ActivityAction.WIDGET_REMOVED,
  ],
  System: [
    ActivityAction.SYSTEM_ERROR,
    ActivityAction.SYSTEM_WARNING,
  ],
};

const entityTypes = [
  'User',
  'Page',
  'BlogPost',
  'Product',
  'Order',
  'Settings',
  'Menu',
  'Widget',
];

export function ActivityLogFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: ActivityLogFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const hasActiveFilters = 
    filters.action || 
    filters.userId || 
    filters.entityType || 
    filters.entityId || 
    filters.startDate || 
    filters.endDate;

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFiltersChange({
      ...filters,
      startDate: date ? date.toISOString() : undefined,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFiltersChange({
      ...filters,
      endDate: date ? date.toISOString() : undefined,
    });
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onReset();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action filter */}
        <div className="space-y-2">
          <Label htmlFor="action-filter" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Action
          </Label>
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                action: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="action-filter">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {Object.entries(actionGroups).map(([group, actions]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {group}
                  </div>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entity type filter */}
        <div className="space-y-2">
          <Label htmlFor="entity-filter" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Entity Type
          </Label>
          <Select
            value={filters.entityType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                entityType: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="entity-filter">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User ID filter */}
        <div className="space-y-2">
          <Label htmlFor="user-filter" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User ID
          </Label>
          <Input
            id="user-filter"
            placeholder="Filter by user ID"
            value={filters.userId || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                userId: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Entity ID filter */}
        <div className="space-y-2">
          <Label htmlFor="entity-id-filter" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Entity ID
          </Label>
          <Input
            id="entity-id-filter"
            placeholder="Filter by entity ID"
            value={filters.entityId || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                entityId: e.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      {/* Date range filters */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Start date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 ml-auto">
          <Button onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
