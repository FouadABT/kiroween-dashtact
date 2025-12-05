/**
 * Toast Notification Helpers
 * Enhanced toast notification utilities with theme support and action buttons
 */

import { toast, ExternalToast } from 'sonner';
import { 
  Notification, 
  NotificationPriority, 
  NotificationCategory 
} from '@/types/notification';

/**
 * Toast configuration options
 */
export type ToastOptions = ExternalToast;

/**
 * Default toast configuration
 */
const DEFAULT_TOAST_CONFIG: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  dismissible: true,
};

/**
 * Get toast variant based on priority
 */
function getPriorityVariant(priority: NotificationPriority): 'default' | 'success' | 'info' | 'warning' | 'error' {
  switch (priority) {
    case NotificationPriority.LOW:
      return 'info';
    case NotificationPriority.NORMAL:
      return 'default';
    case NotificationPriority.HIGH:
      return 'warning';
    case NotificationPriority.URGENT:
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get toast duration based on priority
 */
function getPriorityDuration(priority: NotificationPriority): number {
  switch (priority) {
    case NotificationPriority.LOW:
      return 4000;
    case NotificationPriority.NORMAL:
      return 5000;
    case NotificationPriority.HIGH:
      return 7000;
    case NotificationPriority.URGENT:
      return 10000; // Longer for urgent notifications
    default:
      return 5000;
  }
}

/**
 * Show a notification toast
 */
export function showNotificationToast(
  notification: Notification,
  options?: ToastOptions
): string | number {
  const config: ToastOptions = {
    ...DEFAULT_TOAST_CONFIG,
    duration: getPriorityDuration(notification.priority),
    ...options,
  };

  const variant = getPriorityVariant(notification.priority);

  // Use appropriate toast method based on priority
  switch (variant) {
    case 'success':
      return toast.success(notification.title, {
        description: notification.message,
        ...config,
      });
    case 'info':
      return toast.info(notification.title, {
        description: notification.message,
        ...config,
      });
    case 'warning':
      return toast.warning(notification.title, {
        description: notification.message,
        ...config,
      });
    case 'error':
      return toast.error(notification.title, {
        description: notification.message,
        ...config,
      });
    default:
      return toast(notification.title, {
        description: notification.message,
        ...config,
      });
  }
}

/**
 * Show a success toast
 */
export function showSuccessToast(
  title: string,
  message?: string,
  options?: ToastOptions
): string | number {
  return toast.success(title, {
    description: message,
    ...DEFAULT_TOAST_CONFIG,
    ...options,
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(
  title: string,
  message?: string,
  options?: ToastOptions
): string | number {
  return toast.error(title, {
    description: message,
    ...DEFAULT_TOAST_CONFIG,
    duration: 7000, // Longer for errors
    ...options,
  });
}

/**
 * Show a warning toast
 */
export function showWarningToast(
  title: string,
  message?: string,
  options?: ToastOptions
): string | number {
  return toast.warning(title, {
    description: message,
    ...DEFAULT_TOAST_CONFIG,
    duration: 6000,
    ...options,
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(
  title: string,
  message?: string,
  options?: ToastOptions
): string | number {
  return toast.info(title, {
    description: message,
    ...DEFAULT_TOAST_CONFIG,
    ...options,
  });
}

/**
 * Show a loading toast
 */
export function showLoadingToast(
  title: string,
  message?: string,
  options?: ToastOptions
): string | number {
  return toast.loading(title, {
    description: message,
    ...DEFAULT_TOAST_CONFIG,
    dismissible: false,
    ...options,
  });
}

/**
 * Show a promise toast (automatically updates based on promise state)
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
  options?: ToastOptions
): void {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...DEFAULT_TOAST_CONFIG,
    ...options,
  });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}

/**
 * Show a custom toast with full control
 */
export function showCustomToast(
  content: string,
  options?: ToastOptions
): string | number {
  return toast(content, {
    ...DEFAULT_TOAST_CONFIG,
    ...options,
  });
}

/**
 * Check if toasts should be shown based on user preferences
 */
export function shouldShowToast(
  category: NotificationCategory,
  preferences: Array<{ category: NotificationCategory; enabled: boolean }>
): boolean {
  const pref = preferences.find(p => p.category === category);
  return pref ? pref.enabled : true; // Default to enabled if no preference found
}

/**
 * Check if user is in Do Not Disturb mode
 */
export function isInDNDMode(
  preferences: Array<{
    dndEnabled: boolean;
    dndStartTime?: string | null;
    dndEndTime?: string | null;
    dndDays: number[];
  }>
): boolean {
  // Find any preference with DND enabled
  const dndPref = preferences.find(p => p.dndEnabled);
  if (!dndPref) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Check if current day is in DND days
  if (!dndPref.dndDays.includes(currentDay)) {
    return false;
  }

  // Check if current time is within DND period
  if (dndPref.dndStartTime && dndPref.dndEndTime) {
    const start = dndPref.dndStartTime;
    const end = dndPref.dndEndTime;

    // Handle overnight DND periods (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  return false;
}

/**
 * Get toast configuration from localStorage
 */
export function getToastConfig(): ToastOptions {
  if (typeof window === 'undefined') {
    return DEFAULT_TOAST_CONFIG;
  }

  try {
    const stored = localStorage.getItem('toast-config');
    if (stored) {
      return { ...DEFAULT_TOAST_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load toast config:', error);
  }

  return DEFAULT_TOAST_CONFIG;
}

/**
 * Save toast configuration to localStorage
 */
export function saveToastConfig(config: Partial<ToastOptions>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getToastConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('toast-config', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save toast config:', error);
  }
}
