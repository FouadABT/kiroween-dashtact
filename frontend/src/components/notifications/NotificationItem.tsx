'use client';

/**
 * NotificationItem Component
 * Individual notification display with actions
 * Supports keyboard navigation and accessibility
 */

import { useState, forwardRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  User,
  Shield,
  CreditCard,
  FileText,
  GitBranch,
  Users,
  Settings,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Notification, NotificationCategory, NotificationPriority, NotificationAction, ActionType } from '@/types/notification';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/**
 * NotificationItem Props
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
  onActionExecute?: (notificationId: string, actionId: string) => Promise<void>;
  isFocused?: boolean;
}

/**
 * Category icon mapping
 */
const categoryIcons: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  SYSTEM: Settings,
  USER_ACTION: User,
  SECURITY: Shield,
  BILLING: CreditCard,
  CONTENT: FileText,
  WORKFLOW: GitBranch,
  SOCIAL: Users,
  CUSTOM: Bell,
};

/**
 * Priority color mapping for icons
 */
const priorityColors: Record<NotificationPriority, string> = {
  LOW: 'text-gray-500 dark:text-gray-400',
  NORMAL: 'text-blue-500 dark:text-blue-400',
  HIGH: 'text-orange-500 dark:text-orange-400',
  URGENT: 'text-red-500 dark:text-red-400',
};

/**
 * Priority background colors for urgent notifications
 */
const priorityBackgrounds: Record<NotificationPriority, string> = {
  LOW: '',
  NORMAL: '',
  HIGH: '',
  URGENT: 'border-l-4 border-red-500',
};

/**
 * NotificationItem Component
 * Wrapped with forwardRef for keyboard navigation support
 */
export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  onActionExecute,
  isFocused = false,
}, ref) {
  const router = useRouter();
  const Icon = categoryIcons[notification.category];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ actionId: string; success: boolean; message?: string } | null>(null);

  /**
   * Handle action button click
   */
  const handleActionClick = async (action: NotificationAction) => {
    setExecutingActionId(action.id);
    setActionResult(null);

    try {
      switch (action.actionType) {
        case ActionType.LINK:
          // Navigate to URL
          if (action.actionUrl) {
            if (action.actionUrl.startsWith('http')) {
              window.open(action.actionUrl, '_blank');
            } else {
              router.push(action.actionUrl);
            }
          }
          setActionResult({ actionId: action.id, success: true });
          break;

        case ActionType.API_CALL:
          // Execute API call
          if (onActionExecute) {
            await onActionExecute(notification.id, action.id);
            setActionResult({ actionId: action.id, success: true, message: 'Action completed' });
          }
          break;

        case ActionType.DISMISS:
          // Dismiss notification
          onDelete(notification.id);
          break;

        case ActionType.INLINE_FORM:
          // For inline forms, we'll just show a success message
          // In a real implementation, this would open a form dialog
          setActionResult({ actionId: action.id, success: true, message: 'Form opened' });
          break;

        default:
          console.warn('Unknown action type:', action.actionType);
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      setActionResult({ 
        actionId: action.id, 
        success: false, 
        message: error instanceof Error ? error.message : 'Action failed' 
      });
    } finally {
      setExecutingActionId(null);
    }
  };

  /**
   * Handle notification click
   */
  const handleNotificationClick = () => {
    // If there's an actionUrl, navigate to it
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        router.push(notification.actionUrl);
      }
    }
    
    // Call the onClick handler if provided
    onClick?.(notification);
    
    // Mark as read if unread
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(notification.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'flex gap-3 p-4 hover:bg-accent cursor-pointer transition-all duration-200',
          'border-b border-border last:border-b-0',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
          !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20',
          priorityBackgrounds[notification.priority],
          notification.priority === NotificationPriority.URGENT && 'shadow-sm',
          isFocused && 'ring-2 ring-primary ring-inset'
        )}
        onClick={handleNotificationClick}
        role="listitem"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNotificationClick();
          }
        }}
        aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.title}. ${notification.message}. ${formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}`}
        aria-describedby={`notification-content-${notification.id}`}
        aria-live={notification.priority === NotificationPriority.URGENT ? 'assertive' : 'polite'}
      >
        {/* Icon with priority styling */}
        <div className={cn('mt-1 flex-shrink-0', priorityColors[notification.priority])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{notification.category.replace('_', ' ').toLowerCase()} notification</span>
          {notification.priority === NotificationPriority.URGENT && (
            <>
              <AlertTriangle className="h-3 w-3 absolute -mt-1 -ml-1" aria-hidden="true" />
              <span className="sr-only">Urgent priority</span>
            </>
          )}
        </div>

        {/* Content */}
        <div 
          className="flex-1 space-y-1 min-w-0"
          id={`notification-content-${notification.id}`}
        >
          {/* Title and unread indicator */}
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              'font-medium text-sm line-clamp-2',
              notification.priority === NotificationPriority.URGENT && 'text-red-600 dark:text-red-400'
            )}>
              {notification.title}
              {notification.priority === NotificationPriority.URGENT && (
                <span className="ml-2 text-xs font-bold uppercase text-red-600 dark:text-red-400" role="status">
                  Urgent
                </span>
              )}
            </p>
            {!notification.isRead && (
              <div
                className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"
                role="status"
                aria-label="Unread"
              />
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          {/* Action buttons from notification */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {notification.actions.map((action) => (
                <div key={action.id} className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={(action.variant || 'default') as 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(action);
                    }}
                    disabled={executingActionId === action.id}
                    className="h-8"
                  >
                    {executingActionId === action.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      action.label
                    )}
                  </Button>
                  {actionResult?.actionId === action.id && (
                    <span className={cn(
                      'text-xs',
                      actionResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {actionResult.message || (actionResult.success ? '✓' : '✗')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer with timestamp and actions */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>

            <div className="flex gap-1">
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                aria-label="Delete notification"
                title="Delete notification"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
