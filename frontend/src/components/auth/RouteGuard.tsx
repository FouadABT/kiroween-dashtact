"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Props for the RouteGuard component
 */
export interface RouteGuardProps {
  /** Content to be rendered if authentication check passes */
  children: React.ReactNode;
  /** Whether authentication is required to access the route */
  requireAuth?: boolean;
  /** Optional custom redirect URL */
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Handle protected routes
    if (requireAuth && !isAuthenticated) {
      const destination = redirectTo || `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(destination);
      return;
    }

    // Handle auth routes when already authenticated
    if (!requireAuth && isAuthenticated) {
      const destination = redirectTo || "/dashboard";
      router.push(destination);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, pathname, router]);

  // Show loading state while checking authentication
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

  // Don't render children if authentication check fails
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render auth pages if already authenticated
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}