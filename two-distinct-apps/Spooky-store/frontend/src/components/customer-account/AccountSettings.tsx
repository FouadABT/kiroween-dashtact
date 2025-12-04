'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';
import { PasswordSettings } from './PasswordSettings';
import { TwoFactorSettings } from './TwoFactorSettings';
import { toast } from '@/hooks/use-toast';
import type { AccountSettings as AccountSettingsType } from '@/types/account-settings';

interface AccountSettingsProps {
  settings: AccountSettingsType | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdateSettings?: (updates: Partial<AccountSettingsType>) => Promise<void>;
  onChangePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
  onEnable2FA?: () => Promise<{ secret?: string; qrCode?: string }>;
  onDisable2FA?: (code: string) => Promise<void>;
  onVerify2FA?: (code: string) => Promise<void>;
  onDeleteAccount?: (password: string) => Promise<void>;
}

export function AccountSettings({
  settings,
  isLoading = false,
  error = null,
  onUpdateSettings,
  onChangePassword,
  onEnable2FA,
  onDisable2FA,
  onVerify2FA,
  onDeleteAccount,
}: AccountSettingsProps) {
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword || !onDeleteAccount) return;

    setIsDeleting(true);
    try {
      await onDeleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      // Redirect to home page after deletion
      window.location.href = '/';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error && !settings) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="2fa">2FA</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings
          settings={settings}
          isLoading={isLoading}
          error={error}
          onUpdate={onUpdateSettings}
        />
      </TabsContent>

      {/* Password Tab */}
      <TabsContent value="password" className="space-y-4">
        <PasswordSettings
          isLoading={isLoading}
          onChangePassword={onChangePassword}
        />
      </TabsContent>

      {/* 2FA Tab */}
      <TabsContent value="2fa" className="space-y-4">
        <TwoFactorSettings
          isEnabled={settings?.twoFactorEnabled ?? false}
          isLoading={isLoading}
          onEnable={onEnable2FA}
          onDisable={onDisable2FA}
          onVerify={onVerify2FA}
        />
      </TabsContent>

      {/* Danger Zone Tab */}
      <TabsContent value="danger" className="space-y-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. All your data, orders, and settings will be permanently deleted.
              </AlertDescription>
            </Alert>

            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium">
                  Enter your password to confirm account deletion:
                </p>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                />

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
