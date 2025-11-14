"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authConfig } from "@/config/auth.config";

/**
 * Props for the AuthGuard component
 */
export interface AuthGuardProps {
  /** Content to be rendered if authentication check passes */
  children: ReactNode;
  /** Optional fallback component to show while loading */
  fallback?: ReactNode;
  /** Optional custom redirect URL for unauthenticated users */
  redirectTo?: string;
}

/**
 * AuthGuard Component
 * 
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to login page.
 * Stores intended destination for post-login redirect.
 * 
 * @example
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 * 
 * @example With custom redirect
 * ```tsx
 * <AuthGuard redirectTo="/custom-login">
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ 
  children, 
  fallback,
  redirectTo 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // Store intended destination for post-login redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      
      // Use custom redirect or default from config
      const loginUrl = redirectTo || authConfig.redirects.unauthorized;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, redirectTo, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
