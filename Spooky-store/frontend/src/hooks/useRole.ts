/**
 * useRole Hook
 * 
 * Hook for checking if the current user has a specific role.
 * Returns a boolean indicating if the user has the specified role(s).
 * 
 * @example
 * ```tsx
 * const isAdmin = useRole('Admin');
 * 
 * return (
 *   <div>
 *     {isAdmin && <AdminPanel />}
 *   </div>
 * );
 * 
 * // Check for multiple roles (any)
 * const isAdminOrManager = useRole(['Admin', 'Manager']);
 * ```
 */

import { useAuth } from '@/contexts/AuthContext';

/**
 * Check if the current user has a specific role
 * 
 * @param role - Role name or array of role names to check
 * @returns true if user has the role (or any of the roles if array), false otherwise
 */
export function useRole(role: string | string[]): boolean {
  const { hasRole, user } = useAuth();
  
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.some(r => hasRole(r));
  }
  
  return hasRole(role);
}

export default useRole;
