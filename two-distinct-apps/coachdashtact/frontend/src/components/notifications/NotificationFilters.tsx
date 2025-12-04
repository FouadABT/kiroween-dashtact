'use client';

/**
 * NotificationFilters Component
 * Filter controls and bulk actions for notifications
 */

import { useState } from 'react';
import { CheckCheck, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCategory, NotificationPriority } from '@/types/notification';

/**
 * NotificationFilters Component
 */
export function NotificationFilters() {
  const { markAllAsRead, clearAll, fetchNotifications } = useNotifications();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');

  /**
   * Handle filter changes
   */
  const handleFilterChange = () => {
    const filters: Record<string, string> = {};
    
    if (categoryFilter !== 'all') {
      filters.category = categoryFilter;
    }
    
    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter;
    }
    
    fetchNotifications(filters);
  };

  /**
   * Handle clear all with confirmation
   */
  const handleClearAll = async () => {
    await clearAll();
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-3" role="toolbar" aria-label="Notification filters and actions">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" id="notifications-heading">Notifications</h2>
        <div className="flex gap-1" role="group" aria-label="Bulk actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            aria-label="Mark all notifications as read"
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Mark all as read</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            aria-label="Clear all notifications"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear all</span>
          </Button>
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="Search notifications"
          role="searchbox"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex gap-2" role="group" aria-label="Filter notifications">
        {/* Category filter */}
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value as NotificationCategory | 'all');
            handleFilterChange();
          }}
        >
          <SelectTrigger className="flex-1" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
            <SelectItem value="USER_ACTION">User Action</SelectItem>
            <SelectItem value="SECURITY">Security</SelectItem>
            <SelectItem value="BILLING">Billing</SelectItem>
            <SelectItem value="CONTENT">Content</SelectItem>
            <SelectItem value="WORKFLOW">Workflow</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="CUSTOM">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select
          value={priorityFilter}
          onValueChange={(value) => {
            setPriorityFilter(value as NotificationPriority | 'all');
            handleFilterChange();
          }}
        >
          <SelectTrigger className="flex-1" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
