/**
 * Authentication Seed Data
 *
 * This file defines default roles and permissions for the authentication system.
 *
 * Permission Naming Convention:
 * Format: {resource}:{action}
 *
 * Resources: users, roles, permissions, settings, profile, etc.
 * Actions: read, write, delete, admin, *
 *
 * Special Permissions:
 * - *:* - Super admin (all permissions)
 * - {resource}:* - All actions on a specific resource
 * - profile:write - Edit own profile (special case)
 */

export interface PermissionDefinition {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

/**
 * Default permissions for the system
 * These will be created during database seeding
 */
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  // Super Admin Permission
  {
    name: '*:*',
    resource: '*',
    action: '*',
    description: 'All permissions (Super Admin)',
  },

  // User Management Permissions
  {
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'View users and user list',
  },
  {
    name: 'users:write',
    resource: 'users',
    action: 'write',
    description: 'Create and edit users',
  },
  {
    name: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
  },
  {
    name: 'users:*',
    resource: 'users',
    action: '*',
    description: 'All user management operations',
  },

  // Role Management Permissions
  {
    name: 'roles:read',
    resource: 'roles',
    action: 'read',
    description: 'View roles and role list',
  },
  {
    name: 'roles:write',
    resource: 'roles',
    action: 'write',
    description: 'Create and edit roles',
  },
  {
    name: 'roles:delete',
    resource: 'roles',
    action: 'delete',
    description: 'Delete roles',
  },
  {
    name: 'roles:*',
    resource: 'roles',
    action: '*',
    description: 'All role management operations',
  },

  // Permission Management Permissions
  {
    name: 'permissions:read',
    resource: 'permissions',
    action: 'read',
    description: 'View permissions and permission list',
  },
  {
    name: 'permissions:write',
    resource: 'permissions',
    action: 'write',
    description: 'Assign and manage permissions',
  },
  {
    name: 'permissions:*',
    resource: 'permissions',
    action: '*',
    description: 'All permission management operations',
  },

  // Settings Permissions
  {
    name: 'settings:read',
    resource: 'settings',
    action: 'read',
    description: 'View application settings',
  },
  {
    name: 'settings:write',
    resource: 'settings',
    action: 'write',
    description: 'Modify application settings',
  },
  {
    name: 'settings:admin',
    resource: 'settings',
    action: 'admin',
    description: 'Full administrative access to settings',
  },
  {
    name: 'settings:*',
    resource: 'settings',
    action: '*',
    description: 'All settings operations',
  },

  // Profile Permissions
  {
    name: 'profile:write',
    resource: 'profile',
    action: 'write',
    description: 'Edit own profile',
  },
  {
    name: 'profile:read',
    resource: 'profile',
    action: 'read',
    description: 'View own profile',
  },

  // File Upload Permissions
  {
    name: 'files:write',
    resource: 'files',
    action: 'write',
    description: 'Upload files (images and documents)',
  },
  {
    name: 'files:read',
    resource: 'files',
    action: 'read',
    description: 'View and download files',
  },
  {
    name: 'files:delete',
    resource: 'files',
    action: 'delete',
    description: 'Delete uploaded files',
  },
  {
    name: 'files:*',
    resource: 'files',
    action: '*',
    description: 'All file management operations',
  },

  // Widget Gallery Permissions
  {
    name: 'widgets:admin',
    resource: 'widgets',
    action: 'admin',
    description: 'Access widget gallery and view all available widgets',
  },

  // Notification Permissions
  {
    name: 'notifications:read',
    resource: 'notifications',
    action: 'read',
    description: 'View and manage own notifications',
  },
  {
    name: 'notifications:write',
    resource: 'notifications',
    action: 'write',
    description: 'Create notifications (admin only)',
  },
  {
    name: 'notifications:delete',
    resource: 'notifications',
    action: 'delete',
    description: 'Delete any notification (admin only)',
  },
  {
    name: 'notifications:*',
    resource: 'notifications',
    action: '*',
    description: 'All notification operations',
  },

  // Blog Permissions
  {
    name: 'blog:read',
    resource: 'blog',
    action: 'read',
    description: 'View blog posts in dashboard',
  },
  {
    name: 'blog:write',
    resource: 'blog',
    action: 'write',
    description: 'Create and edit blog posts',
  },
  {
    name: 'blog:delete',
    resource: 'blog',
    action: 'delete',
    description: 'Delete blog posts',
  },
  {
    name: 'blog:publish',
    resource: 'blog',
    action: 'publish',
    description: 'Publish and unpublish blog posts',
  },
  {
    name: 'blog:*',
    resource: 'blog',
    action: '*',
    description: 'All blog operations',
  },

  // Landing Page CMS Permissions
  {
    name: 'landing:read',
    resource: 'landing',
    action: 'read',
    description: 'View landing page content',
  },
  {
    name: 'landing:write',
    resource: 'landing',
    action: 'write',
    description: 'Edit landing page content and sections',
  },
  {
    name: 'landing:publish',
    resource: 'landing',
    action: 'publish',
    description: 'Publish landing page changes',
  },
  {
    name: 'landing:*',
    resource: 'landing',
    action: '*',
    description: 'All landing page operations',
  },

  // Custom Pages Permissions
  {
    name: 'pages:read',
    resource: 'pages',
    action: 'read',
    description: 'View custom pages',
  },
  {
    name: 'pages:write',
    resource: 'pages',
    action: 'write',
    description: 'Create and edit custom pages',
  },
  {
    name: 'pages:delete',
    resource: 'pages',
    action: 'delete',
    description: 'Delete custom pages',
  },
  {
    name: 'pages:publish',
    resource: 'pages',
    action: 'publish',
    description: 'Publish and unpublish custom pages',
  },
  {
    name: 'pages:*',
    resource: 'pages',
    action: '*',
    description: 'All custom pages operations',
  },

  // E-Commerce Permissions
  // Products
  {
    name: 'products:read',
    resource: 'products',
    action: 'read',
    description: 'View products and product catalog',
  },
  {
    name: 'products:write',
    resource: 'products',
    action: 'write',
    description: 'Create and edit products',
  },
  {
    name: 'products:delete',
    resource: 'products',
    action: 'delete',
    description: 'Delete products',
  },
  {
    name: 'products:publish',
    resource: 'products',
    action: 'publish',
    description: 'Publish and unpublish products',
  },
  {
    name: 'products:*',
    resource: 'products',
    action: '*',
    description: 'All product operations',
  },

  // Inventory
  {
    name: 'inventory:read',
    resource: 'inventory',
    action: 'read',
    description: 'View inventory levels',
  },
  {
    name: 'inventory:write',
    resource: 'inventory',
    action: 'write',
    description: 'Adjust inventory levels',
  },
  {
    name: 'inventory:*',
    resource: 'inventory',
    action: '*',
    description: 'All inventory operations',
  },

  // Orders
  {
    name: 'orders:read',
    resource: 'orders',
    action: 'read',
    description: 'View orders',
  },
  {
    name: 'orders:write',
    resource: 'orders',
    action: 'write',
    description: 'Create and edit orders',
  },
  {
    name: 'orders:delete',
    resource: 'orders',
    action: 'delete',
    description: 'Delete orders',
  },
  {
    name: 'orders:fulfill',
    resource: 'orders',
    action: 'fulfill',
    description: 'Process and fulfill orders',
  },
  {
    name: 'orders:*',
    resource: 'orders',
    action: '*',
    description: 'All order operations',
  },

  // Customers
  {
    name: 'customers:read',
    resource: 'customers',
    action: 'read',
    description: 'View customers',
  },
  {
    name: 'customers:write',
    resource: 'customers',
    action: 'write',
    description: 'Create and edit customers',
  },
  {
    name: 'customers:delete',
    resource: 'customers',
    action: 'delete',
    description: 'Delete customers',
  },
  {
    name: 'customers:*',
    resource: 'customers',
    action: '*',
    description: 'All customer operations',
  },
];

/**
 * Default roles for the system
 * These will be created during database seeding with their associated permissions
 */
export const DEFAULT_ROLES: Record<string, RoleDefinition> = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full system access with all permissions. Cannot be deleted.',
    permissions: ['*:*'],
    isSystemRole: true,
  },

  ADMIN: {
    name: 'Admin',
    description:
      'Administrative access to most features. Can manage users, roles, and settings.',
    permissions: [
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'permissions:read',
      'settings:read',
      'settings:write',
      'profile:read',
      'profile:write',
      'files:write',
      'files:read',
      'files:delete',
      'widgets:admin',
      'notifications:read',
      'notifications:write',
      'notifications:delete',
      'blog:read',
      'blog:write',
      'blog:delete',
      'blog:publish',
      'landing:read',
      'landing:write',
      'landing:publish',
      'pages:read',
      'pages:write',
      'pages:delete',
      'pages:publish',
      // E-Commerce Permissions (Full Access)
      'customers:read',
      'customers:write',
      'customers:delete',
      'products:read',
      'products:write',
      'products:delete',
      'products:publish',
      'orders:read',
      'orders:write',
      'orders:delete',
      'orders:fulfill',
      'inventory:read',
      'inventory:write',
    ],
    isSystemRole: true,
  },

  MANAGER: {
    name: 'Manager',
    description:
      'Can manage users and view settings. Limited administrative access.',
    permissions: [
      'users:read',
      'users:write',
      'roles:read',
      'settings:read',
      'profile:read',
      'profile:write',
      'notifications:read',
      'landing:read',
      'pages:read',
      // E-Commerce Permissions (Read/Write, No Delete)
      'customers:read',
      'customers:write',
      'products:read',
      'products:write',
      'products:publish',
      'orders:read',
      'orders:write',
      'orders:fulfill',
      'inventory:read',
      'inventory:write',
    ],
    isSystemRole: false,
  },

  USER: {
    name: 'User',
    description:
      'Standard user with basic access. Can view users and edit own profile.',
    permissions: [
      'users:read',
      'settings:read',
      'profile:read',
      'profile:write',
      'notifications:read',
    ],
    isSystemRole: true,
  },
};

/**
 * Get the default role name for new user registration
 */
export const DEFAULT_USER_ROLE = 'User';
