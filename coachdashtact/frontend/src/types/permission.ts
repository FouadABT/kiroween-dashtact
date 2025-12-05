/**
 * Permission Type Definitions
 * 
 * TypeScript interfaces for permission-related data structures
 * that correspond to the backend Prisma Permission model.
 */

/**
 * Permission interface matching the Prisma Permission model
 */
export interface Permission {
  /** Unique permission identifier */
  id: string;
  /** Permission name in format {resource}:{action} (e.g., users:read, *:*) */
  name: string;
  /** Resource the permission applies to */
  resource: string;
  /** Action allowed on the resource */
  action: string;
  /** Optional description of the permission */
  description?: string | null;
  /** Permission creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Role-permission assignments (populated from relation) */
  rolePermissions?: RolePermission[];
}

/**
 * Permission creation data (excludes auto-generated fields)
 */
export interface CreatePermissionData {
  /** Permission name in format {resource}:{action} */
  name: string;
  /** Resource the permission applies to */
  resource: string;
  /** Action allowed on the resource */
  action: string;
  /** Optional description of the permission */
  description?: string;
}

/**
 * Permission update data (all fields optional except id)
 */
export interface UpdatePermissionData {
  /** Permission ID */
  id: string;
  /** Permission name in format {resource}:{action} */
  name?: string;
  /** Resource the permission applies to */
  resource?: string;
  /** Action allowed on the resource */
  action?: string;
  /** Optional description of the permission */
  description?: string;
}

/**
 * Role-Permission junction table interface
 * Represents the many-to-many relationship between roles and permissions
 */
export interface RolePermission {
  /** Unique identifier for the role-permission assignment */
  id: string;
  /** Role ID */
  roleId: string;
  /** Permission ID */
  permissionId: string;
  /** Permission object (populated from relation) */
  permission: Permission;
  /** Assignment creation timestamp */
  createdAt: string;
}

/**
 * Role-Permission assignment data
 * Used for creating new role-permission assignments
 */
export interface RolePermissionAssignment {
  /** Role ID */
  roleId: string;
  /** Permission ID */
  permissionId: string;
}

/**
 * Permission check response
 */
export interface PermissionCheckResponse {
  /** Whether the user has the permission */
  hasPermission: boolean;
}

/**
 * Permissions list response
 */
export interface PermissionsListResponse {
  permissions: Permission[];
  total: number;
}

/**
 * Permission query parameters for filtering
 */
export interface PermissionQueryParams extends Record<string, unknown> {
  /** Filter by resource */
  resource?: string;
}
