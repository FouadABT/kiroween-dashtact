'use client';

/**
 * Email Toggle Component
 * 
 * Component for toggling the email system on/off with:
 * - Current status display
 * - Confirmation dialog
 * - Visual status indicator
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Power, CheckCircle2, XCircle } from 'lucide-react';
import { emailConfigApi } from '@/lib/api/email';
import type { EmailConfiguration } from '@/types/email';
import { toast } from 'sonner';

interface EmailToggleProps {
  configuration: EmailConfiguration;
  onUpdate: (config: EmailConfiguration) => void;
}

export function EmailToggle({ configuration, onUpdate }: EmailToggleProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  // Handle toggle click
  const handleToggleClick = (checked: boolean) => {
    setPendingState(checked);
    setShowConfirmDialog(true);
  };

  // Handle toggle confirmation
  const handleConfirmToggle = async () => {
    if (pendingState === null) return;

    setIsToggling(true);
    setShowConfirmDialog(false);

    try {
      const updatedConfig = await emailConfigApi.toggleSystem({ isEnabled: pendingState });
      onUpdate(updatedConfig);
      toast.success(
        pendingState
          ? 'Email system enabled successfully'
          : 'Email system disabled successfully'
      );
    } catch (error: any) {
      console.error('Failed to toggle email system:', error);
      toast.error(error.message || 'Failed to toggle email system');
    } finally {
      setIsToggling(false);
      setPendingState(null);
    }
  };

  // Handle toggle cancellation
  const handleCancelToggle = () => {
    setShowConfirmDialog(false);
    setPendingState(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                Email System Status
              </CardTitle>
              <CardDescription>
                Enable or disable the email notification system
              </CardDescription>
            </div>
            <Badge
              variant={configuration.isEnabled ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {configuration.isEnabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Disabled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-system-toggle" className="text-base">
                Email System
              </Label>
              <p className="text-sm text-muted-foreground">
                {configuration.isEnabled
                  ? 'Emails are being sent through the configured SMTP server'
                  : 'Email delivery is currently disabled'}
              </p>
            </div>
            <Switch
              id="email-system-toggle"
              checked={configuration.isEnabled}
              onCheckedChange={handleToggleClick}
              disabled={isToggling}
            />
          </div>

          {isToggling && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating email system status...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingState ? 'Enable' : 'Disable'} Email System?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingState ? (
                <>
                  This will enable email delivery through the configured SMTP server.
                  Make sure your SMTP configuration is correct before enabling.
                </>
              ) : (
                <>
                  This will disable all email delivery. Emails will not be sent until
                  you re-enable the system. Queued emails will remain in the queue.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelToggle}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              {pendingState ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
