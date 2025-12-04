'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserApi } from '@/lib/api';
import { authConfig } from '@/config/auth.config';
import { Loader2, Mail, AlertCircle } from 'lucide-react';

interface TwoFactorVerificationProps {
  userId: string;
  onSuccess?: (accessToken: string, refreshToken: string) => void;
  onCancel?: () => void;
}

export function TwoFactorVerification({
  userId,
  onSuccess,
  onCancel,
}: TwoFactorVerificationProps) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every((digit) => digit !== '') && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) {
            newCode[i] = digit;
          }
        });
        setCode(newCode);
        
        // Focus last filled input or first empty
        const lastIndex = Math.min(digits.length, 5);
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (newCode.every((digit) => digit !== '')) {
          handleVerify(newCode.join(''));
        }
      });
    }
  };

  const handleVerify = async (codeString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserApi.verifyTwoFactorCode(userId, codeString);
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        const storage = authConfig.storage.useLocalStorage ? localStorage : sessionStorage;
        storage.setItem(authConfig.storage.accessTokenKey, response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      // Call success callback with tokens - LoginForm will handle auth context update
      if (onSuccess) {
        onSuccess(response.accessToken, response.refreshToken);
      } else {
        // If no callback, reload to trigger auth context initialization
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.');
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await UserApi.resendTwoFactorCode(userId);
      setResendCooldown(60);
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to your email. Please enter it below to complete your login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="w-12 h-12 text-center text-2xl font-semibold"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p>Didn't receive the code?</p>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isLoading}
            className="h-auto p-0"
          >
            {resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Code'
            )}
          </Button>
        </div>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
