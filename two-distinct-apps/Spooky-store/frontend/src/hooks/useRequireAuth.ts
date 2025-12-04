/**
 * useRequireAuth Hook
 * 
 * Hook that redirects to login if the user is not authenticated.
 * Use this in pages that require authentication.
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { isLoading } = useRequireAuth();
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   return <div>Protected Content</div>;
 * }
 * ```
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authConfig } from '@/config/auth.config';

/**
 * Hook return type
 */
interface UseRequireAuthReturn {
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Require authentication for the current page
 * Redirects to login if not authenticated
 * 
 * @param redirectTo - Path to redirect to if not authenticated (default: from config)
 * @returns Object with isLoading and isAuthenticated flags
 */
export function useRequireAuth(
  redirectTo: string = authConfig.redirects.unauthorized
): UseRequireAuthReturn {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination for post-login redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      
      // Redirect to login
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router, pathname]);

  return {
    isLoading,
    isAuthenticated,
  };
}

export default useRequireAuth;
