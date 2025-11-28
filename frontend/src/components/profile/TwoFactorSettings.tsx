/**
 * Two-Factor Authentication Settings Component
 * 
 * Allows users to enable/disable 2FA from their profile page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Mail, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { ProfileApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface TwoFactorSettingsProps {
  initialEnabled: boolean;
}

export function TwoFactorSettings({ initialEnabled }: TwoFactorSettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  // Update when prop changes
  useEffect(() => {
    setTwoFactorEnabled(initialEnabled);
  }, [initialEnabled]);

  const handleToggle = (checked: boolean) => {
    setPendingState(checked);
    setShowConfirmDialog(true);
  };

  const confirmToggle = async () => {
    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      if (pendingState) {
        await ProfileApi.enableTwoFactor();
        toast.success('Two-Factor Authentication enabled successfully');
      } else {
        await ProfileApi.disableTwoFactor();
        toast.success('Two-Factor Authentication disabled successfully');
      }
      
      setTwoFactorEnabled(pendingState);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with email verification codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="two-factor-toggle" className="text-base font-medium cursor-pointer">
                  Email Verification Codes
                </Label>
                {twoFactorEnabled && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled
                  ? 'Verification codes will be sent to your email when you log in'
                  : 'Enable to receive verification codes via email when logging in'}
              </p>
            </div>
            <Switch
              id="two-factor-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          </div>

          {/* Info Alert */}
          {twoFactorEnabled ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                When logging in, you'll receive a 6-digit code via email. This code expires after 10 minutes.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security by requiring a verification code sent to your email during login.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingState ? 'Enable' : 'Disable'} Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingState ? (
                <>
                  When enabled, you'll need to enter a verification code sent to your email each time you log in.
                  This adds an extra layer of security to your account.
                </>
              ) : (
                <>
                  Disabling two-factor authentication will make your account less secure.
                  You can re-enable it at any time.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pendingState ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function TwoFactorSettingsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
