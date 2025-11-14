'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useMetadata } from '@/contexts/MetadataContext';

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Sign Up",
      description: "Create a new account",
      robots: {
        index: false,
        follow: false,
      },
    });
  }, [updateMetadata]);

  useEffect(() => {
    console.log('[SignupPage]', { isLoading, isAuthenticated, hasRedirected: hasRedirectedRef.current });
    
    // If already authenticated and not loading, redirect to dashboard
    if (!isLoading && isAuthenticated && !hasRedirectedRef.current) {
      console.log('[SignupPage] User already authenticated, redirecting to dashboard');
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

  // Don't render signup form if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Get started with your new dashboard account"
      linkText="Already have an account?"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <SignupForm />
    </AuthLayout>
  );
}