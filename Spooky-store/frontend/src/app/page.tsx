"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { featuresConfig, getRootRedirectUrl } from "@/config/features.config";
import { LandingPage } from "@/components/landing/LandingPage";

/**
 * Root Page Component
 * 
 * Behavior depends on landing page feature flag:
 * - Landing enabled: Shows landing page
 * - Landing disabled: Redirects to /dashboard (authenticated) or /login (unauthenticated)
 * 
 * This component works in conjunction with middleware.ts for server-side redirects.
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once loading is complete
    if (!isLoading) {
      // Check if landing page is enabled
      if (!featuresConfig.landingPage.enabled) {
        // Landing page disabled - redirect based on authentication
        const redirectUrl = getRootRedirectUrl(isAuthenticated);
        router.replace(redirectUrl);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // If landing page is enabled, show landing page
  if (featuresConfig.landingPage.enabled && !isLoading) {
    return <LandingPage />;
  }

  // Show loading state while checking authentication or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
