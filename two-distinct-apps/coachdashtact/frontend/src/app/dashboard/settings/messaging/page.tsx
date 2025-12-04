'use client';

/**
 * Messaging Settings Page
 * Configure messaging system settings (Super Admin only)
 */

import { useState, useEffect } from 'react';
import { Save, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { MessagingApi } from '@/lib/api/messaging';
import { MessagingSettings } from '@/types/messaging';
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers';
import { useRouter } from 'next/navigation';

export default function MessagingSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<MessagingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has permission
  const hasPermission = user?.role?.name === 'Super Admin';

  useEffect(() => {
    if (!hasPermission) {
      router.push('/dashboard/settings');
      return;
    }

    fetchSettings();
  }, [hasPermission, router]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await MessagingApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch messaging settings:', error);
      showErrorToast('Failed to load settings', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const updated = await MessagingApi.updateSettings({
        enabled: settings.enabled,
        maxMessageLength: settings.maxMessageLength,
        messageRetentionDays: settings.messageRetentionDays,
        maxGroupParticipants: settings.maxGroupParticipants,
        allowFileAttachments: settings.allowFileAttachments,
        maxFileSize: settings.maxFileSize,
        allowedFileTypes: settings.allowedFileTypes,
        typingIndicatorTimeout: settings.typingIndicatorTimeout,
      });
      
      setSettings(updated);
      showSuccessToast('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showErrorToast('Failed to save settings', 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasPermission) {
    return null;
  }

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Messaging Settings"
          description="Configure messaging system settings"
          breadcrumbProps={{
            customItems: [
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Settings', href: '/dashboard/settings' },
              { label: 'Messaging', href: '/dashboard/settings/messaging' },
            ],
          }}
        />
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messaging Settings"
        description="Configure messaging system settings"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' },
            { label: 'Messaging', href: '/dashboard/settings/messaging' },
          ],
        }}
        actions={
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure basic messaging system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Messaging System</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to send and receive messages
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          <Separator />

          {/* Max Message Length */}
          <div className="space-y-2">
            <Label htmlFor="maxMessageLength">Maximum Message Length</Label>
            <Input
              id="maxMessageLength"
              type="number"
              min="100"
              max="10000"
              value={settings.maxMessageLength}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxMessageLength: parseInt(e.target.value) || 2000,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of characters per message (100-10000)
            </p>
          </div>

          {/* Message Retention */}
          <div className="space-y-2">
            <Label htmlFor="messageRetentionDays">Message Retention (Days)</Label>
            <Input
              id="messageRetentionDays"
              type="number"
              min="0"
              max="365"
              value={settings.messageRetentionDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  messageRetentionDays: parseInt(e.target.value) || 90,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Number of days to keep messages (0 = forever, max 365)
            </p>
          </div>

          {/* Max Group Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxGroupParticipants">Maximum Group Participants</Label>
            <Input
              id="maxGroupParticipants"
              type="number"
              min="2"
              max="100"
              value={settings.maxGroupParticipants}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxGroupParticipants: parseInt(e.target.value) || 50,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of participants in group conversations (2-100)
            </p>
          </div>

          {/* Typing Indicator Timeout */}
          <div className="space-y-2">
            <Label htmlFor="typingIndicatorTimeout">Typing Indicator Timeout (ms)</Label>
            <Input
              id="typingIndicatorTimeout"
              type="number"
              min="1000"
              max="10000"
              value={settings.typingIndicatorTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  typingIndicatorTimeout: parseInt(e.target.value) || 3000,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              How long to show typing indicator after last keystroke (1000-10000ms)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Attachment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>File Attachments</CardTitle>
          <CardDescription>
            Configure file attachment settings (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allow File Attachments */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowFileAttachments">Allow File Attachments</Label>
              <p className="text-sm text-muted-foreground">
                Enable users to attach files to messages
              </p>
            </div>
            <Switch
              id="allowFileAttachments"
              checked={settings.allowFileAttachments}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowFileAttachments: checked })
              }
              disabled
            />
          </div>

          {settings.allowFileAttachments && (
            <>
              <Separator />

              {/* Max File Size */}
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxFileSize: parseInt(e.target.value) || 10,
                    })
                  }
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Maximum file size in megabytes (1-100MB)
                </p>
              </div>

              {/* Allowed File Types */}
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowedFileTypes: e.target.value.split(',').map(t => t.trim()),
                    })
                  }
                  placeholder="image/jpeg, image/png, application/pdf"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of allowed MIME types
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
