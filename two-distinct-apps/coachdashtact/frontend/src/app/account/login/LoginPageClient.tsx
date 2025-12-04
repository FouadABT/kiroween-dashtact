'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { LoginForm } from '@/components/customer-auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function LoginPageClient() {
  const { login } = useCustomerAuth();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store return URL if provided
  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
  }, [searchParams]);

  const handleLogin = async (data: any) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Get session ID from localStorage for cart merging
      const sessionId = localStorage.getItem('cartSessionId');
      await login(data, sessionId || undefined);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <LoginForm
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{' '}
              </span>
              <Link
                href="/account/register"
                className="text-primary hover:underline font-medium"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
