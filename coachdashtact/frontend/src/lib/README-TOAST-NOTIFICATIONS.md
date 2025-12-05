# Toast Notification System

## Overview

The toast notification system provides real-time, non-intrusive notifications to users using the Sonner library. It integrates seamlessly with the notification system and respects user preferences including Do Not Disturb mode.

## Features

- **Priority-based styling**: Different toast styles based on notification priority (LOW, NORMAL, HIGH, URGENT)
- **User preferences**: Respects category preferences and Do Not Disturb settings
- **Action buttons**: Support for custom action buttons in toasts
- **Theme integration**: Automatically matches the application theme (light/dark)
- **Sound notifications**: Optional sound alerts for new notifications
- **Configurable duration**: Toast duration varies based on priority
- **Position control**: Configurable toast position (default: top-right)

## Usage

### Basic Toast Functions

```typescript
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
} from '@/lib/toast-helpers';

// Success toast
showSuccessToast('Operation completed', 'Your changes have been saved');

// Error toast
showErrorToast('Operation failed', 'Please try again later');

// Warning toast
showWarningToast('Warning', 'This action cannot be undone');

// Info toast
showInfoToast('Information', 'New features are available');

// Loading toast
const toastId = showLoadingToast('Processing', 'Please wait...');
// Later dismiss it
dismissToast(toastId);
```

### Notification Toast

```typescript
import { showNotificationToast } from '@/lib/toast-helpers';
import { Notification } from '@/types/notification';

// Show a notification as a toast
const notification: Notification = {
  id: '1',
  title: 'New Message',
  message: 'You have a new message from John',
  category: NotificationCategory.USER_ACTION,
  priority: NotificationPriority.NORMAL,
  // ... other fields
};

showNotificationToast(notification, {
  action: {
    label: 'View',
    onClick: () => {
      // Handle action
    },
  },
  cancel: {
    label: 'Dismiss',
    onClick: () => {
      // Handle dismiss
    },
  },
});
```

### Promise Toast

```typescript
import { showPromiseToast } from '@/lib/toast-helpers';

// Automatically show loading, success, or error based on promise state
const promise = fetch('/api/data').then(res => res.json());

showPromiseToast(promise, {
  loading: 'Loading data...',
  success: 'Data loaded successfully',
  error: 'Failed to load data',
});
```

### Custom Options

```typescript
showSuccessToast('Success', 'Operation completed', {
  duration: 10000, // 10 seconds
  position: 'bottom-right',
  dismissible: true,
});
```

## Toast Configuration

### Default Configuration

```typescript
{
  duration: 5000,        // 5 seconds
  position: 'top-right', // Top right corner
  dismissible: true,     // Can be dismissed by user
}
```

### Priority-based Duration

- **LOW**: 4 seconds
- **NORMAL**: 5 seconds
- **HIGH**: 7 seconds
- **URGENT**: 10 seconds

### Priority-based Styling

- **LOW**: Info style (blue)
- **NORMAL**: Default style
- **HIGH**: Warning style (orange)
- **URGENT**: Error style (red)

## User Preferences Integration

The toast system respects user notification preferences:

### Category Preferences

```typescript
import { shouldShowToast } from '@/lib/toast-helpers';

// Check if toast should be shown for a category
const shouldShow = shouldShowToast(
  NotificationCategory.SYSTEM,
  preferences
);

if (shouldShow) {
  showNotificationToast(notification);
}
```

### Do Not Disturb Mode

```typescript
import { isInDNDMode } from '@/lib/toast-helpers';

// Check if user is in DND mode
const inDND = isInDNDMode(preferences);

if (!inDND || notification.priority === NotificationPriority.URGENT) {
  // Show toast (urgent notifications bypass DND)
  showNotificationToast(notification);
}
```

## NotificationContext Integration

The `NotificationContext` automatically handles toast notifications for real-time WebSocket events:

```typescript
// In NotificationContext
socket.on('notification', (notification: Notification) => {
  // Check preferences
  const shouldShow = shouldShowToast(notification.category, preferences);
  const inDND = isInDNDMode(preferences);
  
  // Don't show if disabled or in DND (unless urgent)
  if (!shouldShow || (inDND && notification.priority !== NotificationPriority.URGENT)) {
    return;
  }
  
  // Play sound
  playNotificationSound();
  
  // Show toast with action buttons
  showNotificationToast(notification, {
    action: {
      label: 'View',
      onClick: () => markAsRead(notification.id),
    },
    cancel: {
      label: 'Dismiss',
    },
  });
});
```

## Action Buttons

Toasts can include action buttons for quick interactions:

```typescript
showNotificationToast(notification, {
  action: {
    label: 'Approve',
    onClick: async () => {
      // Execute action
      await fetch('/api/approve', { method: 'POST' });
      showSuccessToast('Approved');
    },
  },
  cancel: {
    label: 'Reject',
    onClick: async () => {
      // Execute cancel action
      await fetch('/api/reject', { method: 'POST' });
      showSuccessToast('Rejected');
    },
  },
});
```

## Notification Actions

The system supports different action types from notifications:

- **LINK**: Opens a URL in a new tab
- **API_CALL**: Makes an API request
- **INLINE_FORM**: Shows an inline form (future enhancement)
- **DISMISS**: Simply dismisses the notification

```typescript
// Example with API call action
if (notification.actions && notification.actions.length > 0) {
  const action = notification.actions[0];
  
  showNotificationToast(notification, {
    action: {
      label: action.label,
      onClick: async () => {
        if (action.actionType === 'API_CALL' && action.actionUrl) {
          await fetch(action.actionUrl, {
            method: action.actionMethod || 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: action.actionPayload ? JSON.stringify(action.actionPayload) : undefined,
          });
        }
      },
    },
  });
}
```

## Toast Management

### Dismiss Toasts

```typescript
import { dismissToast, dismissAllToasts } from '@/lib/toast-helpers';

// Dismiss a specific toast
const toastId = showSuccessToast('Success');
dismissToast(toastId);

// Dismiss all toasts
dismissAllToasts();
```

### Toast Configuration Storage

```typescript
import { getToastConfig, saveToastConfig } from '@/lib/toast-helpers';

// Get current configuration
const config = getToastConfig();

// Save custom configuration
saveToastConfig({
  duration: 7000,
  position: 'bottom-right',
});
```

## Styling

The toast system uses the application's design tokens for consistent styling:

```css
/* Toast styles automatically match theme */
.toast {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.toast-description {
  color: var(--muted-foreground);
}

.toast-action-button {
  background: var(--primary);
  color: var(--primary-foreground);
}

.toast-cancel-button {
  background: var(--muted);
  color: var(--muted-foreground);
}
```

## Accessibility

The toast system is fully accessible:

- **Screen reader support**: Toasts are announced to screen readers
- **Keyboard navigation**: Toasts can be dismissed with Escape key
- **Focus management**: Action buttons are keyboard accessible
- **ARIA attributes**: Proper ARIA roles and labels

## Best Practices

1. **Use appropriate toast types**: Match the toast type to the message severity
2. **Keep messages concise**: Toasts should be brief and scannable
3. **Provide actions when relevant**: Add action buttons for quick interactions
4. **Respect user preferences**: Always check preferences before showing toasts
5. **Don't overuse toasts**: Too many toasts can be annoying
6. **Use loading toasts for async operations**: Show progress for long-running tasks
7. **Test with DND mode**: Ensure urgent notifications still show during DND

## Examples

### Success Notification

```typescript
// After successful form submission
showSuccessToast(
  'Profile updated',
  'Your profile has been updated successfully'
);
```

### Error with Retry

```typescript
// After failed API call
showErrorToast(
  'Failed to save',
  'Please try again',
  {
    action: {
      label: 'Retry',
      onClick: () => {
        // Retry the operation
        saveData();
      },
    },
  }
);
```

### Warning with Confirmation

```typescript
// Before destructive action
showWarningToast(
  'Delete account?',
  'This action cannot be undone',
  {
    action: {
      label: 'Delete',
      onClick: () => {
        // Proceed with deletion
        deleteAccount();
      },
    },
    cancel: {
      label: 'Cancel',
    },
  }
);
```

### Loading with Promise

```typescript
// During async operation
const promise = updateProfile(data);

showPromiseToast(promise, {
  loading: 'Updating profile...',
  success: (data) => `Profile updated: ${data.name}`,
  error: (error) => `Failed: ${error.message}`,
});
```

## Troubleshooting

### Toasts not showing

1. Check if Toaster component is in layout.tsx
2. Verify user preferences allow the notification category
3. Check if user is in DND mode
4. Ensure notification priority is set correctly

### Toasts showing too long/short

1. Adjust duration in toast options
2. Check priority-based duration settings
3. Verify default configuration

### Action buttons not working

1. Check onClick handler is defined
2. Verify action type is supported
3. Check for JavaScript errors in console

### Theme not matching

1. Verify ThemeProvider is wrapping the app
2. Check CSS custom properties are defined
3. Ensure Toaster component has theme prop

## API Reference

See `frontend/src/lib/toast-helpers.ts` for complete API documentation.

## Related Documentation

- [Notification System](../../.kiro/specs/notification-system/design.md)
- [Notification Context](../contexts/NotificationContext.tsx)
- [Notification Sound](./notification-sound.ts)
- [User Preferences](../app/dashboard/settings/notifications/page.tsx)
