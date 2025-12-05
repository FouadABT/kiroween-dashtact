/**
 * usePermission Hook
 * 
 * Simplified hook for checking a single permission.
 * Returns a boolean indicating if the current user has the specified permission.
 * 
 * @example
 * ```tsx
 * const canEditUsers = usePermission('users:write');
 * 
 * return (
 *   <div>
 *     {canEditUsers && <EditUserButton />}
 *   </div>
 * );
 * ```
 */

import { useAuth } from '@/contexts/AuthContext';

/**
 * Check if the current user has a specific permission
 * 
 * @param permission - Permission string to check (e.g., 'users:write')
 * @returns true if user has the permission, false otherwise
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export default usePermission;
