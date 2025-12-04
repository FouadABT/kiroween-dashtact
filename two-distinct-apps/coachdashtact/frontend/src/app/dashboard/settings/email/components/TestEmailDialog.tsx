'use client';

/**
 * Test Email Dialog Component
 * 
 * Dialog for sending test emails with:
 * - Recipient input
 * - Optional message field
 * - Loading state
 * - Success/error display
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { emailConfigApi } from '@/lib/api/email';
import type { EmailConfiguration } from '@/types/email';
import { toast } from 'sonner';

interface TestEmailDialogProps {
  configuration: EmailConfiguration;
}

export function TestEmailDialog({ configuration }: TestEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      smtpConnected: boolean;
      authSuccess: boolean;
      emailSent: boolean;
      timeTaken?: number;
    };
  } | null>(null);

  // Validate email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle send test email
  const handleSendTest = async () => {
    // Validate recipient
    if (!recipient.trim()) {
      setError('Recipient email is required');
      return;
    }

    if (!isValidEmail(recipient)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);
    setTestResult(null);

    const startTime = Date.now();

    try {
      const result = await emailConfigApi.sendTestEmail({
        recipient: recipient.trim(),
        message: message.trim() || undefined,
      });

      const timeTaken = Date.now() - startTime;

      setSuccess(true);
      setTestResult({
        success: true,
        message: 'Test email sent successfully',
        details: {
          smtpConnected: true,
          authSuccess: true,
          emailSent: true,
          timeTaken,
        },
      });
      toast.success('Test email sent successfully');

      // Close dialog after 3 seconds to show results
      setTimeout(() => {
        setIsOpen(false);
        // Reset form
        setTimeout(() => {
          setRecipient('');
          setMessage('');
          setSuccess(false);
          setTestResult(null);
        }, 300);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      const errorMessage = error.message || 'Failed to send test email';
      setError(errorMessage);
      setTestResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Handle dialog open change
  const handleOpenChange = (open: boolean) => {
    if (!open && !isSending) {
      setIsOpen(false);
      // Reset form after closing animation
      setTimeout(() => {
        setRecipient('');
        setMessage('');
        setError(null);
        setSuccess(false);
        setTestResult(null);
      }, 300);
    } else {
      setIsOpen(open);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test Email
        </CardTitle>
        <CardDescription>
          Send a test email to verify your SMTP configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!configuration.isEnabled}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Send a test email to verify your SMTP configuration is working correctly
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Recipient Input */}
              <div className="space-y-2">
                <Label htmlFor="recipient">
                  Recipient Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setError(null);
                  }}
                  disabled={isSending || success}
                />
              </div>

              {/* Optional Message */}
              <div className="space-y-2">
                <Label htmlFor="message">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Add a custom message to the test email..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending || success}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included in the test email body
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert with Details */}
              {success && testResult && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    <div className="space-y-2">
                      <p className="font-medium">Test email sent successfully!</p>
                      {testResult.details && (
                        <div className="text-xs space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>SMTP Connection: Successful</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Authentication: Successful</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Email Sent: Successful</span>
                          </div>
                          {testResult.details.timeTaken && (
                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-green-200 dark:border-green-800">
                              <span>Time taken: {(testResult.details.timeTaken / 1000).toFixed(2)}s</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs mt-2">Check your inbox at {recipient}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Configuration Info */}
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Current Configuration:</p>
                <p className="text-muted-foreground">
                  From: {configuration.senderName} &lt;{configuration.senderEmail}&gt;
                </p>
                <p className="text-muted-foreground">
                  SMTP: {configuration.smtpHost}:{configuration.smtpPort}
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendTest}
                disabled={isSending || success || !recipient.trim()}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!configuration.isEnabled && (
          <p className="text-sm text-muted-foreground mt-2">
            Enable the email system to send test emails
          </p>
        )}
      </CardContent>
    </Card>
  );
}
