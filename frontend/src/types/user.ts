/**
 * User Type Definitions
 * 
 * TypeScript interfaces for user-related data structures
 * that correspond to the backend Prisma User model.
 */

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
  /** User's role ID (foreign key) */
  roleId: string;
  /** User's role object (populated from relation) */
  role: UserRole;
  /** Whether the user account is active */
  isActive: boolean;
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
  roleId?: string; // Now accepts role ID instead of enum
}

/**
 * User update data (all fields optional except id)
 */
export interface UpdateUserData {
  id: string;
  email?: string;
  name?: string;
  roleId?: string; // Now accepts role ID instead of enum
  isActive?: boolean;
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
  roleId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response from login/register
 */
export interface AuthResponse {
  user: UserProfile;
  token?: string;
  message?: string;
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