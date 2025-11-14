'use client';

/**
 * Notification Settings Page
 * 
 * Allows users to configure their notification preferences including:
 * - Do Not Disturb schedule
 * - Category-specific preferences
 * - Global notification settings
 * - Notification sound preferences
 */

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCategory } from '@/types/notification';
import { 
  Bell, 
  Moon, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

/**
 * Category metadata for display
 */
const CATEGORY_INFO: Record<NotificationCategory, { label: string; description: string; icon: React.ReactNode }> = {
  [NotificationCategory.SYSTEM]: {
    label: 'System',
    description: 'System updates, maintenance, and important announcements',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.USER_ACTION]: {
    label: 'User Actions',
    description: 'Actions performed by other users that affect you',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.SECURITY]: {
    label: 'Security',
    description: 'Security alerts, login attempts, and account changes',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.BILLING]: {
    label: 'Billing',
    description: 'Payment notifications, invoices, and subscription updates',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.CONTENT]: {
    label: 'Content',
    description: 'New content, updates, and content-related notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.WORKFLOW]: {
    label: 'Workflow',
    description: 'Workflow updates, task assignments, and process notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.SOCIAL]: {
    label: 'Social',
    description: 'Social interactions, mentions, and community updates',
    icon: <Bell className="h-4 w-4" />,
  },
  [NotificationCategory.CUSTOM]: {
    label: 'Custom',
    description: 'Custom notifications and integrations',
    icon: <Bell className="h-4 w-4" />,
  },
};

/**
 * Days of the week for DND schedule
 */
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

/**
 * Time options for DND schedule (24-hour format)
 */
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function NotificationSettingsPage() {
  const { 
    preferences, 
    isLoading, 
    fetchPreferences,
    updatePreference,
    setDND,
  } = useNotifications();

  // Local state for DND settings
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState('22:00');
  const [dndEndTime, setDndEndTime] = useState('08:00');
  const [dndDays, setDndDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isSavingDND, setIsSavingDND] = useState(false);

  // Local state for global settings
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [globalNotificationsEnabled, setGlobalNotificationsEnabled] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Initialize DND settings from preferences
  useEffect(() => {
    if (preferences.length > 0) {
      // Get DND settings from first preference (they're the same across all categories)
      const firstPref = preferences[0];
      if (firstPref) {
        setDndEnabled(firstPref.dndEnabled);
        setDndStartTime(firstPref.dndStartTime || '22:00');
        setDndEndTime(firstPref.dndEndTime || '08:00');
        setDndDays(firstPref.dndDays || [0, 1, 2, 3, 4, 5, 6]);
      }

      // Check if all categories are enabled
      const allEnabled = preferences.every(p => p.enabled);
      setGlobalNotificationsEnabled(allEnabled);
    }
  }, [preferences]);

  // Load notification sound preference from localStorage
  useEffect(() => {
    const soundEnabled = localStorage.getItem('notification-sound-enabled');
    if (soundEnabled !== null) {
      setNotificationSoundEnabled(soundEnabled === 'true');
    }
  }, []);

  /**
   * Handle DND toggle
   */
  const handleDNDToggle = async (enabled: boolean) => {
    setDndEnabled(enabled);
    setIsSavingDND(true);
    
    try {
      await setDND({
        enabled,
        startTime: dndStartTime,
        endTime: dndEndTime,
        days: dndDays,
      });
    } catch (error) {
      console.error('Failed to update DND settings:', error);
      setDndEnabled(!enabled); // Revert on error
    } finally {
      setIsSavingDND(false);
    }
  };

  /**
   * Handle DND time change
   */
  const handleDNDTimeChange = async (field: 'startTime' | 'endTime', value: string) => {
    if (field === 'startTime') {
      setDndStartTime(value);
    } else {
      setDndEndTime(value);
    }

    setIsSavingDND(true);
    try {
      await setDND({
        enabled: dndEnabled,
        startTime: field === 'startTime' ? value : dndStartTime,
        endTime: field === 'endTime' ? value : dndEndTime,
        days: dndDays,
      });
    } catch (error) {
      console.error('Failed to update DND time:', error);
    } finally {
      setIsSavingDND(false);
    }
  };

  /**
   * Handle DND day toggle
   */
  const handleDNDDayToggle = async (day: number) => {
    const newDays = dndDays.includes(day)
      ? dndDays.filter(d => d !== day)
      : [...dndDays, day].sort();

    setDndDays(newDays);

    setIsSavingDND(true);
    try {
      await setDND({
        enabled: dndEnabled,
        startTime: dndStartTime,
        endTime: dndEndTime,
        days: newDays,
      });
    } catch (error) {
      console.error('Failed to update DND days:', error);
      setDndDays(dndDays); // Revert on error
    } finally {
      setIsSavingDND(false);
    }
  };

  /**
   * Handle category preference toggle
   */
  const handleCategoryToggle = async (category: NotificationCategory, enabled: boolean) => {
    try {
      await updatePreference(category, { enabled });
    } catch (error) {
      console.error('Failed to update category preference:', error);
    }
  };

  /**
   * Handle global notifications toggle
   */
  const handleGlobalToggle = async (enabled: boolean) => {
    setGlobalNotificationsEnabled(enabled);

    try {
      // Update all categories
      await Promise.all(
        Object.values(NotificationCategory).map(category =>
          updatePreference(category, { enabled })
        )
      );
      toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
    } catch (error) {
      console.error('Failed to update global notifications:', error);
      setGlobalNotificationsEnabled(!enabled); // Revert on error
    }
  };

  /**
   * Handle notification sound toggle
   */
  const handleSoundToggle = (enabled: boolean) => {
    setNotificationSoundEnabled(enabled);
    localStorage.setItem('notification-sound-enabled', enabled.toString());
    toast.success(enabled ? 'Notification sound enabled' : 'Notification sound disabled');
  };

  /**
   * Handle reset to defaults
   */
  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all notification settings to defaults?')) {
      return;
    }

    try {
      // Reset all categories to enabled
      await Promise.all(
        Object.values(NotificationCategory).map(category =>
          updatePreference(category, { enabled: true })
        )
      );

      // Reset DND settings
      await setDND({
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6],
      });

      // Reset sound
      setNotificationSoundEnabled(true);
      localStorage.setItem('notification-sound-enabled', 'true');

      toast.success('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  };

  /**
   * Handle preview notification
   */
  const handlePreviewNotification = () => {
    toast('Preview Notification', {
      description: 'This is how your notifications will appear',
      action: {
        label: 'Dismiss',
        onClick: () => {},
      },
    });
  };

  if (isLoading && preferences.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notification Settings"
          description="Manage your notification preferences and channels"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Manage your notification preferences and channels"
      />

      {/* Global Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            Control all notifications and sound preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="global-notifications" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn all notifications on or off
              </p>
            </div>
            <Switch
              id="global-notifications"
              checked={globalNotificationsEnabled}
              onCheckedChange={handleGlobalToggle}
            />
          </div>

          {/* Notification Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              {notificationSoundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="notification-sound" className="text-base">
                  Notification Sound
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when new notifications arrive
                </p>
              </div>
            </div>
            <Switch
              id="notification-sound"
              checked={notificationSoundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefaults}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewNotification}
            >
              <Bell className="h-4 w-4 mr-2" />
              Preview Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <CardTitle>Do Not Disturb</CardTitle>
          </div>
          <CardDescription>
            Silence notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DND Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dnd-enabled" className="text-base">
                Enable Do Not Disturb
              </Label>
              <p className="text-sm text-muted-foreground">
                Mute non-urgent notifications during selected hours
              </p>
            </div>
            <Switch
              id="dnd-enabled"
              checked={dndEnabled}
              onCheckedChange={handleDNDToggle}
              disabled={isSavingDND}
            />
          </div>

          {/* DND Schedule (only shown when enabled) */}
          {dndEnabled && (
            <div className="space-y-4 pt-4 border-t">
              {/* Time Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Schedule</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="dnd-start-time" className="text-sm text-muted-foreground">
                      Start Time
                    </Label>
                    <Select
                      value={dndStartTime}
                      onValueChange={(value) => handleDNDTimeChange('startTime', value)}
                      disabled={isSavingDND}
                    >
                      <SelectTrigger id="dnd-start-time">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label htmlFor="dnd-end-time" className="text-sm text-muted-foreground">
                      End Time
                    </Label>
                    <Select
                      value={dndEndTime}
                      onValueChange={(value) => handleDNDTimeChange('endTime', value)}
                      disabled={isSavingDND}
                    >
                      <SelectTrigger id="dnd-end-time">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Days of Week */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Active Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center">
                      <Button
                        type="button"
                        variant={dndDays.includes(day.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDNDDayToggle(day.value)}
                        disabled={isSavingDND}
                        className="w-14"
                      >
                        {day.label}
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the days when Do Not Disturb should be active
                </p>
              </div>

              {/* Status Indicator */}
              {isSavingDND && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving changes...</span>
                </div>
              )}
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Urgent notifications will still be delivered during Do Not Disturb hours.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Category Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preferences.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No preferences found. Loading...
                </p>
              </div>
            ) : (
              preferences.map((preference) => {
                const categoryInfo = CATEGORY_INFO[preference.category];
                return (
                  <div
                    key={preference.id}
                    className="flex items-start justify-between gap-4 py-4 border-b last:border-0"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-muted-foreground">
                        {categoryInfo.icon}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`category-${preference.category}`}
                            className="text-base font-medium cursor-pointer"
                          >
                            {categoryInfo.label}
                          </Label>
                          {!preference.enabled && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {categoryInfo.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={`category-${preference.category}`}
                      checked={preference.enabled}
                      onCheckedChange={(enabled) =>
                        handleCategoryToggle(preference.category, enabled)
                      }
                      disabled={isLoading}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Info Alert */}
          {preferences.length > 0 && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changes are saved automatically. You can enable or disable specific notification categories at any time.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
