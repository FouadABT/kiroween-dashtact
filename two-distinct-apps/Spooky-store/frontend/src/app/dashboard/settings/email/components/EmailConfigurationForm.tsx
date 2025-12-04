'use client';

/**
 * Email Configuration Form Component
 * 
 * Form for configuring SMTP settings including:
 * - SMTP host, port, and security
 * - Authentication credentials
 * - Sender information
 * - Form validation and password masking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Eye, EyeOff, Send, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { emailConfigApi } from '@/lib/api/email';
import type { EmailConfiguration, EmailConfigurationDto } from '@/types/email';
import { toast } from 'sonner';

interface EmailConfigurationFormProps {
  configuration: EmailConfiguration | null;
  onUpdate: (config: EmailConfiguration) => void;
}

export function EmailConfigurationForm({ configuration, onUpdate }: EmailConfigurationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<EmailConfigurationDto>({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailConfigurationDto, string>>>({});
  
  // Test email dialog state
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  // Initialize form with existing configuration
  useEffect(() => {
    if (configuration) {
      setFormData({
        smtpHost: configuration.smtpHost,
        smtpPort: configuration.smtpPort,
        smtpSecure: configuration.smtpSecure,
        smtpUsername: configuration.smtpUsername,
        smtpPassword: '', // Don't populate password for security
        senderEmail: configuration.senderEmail,
        senderName: configuration.senderName,
      });
    }
  }, [configuration]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmailConfigurationDto, string>> = {};

    if (!formData.smtpHost.trim()) {
      newErrors.smtpHost = 'SMTP host is required';
    }

    if (!formData.smtpPort || formData.smtpPort < 1 || formData.smtpPort > 65535) {
      newErrors.smtpPort = 'Valid port number is required (1-65535)';
    }

    if (!formData.smtpUsername.trim()) {
      newErrors.smtpUsername = 'SMTP username is required';
    }

    // Password is optional (some providers like Brevo use empty password)

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Sender email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Valid email address is required';
    }

    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Sender name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data - handle optional password
      const dataToSend: any = {
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        smtpSecure: formData.smtpSecure,
        smtpUsername: formData.smtpUsername,
        senderEmail: formData.senderEmail,
        senderName: formData.senderName,
      };

      // Only include password if it's provided
      if (formData.smtpPassword !== undefined && formData.smtpPassword !== '') {
        dataToSend.smtpPassword = formData.smtpPassword;
      } else if (!configuration) {
        // For new configuration, explicitly set empty password
        dataToSend.smtpPassword = '';
      }
      // For updates with empty password, don't include it (keeps existing)

      const updatedConfig = await emailConfigApi.saveConfiguration(dataToSend);
      onUpdate(updatedConfig);
      toast.success('Email configuration saved successfully');
      
      // Clear password field after successful save
      setFormData(prev => ({ ...prev, smtpPassword: '' }));
      setShowPassword(false);
    } catch (error: any) {
      console.error('Failed to save email configuration:', error);
      toast.error(error.message || 'Failed to save email configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof EmailConfigurationDto, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Configuration</CardTitle>
        <CardDescription>
          Configure your SMTP server settings for sending emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SMTP Host */}
          <div className="space-y-2">
            <Label htmlFor="smtpHost">
              SMTP Host <span className="text-destructive">*</span>
            </Label>
            <Input
              id="smtpHost"
              type="text"
              placeholder="smtp.example.com"
              value={formData.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              className={errors.smtpHost ? 'border-destructive' : ''}
            />
            {errors.smtpHost && (
              <p className="text-sm text-destructive">{errors.smtpHost}</p>
            )}
          </div>

          {/* SMTP Port and Secure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpPort">
                SMTP Port <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtpPort"
                type="number"
                min="1"
                max="65535"
                placeholder="587"
                value={formData.smtpPort}
                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 587)}
                className={errors.smtpPort ? 'border-destructive' : ''}
              />
              {errors.smtpPort && (
                <p className="text-sm text-destructive">{errors.smtpPort}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpSecure" className="block">
                Use TLS/SSL
              </Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  id="smtpSecure"
                  checked={formData.smtpSecure}
                  onCheckedChange={(checked) => handleChange('smtpSecure', checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.smtpSecure ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* SMTP Username */}
          <div className="space-y-2">
            <Label htmlFor="smtpUsername">
              SMTP Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="smtpUsername"
              type="text"
              placeholder="username@example.com"
              value={formData.smtpUsername}
              onChange={(e) => handleChange('smtpUsername', e.target.value)}
              className={errors.smtpUsername ? 'border-destructive' : ''}
            />
            {errors.smtpUsername && (
              <p className="text-sm text-destructive">{errors.smtpUsername}</p>
            )}
          </div>

          {/* SMTP Password */}
          <div className="space-y-2">
            <Label htmlFor="smtpPassword">
              SMTP Password <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="smtpPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave empty if not required (e.g., Brevo)"
                value={formData.smtpPassword}
                onChange={(e) => handleChange('smtpPassword', e.target.value)}
                className={errors.smtpPassword ? 'border-destructive pr-20' : 'pr-20'}
              />
              <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-1">
                {formData.smtpPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => handleChange('smtpPassword', '')}
                    title="Clear password"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {errors.smtpPassword && (
              <p className="text-sm text-destructive">{errors.smtpPassword}</p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Some providers like Brevo use the full SMTP key as username with empty password.</p>
              {configuration && (
                <p className="text-amber-600 dark:text-amber-400">
                  Leave empty to keep current password, or enter new password to update.
                </p>
              )}
            </div>
          </div>

          {/* Sender Email */}
          <div className="space-y-2">
            <Label htmlFor="senderEmail">
              Sender Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="noreply@example.com"
              value={formData.senderEmail}
              onChange={(e) => handleChange('senderEmail', e.target.value)}
              className={errors.senderEmail ? 'border-destructive' : ''}
            />
            {errors.senderEmail && (
              <p className="text-sm text-destructive">{errors.senderEmail}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This email address will appear as the sender of all outgoing emails
            </p>
          </div>

          {/* Sender Name */}
          <div className="space-y-2">
            <Label htmlFor="senderName">
              Sender Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="senderName"
              type="text"
              placeholder="My Application"
              value={formData.senderName}
              onChange={(e) => handleChange('senderName', e.target.value)}
              className={errors.senderName ? 'border-destructive' : ''}
            />
            {errors.senderName && (
              <p className="text-sm text-destructive">{errors.senderName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This name will appear as the sender of all outgoing emails
            </p>
          </div>

          {/* Submit and Test Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTestDialog(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Test Email
            </Button>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      {/* Test Email Dialog - Always available */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify your SMTP configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Configuration Warning */}
            {(!configuration || !configuration.smtpHost) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No email configuration found. Please save your SMTP settings first.
                </AlertDescription>
              </Alert>
            )}

            {/* Info: Test emails work even when system is disabled */}
            {configuration && configuration.smtpHost && !configuration.isEnabled && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  Note: Email system is currently disabled for regular emails, but you can still send test emails to verify your configuration.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="test-recipient">
                Recipient Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-recipient"
                type="email"
                placeholder="recipient@example.com"
                value={testRecipient}
                onChange={(e) => {
                  setTestRecipient(e.target.value);
                  setTestError(null);
                }}
                disabled={isSendingTest || testSuccess || !configuration || !configuration.smtpHost}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-message">Message (Optional)</Label>
              <Input
                id="test-message"
                placeholder="Add a custom message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={isSendingTest || testSuccess || !configuration || !configuration.smtpHost}
              />
            </div>

              {testError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{testError}</AlertDescription>
                </Alert>
              )}

              {testSuccess && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Test email sent successfully! Check {testRecipient}
                  </AlertDescription>
                </Alert>
              )}

            {configuration && configuration.smtpHost && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Current Configuration:</p>
                <p className="text-muted-foreground">
                  From: {configuration.senderName} &lt;{configuration.senderEmail}&gt;
                </p>
                <p className="text-muted-foreground">
                  SMTP: {configuration.smtpHost}:{configuration.smtpPort}
                </p>
              </div>
            )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTestDialog(false);
                  setTimeout(() => {
                    setTestRecipient('');
                    setTestMessage('');
                    setTestError(null);
                    setTestSuccess(false);
                  }, 300);
                }}
                disabled={isSendingTest}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!testRecipient.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient)) {
                    setTestError('Please enter a valid email address');
                    return;
                  }
                  
                  setIsSendingTest(true);
                  setTestError(null);
                  setTestSuccess(false);
                  
                  try {
                    await emailConfigApi.sendTestEmail({
                      recipient: testRecipient.trim(),
                      message: testMessage.trim() || undefined,
                    });
                    
                    setTestSuccess(true);
                    toast.success('Test email sent successfully');
                    
                    setTimeout(() => {
                      setShowTestDialog(false);
                      setTimeout(() => {
                        setTestRecipient('');
                        setTestMessage('');
                        setTestSuccess(false);
                      }, 300);
                    }, 2000);
                  } catch (error: any) {
                    setTestError(error.message || 'Failed to send test email');
                    toast.error(error.message || 'Failed to send test email');
                  } finally {
                    setIsSendingTest(false);
                  }
                }}
                disabled={isSendingTest || testSuccess || !testRecipient.trim() || !configuration || !configuration.smtpHost}
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : testSuccess ? (
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
    </Card>
  );
}
