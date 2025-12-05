'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { UserApi } from '@/lib/api';
import { useMetadata } from '@/contexts/MetadataContext';
import { authConfig } from '@/config/auth.config';
import { CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

/**
 * Password strength calculation
 */
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  progress: number;
} {
  const strength = authConfig.password.calculateStrength(password);
  const label = authConfig.password.getStrengthLabel(strength);
  
  const colorMap: Record<number, string> = {
    0: 'bg-red-500',
    1: 'bg-orange-500',
    2: 'bg-yellow-500',
    3: 'bg-green-500',
    4: 'bg-emerald-500',
  };
  
  return {
    score: strength,
    label,
    color: colorMap[strength] || 'bg-red-500',
    progress: (strength / 4) * 100,
  };
}

/**
 * Reset Password Page Content Component
 * Separated to use useSearchParams hook properly
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateMetadata } = useMetadata();
  
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Set page metadata
  useEffect(() => {
    updateMetadata({
      title: 'Reset Password',
      description: 'Set your new password',
      robots: {
        index: false,
        follow: false,
      },
    });
  }, [updateMetadata]);

  // Extract and validate token on mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setIsValidating(false);
      setIsTokenValid(false);
      setError('No reset token provided. Please request a new password reset.');
      return;
    }

    setToken(tokenParam);

    const validateToken = async () => {
      try {
        const result = await UserApi.validateResetToken(tokenParam);
        setIsTokenValid(result.valid);
        
        if (!result.valid) {
          setError(result.message || 'Invalid or expired reset token. Please request a new password reset.');
        }
      } catch (error) {
        setIsTokenValid(false);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to validate reset token. Please try again.';
        setError(errorMessage);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  // Countdown and redirect after success
  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push('/login');
    }
  }, [isSuccess, redirectCountdown, router]);

  const passwordStrength = calculatePasswordStrength(newPassword);

  const validatePassword = (password: string): boolean => {
    const validation = authConfig.password.validate(password);
    
    if (!validation.isValid) {
      setPasswordError(validation.error || 'Invalid password');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (password: string, confirm: string): boolean => {
    if (!confirm) {
      setConfirmError('Please confirm your password');
      return false;
    }
    
    if (password !== confirm) {
      setConfirmError('Passwords do not match');
      return false;
    }
    
    setConfirmError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('No reset token available');
      return;
    }

    const isPasswordValid = validatePassword(newPassword);
    const isConfirmValid = validateConfirmPassword(newPassword, confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await UserApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    if (passwordError) {
      setPasswordError(null);
    }
    if (error) {
      setError(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmError) {
      setConfirmError(null);
    }
    if (error) {
      setError(null);
    }
  };

  // Show loading while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating reset token...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isTokenValid) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        description="This password reset link is invalid or has expired"
        linkText="Need a new link?"
        linkHref="/forgot-password"
        linkLabel="Request Password Reset"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'This reset link is invalid or has expired. Please request a new password reset.'}
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-3">
          <Link href="/forgot-password">
            <Button variant="default" className="w-full">
              Request New Reset Link
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your new password"
      linkText="Remember your password?"
      linkHref="/login"
      linkLabel="Back to Login"
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="font-semibold mb-2">Password reset successful!</p>
                <p className="text-sm">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <p className="text-sm mt-2">
                  Redirecting to login page in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                </p>
              </AlertDescription>
            </Alert>

            <div className="mt-6">
              <Link href="/login">
                <Button className="w-full">
                  Go to Login Now
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={passwordError ? 'border-destructive pr-10' : 'pr-10'}
                  disabled={isLoading}
                  aria-invalid={passwordError ? 'true' : 'false'}
                  aria-describedby={passwordError ? 'password-error' : 'password-strength'}
                  autoComplete="new-password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {newPassword && (
                <motion.div
                  id="password-strength"
                  className="space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.score >= 3 ? 'text-green-600' : 
                      passwordStrength.score >= 2 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.progress} className="h-2" />
                </motion.div>
              )}
              
              <AnimatePresence mode="wait">
                {passwordError && (
                  <motion.p
                    id="password-error"
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                    aria-live="polite"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <p className="text-xs text-muted-foreground">
                {authConfig.password.requirementsMessage}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={confirmError ? 'border-destructive pr-10' : 'pr-10'}
                  disabled={isLoading}
                  aria-invalid={confirmError ? 'true' : 'false'}
                  aria-describedby={confirmError ? 'confirm-error' : undefined}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {confirmError && (
                  <motion.p
                    id="confirm-error"
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                    aria-live="polite"
                  >
                    {confirmError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Resetting Password...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Reset Password
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

/**
 * Reset Password Page
 * 
 * Allows users to set a new password using a reset token from email.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.2, 9.3, 9.4
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
