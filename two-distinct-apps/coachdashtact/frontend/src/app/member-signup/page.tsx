'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { MemberSignupForm } from '@/components/auth/MemberSignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useMetadata } from '@/contexts/MetadataContext';

/**
 * Member Signup Page
 * 
 * Provides member-specific registration with coach selection.
 * 
 * Requirements: 6.1-6.7
 */
export default function MemberSignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Join as Member",
      description: "Sign up to start your coaching journey",
      robots: {
        index: false,
        follow: false,
      },
    });
  }, [updateMetadata]);

  useEffect(() => {
    console.log('[MemberSignupPage]', { isLoading, isAuthenticated, hasRedirected: hasRedirectedRef.current });
    
    // If already authenticated and not loading, redirect to member dashboard
    if (!isLoading && isAuthenticated && !hasRedirectedRef.current) {
      console.log('[MemberSignupPage] User already authenticated, redirecting to member dashboard');
      hasRedirectedRef.current = true;
      router.push('/member');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
      title="Join as a Member"
      description="Start your coaching journey today"
      linkText="Already have an account?"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <MemberSignupForm />
    </AuthLayout>
  );
}
