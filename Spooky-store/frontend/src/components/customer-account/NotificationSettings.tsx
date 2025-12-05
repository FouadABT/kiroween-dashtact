'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { AccountSettings } from '@/types/account-settings';

interface NotificationSettingsProps {
  settings: AccountSettings | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdate?: (updates: Partial<AccountSettings>) => Promise<void>;
}

export function NotificationSettings({
  settings,
  isLoading = false,
  error = null,
  onUpdate,
}: NotificationSettingsProps) {
  const [localSettings, setLocalSettings] = useState<Partial<AccountSettings>>(
    settings ? {
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      marketingEmails: settings.marketingEmails,
      orderUpdates: settings.orderUpdates,
    } : {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (key: keyof typeof localSettings, value: boolean) => {
      const newSettings = { ...localSettings, [key]: value };
      setLocalSettings(newSettings);

      if (!onUpdate) return;

      setIsSaving(true);
      setSuccessMessage(null);
      try {
        await onUpdate(newSettings);
        setSuccessMessage('Notification preferences updated');
        setTimeout(() => setSuccessMessage(null), 3000);
      } finally {
        setIsSaving(false);
      }
    },
    [localSettings, onUpdate]
  );

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Unable to load notification settings</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive updates about your account and orders
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your account activity
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={localSettings.emailNotifications ?? false}
            onCheckedChange={(value) => handleToggle('emailNotifications', value)}
            disabled={isSaving || isLoading}
          />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sms-notifications" className="text-base font-medium cursor-pointer">
              SMS Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive text messages for important updates
            </p>
          </div>
          <Switch
            id="sms-notifications"
            checked={localSettings.smsNotifications ?? false}
            onCheckedChange={(value) => handleToggle('smsNotifications', value)}
            disabled={isSaving || isLoading}
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="marketing-emails" className="text-base font-medium cursor-pointer">
              Marketing Emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive promotional offers and product recommendations
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={localSettings.marketingEmails ?? false}
            onCheckedChange={(value) => handleToggle('marketingEmails', value)}
            disabled={isSaving || isLoading}
          />
        </div>

        {/* Order Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="order-updates" className="text-base font-medium cursor-pointer">
              Order Updates
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about order status changes and shipping updates
            </p>
          </div>
          <Switch
            id="order-updates"
            checked={localSettings.orderUpdates ?? false}
            onCheckedChange={(value) => handleToggle('orderUpdates', value)}
            disabled={isSaving || isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
