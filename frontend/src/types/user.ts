/**
 * User Type Definitions
 * 
 * TypeScript interfaces for user-related data structures
 * that correspond to the backend Prisma User model.
 */

import { RolePermission } from './permission';

/**
 * User role interface matching the backend UserRole model
 */
export interface UserRole {
  /** Unique role identifier */
  id: string;
  /** Role name (USER, ADMIN, MODERATOR) */
  name: string;
  /** Role description */
  description?: string;
  /** Whether the role is active */
  isActive: boolean;
  /** Whether this is a system role that cannot be deleted */
  isSystemRole: boolean;
  /** Role permissions (populated from relation) */
  rolePermissions?: RolePermission[];
  /** Role creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User interface matching the Prisma User model
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address (unique) */
  email: string;
  /** User's display name (optional) */
  name?: string;
  /** User's avatar URL (optional) */
  avatarUrl?: string | null;
  /** User's biography (optional) */
  bio?: string | null;
  /** User's phone number (optional) */
  phone?: string | null;
  /** User's location (optional) */
  location?: string | null;
  /** User's website URL (optional) */
  website?: string | null;
  /** User's role ID (foreign key) */
  roleId: string;
  /** User's role object (populated from relation) */
  role: UserRole;
  /** Whether the user account is active */
  isActive: boolean;
  /** Whether the user's email has been verified */
  emailVerified: boolean;
  /** Authentication provider (local, google, github, etc.) */
  authProvider: string;
  /** Whether two-factor authentication is enabled */
  twoFactorEnabled: boolean;
  /** Last password change timestamp (optional) */
  lastPasswordChange?: string | null;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User creation data (excludes auto-generated fields)
 */
export interface CreateUserData {
  email: string;
  name?: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  roleId?: string; // Now accepts role ID instead of enum
  emailVerified?: boolean;
  authProvider?: 'local' | 'google' | 'github' | 'facebook' | 'twitter';
  twoFactorEnabled?: boolean;
}

/**
 * User update data (all fields optional except id)
 */
export interface UpdateUserData {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  roleId?: string; // Now accepts role ID instead of enum
  isActive?: boolean;
  emailVerified?: boolean;
  authProvider?: 'local' | 'google' | 'github' | 'facebook' | 'twitter';
  twoFactorEnabled?: boolean;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User registration data
 */
export interface RegisterUserData {
  email: string;
  name?: string;
  password: string;
  confirmPassword: string;
}

/**
 * User profile data (excludes sensitive information)
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  roleId: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  authProvider: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Array of permission strings the user has through their role */
  permissions?: string[];
}

/**
 * Authentication response from login/register
 * Matches backend AuthResponse interface
 */
export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds
}

/**
 * User list response for admin/management interfaces
 */
export interface UsersListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

/**
 * User query parameters for filtering/pagination
 */
export interface UserQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  roleId?: string; // Filter by role ID
  roleName?: string; // Filter by role name (USER, ADMIN, MODERATOR)
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
