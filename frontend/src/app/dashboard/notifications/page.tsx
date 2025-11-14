'use client';

/**
 * Notifications Page
 * Full-page view of all notifications with pagination, filtering, and bulk actions
 * Users can read and delete their own notifications
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMetadata } from '@/contexts/MetadataContext';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, CheckCheck, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLoadingState } from '@/components/auth/PageLoadingState';
import { NotificationCategory, NotificationPriority } from '@/types/notification';
import { NotificationApi } from '@/lib/api';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const { updateMetadata } = useMetadata();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'ALL'>('ALL');
  const [readFilter, setReadFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: 'Notifications',
      description: 'View and manage all your notifications',
      keywords: ['notifications', 'alerts', 'messages', 'updates'],
    });
  }, [updateMetadata]);

  // Filtered notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (categoryFilter !== 'ALL' && notification.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && notification.priority !== priorityFilter) return false;
    if (readFilter === 'READ' && !notification.isRead) return false;
    if (readFilter === 'UNREAD' && notification.isRead) return false;
    return true;
  });

  // Select all toggle
  const allSelected = filteredNotifications.length > 0 && 
    filteredNotifications.every(n => selectedIds.has(n.id));
  const someSelected = filteredNotifications.some(n => selectedIds.has(n.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkSelectedAsRead = async () => {
    const promises = Array.from(selectedIds).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} notification(s)?`)) return;
    const promises = Array.from(selectedIds).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedIds(new Set());
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all notifications? This cannot be undone.')) return;
    await clearAll();
    setSelectedIds(new Set());
  };

  const handleCreateDemo = async () => {
    try {
      await NotificationApi.createDemo();
      // WebSocket will handle the real-time update automatically
      // No need to call fetchNotifications() which can cause race conditions
    } catch (error) {
      console.error('Failed to create demo notification:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Page Header with Breadcrumbs */}
        <PageHeader
          title="Notifications"
          description="Manage your notifications and stay updated"
          actions={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {unreadCount} unread
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateDemo}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Filter notifications by category, priority, or read status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2" role="group" aria-label="Filter notifications">
              {/* Category filter */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as NotificationCategory | 'ALL')}
              >
                <SelectTrigger className="flex-1" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
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
                onValueChange={(value) => setPriorityFilter(value as NotificationPriority | 'ALL')}
              >
                <SelectTrigger className="flex-1" aria-label="Filter by priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {/* Read status filter */}
              <Select
                value={readFilter}
                onValueChange={(value) => setReadFilter(value as 'ALL' | 'READ' | 'UNREAD')}
              >
                <SelectTrigger className="flex-1" aria-label="Filter by read status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="UNREAD">Unread</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all notifications"
                    className={someSelected && !allSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                  </span>
                </div>

                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkSelectedAsRead}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}

                {selectedIds.size === 0 && notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark All as Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardContent className="pt-6">
            {isLoading && notifications.length === 0 ? (
              <PageLoadingState message="Loading notifications..." />
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {notifications.length === 0
                    ? "You don't have any notifications yet"
                    : 'No notifications match your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 group">
                    <Checkbox
                      checked={selectedIds.has(notification.id)}
                      onCheckedChange={() => handleSelectOne(notification.id)}
                      aria-label={`Select notification: ${notification.title}`}
                      className="mt-3"
                    />
                    <div className="flex-1">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
            <div>
              {unreadCount} unread · {notifications.length - unreadCount} read
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
