"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Props for the AccessDenied component
 */
export interface AccessDeniedProps {
  /** Permission that was required but missing */
  permission?: string;
  /** Role that was required but missing */
  role?: string;
  /** Resource that was being accessed */
  resource?: string;
  /** Whether to redirect to the 403 page (default: false, shows inline message) */
  redirect?: boolean;
}

/**
 * AccessDenied Component
 * 
 * Can be used in two ways:
 * 1. Inline: Shows an access denied message within the current page
 * 2. Redirect: Redirects to the dedicated 403 page with context
 * 
 * @example Inline usage
 * ```tsx
 * <AccessDenied permission="users:write" resource="user management" />
 * ```
 * 
 * @example Redirect usage
 * ```tsx
 * <AccessDenied 
 *   permission="users:write" 
 *   resource="user management"
 *   redirect={true}
 * />
 * ```
 */
export function AccessDenied({ 
  permission, 
  role, 
  resource,
  redirect = false 
}: AccessDeniedProps) {
  const router = useRouter();

  useEffect(() => {
    if (redirect) {
      // Build query params for the 403 page
      const params = new URLSearchParams();
      if (permission) params.set('permission', permission);
      if (role) params.set('role', role);
      if (resource) params.set('resource', resource);
      
      const queryString = params.toString();
      const url = queryString ? `/403?${queryString}` : '/403';
      
      router.push(url);
    }
  }, [redirect, permission, role, resource, router]);

  // If redirecting, show nothing (will redirect)
  if (redirect) {
    return null;
  }

  // Otherwise, show inline access denied message
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center p-8 max-w-md">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You don&apos;t have permission to access this {resource || 'content'}.
        </p>
        
        {(permission || role) && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-left">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Required:
            </p>
            {permission && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Permission: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">{permission}</code>
              </p>
            )}
            {role && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Role: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">{role}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to redirect to 403 page with context
 * Can be used in client components or event handlers
 * 
 * @example
 * ```tsx
 * import { redirectToAccessDenied } from '@/components/auth/AccessDenied';
 * 
 * function handleUnauthorizedAction() {
 *   redirectToAccessDenied({
 *     permission: 'users:delete',
 *     resource: 'user account'
 *   });
 * }
 * ```
 */
export function redirectToAccessDenied(context: {
  permission?: string;
  role?: string;
  resource?: string;
}) {
  const params = new URLSearchParams();
  if (context.permission) params.set('permission', context.permission);
  if (context.role) params.set('role', context.role);
  if (context.resource) params.set('resource', context.resource);
  
  const queryString = params.toString();
  const url = queryString ? `/403?${queryString}` : '/403';
  
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}
