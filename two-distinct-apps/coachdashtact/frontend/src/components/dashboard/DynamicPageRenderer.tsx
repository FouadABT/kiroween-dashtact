"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardGrid } from './DashboardGrid';
import { useAuth } from '@/contexts/AuthContext';
import { PageType, PageConfig } from '@/types/menu';
import { ApiClient, ApiError } from '@/lib/api';

/**
 * DynamicPageRenderer Props
 */
export interface DynamicPageRendererProps {
  /** Optional route override (defaults to current pathname) */
  route?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DynamicPageRenderer Component
 * 
 * Dynamically renders pages based on menu configuration from the database.
 * Supports multiple page types:
 * - WIDGET_BASED: Renders DashboardGrid with customizable widgets
 * - HARDCODED: Renders traditional React component from componentPath
 * - CUSTOM: Hybrid rendering with special logic
 * - EXTERNAL: Opens external URL (handled by navigation)
 * 
 * Enforces permission checks before rendering and shows appropriate
 * loading and error states.
 * 
 * @example
 * ```tsx
 * <DynamicPageRenderer />
 * ```
 */
export function DynamicPageRenderer({
  route,
  className = '',
}: DynamicPageRendererProps) {
  const pathname = usePathname();
  const { user, hasPermission, hasRole } = useAuth();
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [HardcodedComponent, setHardcodedComponent] = useState<React.ComponentType | null>(null);

  const currentRoute = route || pathname;

  // Fetch menu configuration for current route
  useEffect(() => {
    const fetchPageConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch menu config for the current route using the MenuApi
        const config = await ApiClient.get<PageConfig>('/dashboard-menus/route', { route: currentRoute });
        
        setPageConfig(config);
      } catch (err) {
        console.error('Failed to fetch page config:', err);
        
        if (err instanceof ApiError) {
          if (err.statusCode === 404) {
            setError('Page not found');
          } else if (err.statusCode === 403) {
            setError('You do not have permission to access this page');
          } else {
            setError(err.message || 'Failed to load page configuration');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageConfig();
  }, [currentRoute]);

  // Load hardcoded component dynamically if needed
  useEffect(() => {
    if (!pageConfig || pageConfig.pageType !== PageType.HARDCODED) {
      setHardcodedComponent(null);
      return;
    }

    const loadComponent = async () => {
      try {
        if (!pageConfig.componentPath) {
          throw new Error('Component path is required for HARDCODED page type');
        }

        // Dynamically import the component
        const module = await import(`@/${pageConfig.componentPath}`);
        setHardcodedComponent(() => module.default || module);
      } catch (err) {
        console.error('Failed to load component:', err);
        setError(`Failed to load page component: ${pageConfig.componentPath}`);
      }
    };

    loadComponent();
  }, [pageConfig]);

  // Check permissions
  const hasRequiredPermissions = React.useMemo(() => {
    if (!pageConfig || !user) return false;

    // Check role requirements
    if (pageConfig.requiredRoles && pageConfig.requiredRoles.length > 0) {
      const hasRequiredRole = pageConfig.requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) return false;
    }

    // Check permission requirements
    if (pageConfig.requiredPermissions && pageConfig.requiredPermissions.length > 0) {
      const hasRequiredPermission = pageConfig.requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      if (!hasRequiredPermission) return false;
    }

    return true;
  }, [pageConfig, user, hasRole, hasPermission]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div className="text-center" role="status" aria-live="polite">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading page...</p>
          <span className="sr-only">Loading page content</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div 
          className="max-w-md rounded-lg border border-destructive bg-destructive/10 p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/20 p-3">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            {error === 'Page not found' ? 'Page Not Found' : 'Access Denied'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // No config found
  if (!pageConfig) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div className="text-center" role="status">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Page Not Configured
          </h3>
          <p className="text-sm text-muted-foreground">
            This page has not been configured in the menu system
          </p>
        </div>
      </div>
    );
  }

  // Permission check
  if (!hasRequiredPermissions) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div 
          className="max-w-md rounded-lg border border-destructive bg-destructive/10 p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/20 p-3">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            Access Denied
          </h3>
          <p className="text-sm text-muted-foreground">
            You do not have the required permissions to access this page
          </p>
        </div>
      </div>
    );
  }

  // Render based on page type
  switch (pageConfig.pageType) {
    case PageType.WIDGET_BASED:
      if (!pageConfig.pageIdentifier) {
        return (
          <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
            <div className="text-center text-destructive" role="alert">
              <p>Invalid configuration: pageIdentifier is required for WIDGET_BASED pages</p>
            </div>
          </div>
        );
      }
      return (
        <div className={className}>
          <DashboardGrid pageId={pageConfig.pageIdentifier} />
        </div>
      );

    case PageType.HARDCODED:
      if (!HardcodedComponent) {
        return (
          <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
            <div className="text-center" role="status" aria-live="polite">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
              <p className="text-sm text-muted-foreground">Loading component...</p>
            </div>
          </div>
        );
      }
      return (
        <div className={className}>
          <HardcodedComponent />
        </div>
      );

    case PageType.CUSTOM:
      // Custom page type with hybrid logic
      // This can be extended based on specific requirements
      return (
        <div className={className}>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Custom Page</h3>
            <p className="text-sm text-muted-foreground">
              Custom page rendering logic can be implemented here
            </p>
          </div>
        </div>
      );

    case PageType.EXTERNAL:
      // External links should be handled by navigation, not rendered here
      return (
        <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
          <div className="text-center" role="status">
            <p className="text-sm text-muted-foreground">
              Redirecting to external page...
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
          <div className="text-center text-destructive" role="alert">
            <p>Unknown page type: {pageConfig.pageType}</p>
          </div>
        </div>
      );
  }
}

/**
 * Memoized DynamicPageRenderer for performance optimization
 */
export const MemoizedDynamicPageRenderer = React.memo(DynamicPageRenderer);
