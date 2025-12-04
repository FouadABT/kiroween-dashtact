import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of role names (e.g., 'Admin', 'Manager')
 * @example
 * @Roles('Admin')
 * @Roles('Admin', 'Manager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
