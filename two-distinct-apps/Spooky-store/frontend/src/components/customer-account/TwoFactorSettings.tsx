'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TwoFactorSettingsProps {
  isEnabled?: boolean;
  isLoading?: boolean;
  onEnable?: () => Promise<{ secret?: string; qrCode?: string }>;
  onDisable?: (code: string) => Promise<void>;
  onVerify?: (code: string) => Promise<void>;
}

export function TwoFactorSettings({
  isEnabled = false,
  isLoading = false,
  onEnable,
  onDisable,
  onVerify,
}: TwoFactorSettingsProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<{ secret?: string; qrCode?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    if (!onEnable) return;

    setIsEnabling(true);
    setError(null);
    try {
      const data = await onEnable();
      setSetupData(data);
      toast.info('Scan the QR code with your authenticator app');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable 2FA';
      setError(message);
      toast.error(message);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify = async () => {
    if (!onVerify || !verificationCode) return;

    setIsEnabling(true);
    setError(null);
    try {
      await onVerify(verificationCode);
      setSetupData(null);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      setError(message);
      toast.error(message);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable = async () => {
    if (!onDisable || !verificationCode) return;

    setIsDisabling(true);
    setError(null);
    try {
      await onDisable(verificationCode);
      setVerificationCode('');
      toast.success('Two-factor authentication disabled');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(message);
      toast.error(message);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isEnabled && !setupData && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Two-factor authentication is enabled on your account
            </AlertDescription>
          </Alert>
        )}

        {/* Setup QR Code */}
        {setupData && setupData.qrCode && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </AlertDescription>
            </Alert>

            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                className="h-48 w-48"
              />
            </div>

            {setupData.secret && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Or enter this code manually:
                </p>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                  {setupData.secret}
                </code>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter the 6-digit code from your app</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={isEnabling}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isEnabling}
                className="flex-1"
              >
                {isEnabling ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSetupData(null);
                  setVerificationCode('');
                  setError(null);
                }}
                disabled={isEnabling}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Enable/Disable Controls */}
        {!setupData && (
          <div className="space-y-4">
            {!isEnabled ? (
              <Button
                onClick={handleEnable}
                disabled={isEnabling || isLoading}
                className="w-full"
              >
                {isEnabling ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  To disable two-factor authentication, enter a code from your authenticator app:
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isDisabling}
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={verificationCode.length !== 6 || isDisabling}
                  className="w-full"
                >
                  {isDisabling ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
