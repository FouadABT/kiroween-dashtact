import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Array of permission strings (e.g., 'users:read', 'users:write')
 * @example
 * @Permissions('users:read')
 * @Permissions('users:write', 'users:delete')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
