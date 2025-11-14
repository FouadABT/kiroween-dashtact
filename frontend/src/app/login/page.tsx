'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useMetadata } from '@/contexts/MetadataContext';

/**
 * Login Page
 * 
 * Provides user login functionality with:
 * - Form submission handling
 * - Auth context login method integration
 * - Redirect to dashboard or intended page on success
 * - Error message display on failure
 * 
 * Requirements: 2.1, 2.5, 6.2
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Login",
      description: "Sign in to your account",
      robots: {
        index: false,
        follow: false,
      },
    });
  }, [updateMetadata]);

  useEffect(() => {
    console.log('[LoginPage]', { isLoading, isAuthenticated, hasRedirected: hasRedirectedRef.current });
    
    // If already authenticated and not loading, redirect to dashboard
    if (!isLoading && isAuthenticated && !hasRedirectedRef.current) {
      console.log('[LoginPage] User already authenticated, redirecting to dashboard');
      hasRedirectedRef.current = true;
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
    >
      <LoginForm />
    </AuthLayout>
  );
}