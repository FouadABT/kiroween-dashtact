'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, TwoFactorRequiredResponse } from '@/types/auth';
import { authConfig } from '@/config/auth.config';
import { UserApi } from '@/lib/api';
import { TwoFactorVerification } from './TwoFactorVerification';

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Props for the LoginForm component
 */
export interface LoginFormProps {
  /** Optional callback function called on successful login */
  onSuccess?: () => void;
  /** Optional callback function called on login error */
  onError?: (error: string) => void;
  /** Optional redirect URL after successful login */
  redirectTo?: string;
}

/**
 * Login Form Component
 * 
 * Provides a complete login form with:
 * - Email and password inputs with validation
 * - "Remember me" checkbox
 * - Submit button with loading state
 * - Error message display
 * - Link to registration page
 * - Link to password reset (placeholder)
 * 
 * Requirements: 2.1, 2.4
 */
export function LoginForm(props?: LoginFormProps) {
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState<TwoFactorRequiredResponse | null>(null);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Use auth context login method - it handles the API call
      // This makes only ONE API call to avoid duplicate logs
      const response = await login(formData);
      
      // Check if 2FA is required
      if (response && 'requiresTwoFactor' in response && response.requiresTwoFactor) {
        setTwoFactorRequired(response as unknown as TwoFactorRequiredResponse);
        return;
      }
      
      // Call success callback if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      // Redirect to the intended page or dashboard
      const redirectTo = props?.redirectTo || 
                        searchParams.get('redirect') || 
                        authConfig.redirects.afterLogin;
      router.push(redirectTo);
      
    } catch (error) {
      console.error('[LoginForm] Login error:', error);
      
      // Extract error message with better handling
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Show user-friendly error message
      setErrors({ general: errorMessage });
      
      // Call error callback if provided
      if (props?.onError) {
        props.onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSuccess = async (accessToken: string, refreshToken: string) => {
    // Tokens are already stored by TwoFactorVerification component
    // Reload the page to trigger AuthContext initialization with new tokens
    const redirectTo = props?.redirectTo || 
                      searchParams.get('redirect') || 
                      authConfig.redirects.afterLogin;
    window.location.href = redirectTo;
  };

  const handleTwoFactorCancel = () => {
    setTwoFactorRequired(null);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Show 2FA verification if required
  if (twoFactorRequired) {
    return (
      <TwoFactorVerification
        userId={twoFactorRequired.userId}
        onSuccess={handleTwoFactorSuccess}
        onCancel={handleTwoFactorCancel}
      />
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        {errors.general && (
          <motion.div 
            className="p-4 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
          >
            <svg 
              className="w-5 h-5 flex-shrink-0 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Login Failed</p>
              <p className="mt-1 text-sm opacity-90">{errors.general}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`transition-all duration-200 ${errors.email ? 'border-red-500 shake' : 'focus:scale-[1.02]'}`}
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          autoComplete="email"
          required
        />
        <AnimatePresence mode="wait">
          {errors.email && (
            <motion.p 
              id="email-error"
              className="text-sm text-red-600"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              role="alert"
              aria-live="polite"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`transition-all duration-200 ${errors.password ? 'border-red-500 shake' : 'focus:scale-[1.02]'}`}
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          autoComplete="current-password"
          required
        />
        <AnimatePresence mode="wait">
          {errors.password && (
            <motion.p 
              id="password-error"
              className="text-sm text-red-600"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              role="alert"
              aria-live="polite"
            >
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {authConfig.features.rememberMe && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => 
                handleInputChange('rememberMe', checked as boolean)
              }
              disabled={isLoading}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
        )}
        {authConfig.features.passwordReset && (
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
          >
            Forgot password?
          </Link>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button 
          type="submit" 
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
          disabled={isLoading || authLoading}
        >
          <AnimatePresence mode="wait">
            {(isLoading || authLoading) ? (
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
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Signing in...</span>
              </motion.div>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Sign in
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Social Login Placeholders - Only show if social auth is enabled */}
      {authConfig.features.socialAuth && (
        <>
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button 
              variant="outline" 
              type="button" 
              disabled={isLoading}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Sign in with Google"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              disabled={isLoading}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Sign in with GitHub"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </Button>
          </motion.div>
        </>
      )}
    </motion.form>
  );
}