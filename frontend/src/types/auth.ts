/**
 * Authentication Type Definitions
 *
 * TypeScript interfaces for authentication-related data structures
 * that correspond to the backend authentication system.
 *
 * These types ensure type safety across the authentication flow
 * and match the backend DTOs and response structures.
 */

import { UserProfile } from './user';

/**
 * JWT Token Pair
 * Contains both access and refresh tokens returned from authentication
 */
export interface TokenPair {
  /** Short-lived access token (15 minutes) */
  accessToken: string;

  /** Long-lived refresh token (7 days) */
  refreshToken: string;
}

/**
 * JWT Payload Structure
 * Decoded content of the JWT access token
 */
export interface JwtPayload {
  /** User ID (subject) */
  sub: string;

  /** User email address */
  email: string;

  /** User's role ID */
  roleId: string;

  /** User's role name (e.g., "ADMIN", "USER") */
  roleName: string;

  /** Array of permission strings (e.g., ["users:read", "users:write"]) */
  permissions: string[];

  /** Token issued at timestamp (Unix time) */
  iat: number;

  /** Token expiration timestamp (Unix time) */
  exp: number;

  /** Token issuer (optional) */
  iss?: string;

  /** Token audience (optional) */
  aud?: string;
}

/**
 * Authentication Response
 * Complete response from login or registration endpoints
 */
export interface AuthResponse {
  /** User profile information */
  user: UserProfile;

  /** Access token for API requests */
  accessToken: string;

  /** Refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Access token expiration time in seconds */
  expiresIn: number;
}

/**
 * Token Refresh Response
 * Response from token refresh endpoint
 * Note: Current backend implementation does not rotate refresh tokens
 */
export interface TokenRefreshResponse {
  /** New access token */
  accessToken: string;

  /** New expiration time in seconds */
  expiresIn: number;

  /** New refresh token (optional - only if rotation is enabled, not currently used) */
  refreshToken?: string;
}

/**
 * Login Credentials
 * Data required for user login
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;

  /** User's password */
  password: string;

  /** Remember me flag for extended session (optional) */
  rememberMe?: boolean;
}

/**
 * Registration Data
 * Data sent to backend for user registration
 * Note: confirmPassword and acceptTerms are validated on frontend only
 */
export interface RegisterData {
  /** User's email address */
  email: string;

  /** User's password */
  password: string;

  /** User's display name (optional) */
  name?: string;
}

/**
 * Password Reset Request Data
 * Data for requesting a password reset
 */
export interface PasswordResetRequest {
  /** User's email address */
  email: string;
}

/**
 * Password Reset Confirmation Data
 * Data for confirming a password reset with token
 */
export interface PasswordResetConfirm {
  /** Reset token from email */
  token: string;

  /** New password */
  password: string;

  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Email Verification Data
 * Data for email verification
 */
export interface EmailVerification {
  /** Verification token from email */
  token: string;
}

/**
 * Change Password Data
 * Data for changing password while authenticated
 */
export interface ChangePasswordData {
  /** Current password */
  currentPassword: string;

  /** New password */
  newPassword: string;

  /** New password confirmation */
  confirmPassword: string;
}

/**
 * Authentication Error
 * Structured error response from authentication endpoints
 */
export interface AuthError {
  /** HTTP status code */
  statusCode: number;

  /** Error message */
  message: string;

  /** Error type/code */
  error: string;

  /** Timestamp of error */
  timestamp: string;

  /** Request path that caused error */
  path: string;
}

/**
 * Authentication State
 * Current authentication state in the application
 */
export interface AuthState {
  /** Current authenticated user (null if not authenticated) */
  user: UserProfile | null;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Whether authentication state is being loaded */
  isLoading: boolean;

  /** Current access token (null if not authenticated) */
  accessToken: string | null;

  /** Token expiration timestamp (null if not authenticated) */
  tokenExpiry: number | null;

  /** Authentication error (null if no error) */
  error: AuthError | null;
}

/**
 * Permission Check Options
 * Options for checking user permissions
 */
export interface PermissionCheckOptions {
  /** Permissions to check */
  permissions: string | string[];

  /** Require all permissions (true) or any permission (false) */
  requireAll?: boolean;
}

/**
 * Role Check Options
 * Options for checking user roles
 */
export interface RoleCheckOptions {
  /** Roles to check */
  roles: string | string[];

  /** Require all roles (true) or any role (false) */
  requireAll?: boolean;
}

/**
 * Session Information
 * Information about the current user session
 */
export interface SessionInfo {
  /** Session ID */
  id: string;

  /** User ID */
  userId: string;

  /** IP address */
  ipAddress: string;

  /** User agent string */
  userAgent: string;

  /** Last activity timestamp */
  lastActive: string;

  /** Session expiration timestamp */
  expiresAt: string;

  /** Whether this is the current session */
  isCurrent: boolean;
}

/**
 * Two-Factor Authentication Status
 * Current 2FA status for a user
 */
export interface TwoFactorStatus {
  /** Whether 2FA is enabled */
  enabled: boolean;

  /** Last successful verification timestamp (ISO string) */
  verifiedAt?: string;
}

/**
 * Two-Factor Required Response
 * Response when 2FA verification is required during login
 */
export interface TwoFactorRequiredResponse {
  /** Indicates 2FA is required */
  requiresTwoFactor: true;

  /** User ID for verification */
  userId: string;

  /** Message to display to user */
  message: string;
}

/**
 * Verify Two-Factor Request
 * Data for verifying 2FA code during login
 */
export interface VerifyTwoFactorRequest {
  /** User ID from TwoFactorRequiredResponse */
  userId: string;

  /** 6-digit verification code from email */
  code: string;
}

/**
 * Resend Two-Factor Request
 * Data for requesting a new 2FA code
 */
export interface ResendTwoFactorRequest {
  /** User ID from TwoFactorRequiredResponse */
  userId: string;
}

/**
 * Two-Factor Authentication Setup Data
 * Data for setting up 2FA (TOTP - future implementation)
 */
export interface TwoFactorSetup {
  /** Secret key for TOTP */
  secret: string;

  /** QR code data URL for scanning */
  qrCode: string;

  /** Backup codes for recovery */
  backupCodes: string[];
}

/**
 * Two-Factor Authentication Verification Data
 * Data for verifying 2FA code (TOTP - future implementation)
 */
export interface TwoFactorVerification {
  /** TOTP code from authenticator app */
  code: string;
}

/**
 * OAuth Provider Configuration
 * Configuration for OAuth/social authentication providers
 */
export interface OAuthProvider {
  /** Provider name (e.g., "google", "github") */
  name: string;

  /** Provider display name */
  displayName: string;

  /** Provider icon/logo URL */
  icon?: string;

  /** OAuth authorization URL */
  authUrl: string;

  /** Whether provider is enabled */
  enabled: boolean;
}

/**
 * OAuth Callback Data
 * Data received from OAuth callback
 */
export interface OAuthCallback {
  /** OAuth provider name */
  provider: string;

  /** Authorization code */
  code: string;

  /** State parameter for CSRF protection */
  state: string;
}

/**
 * Audit Log Entry
 * Authentication-related audit log entry
 */
export interface AuditLogEntry {
  /** Log entry ID */
  id: string;

  /** User ID (null for failed login attempts) */
  userId: string | null;

  /** Action performed */
  action: string;

  /** IP address */
  ipAddress: string;

  /** User agent string */
  userAgent: string;

  /** Whether action was successful */
  success: boolean;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Timestamp */
  createdAt: string;
}

/**
 * Password Strength Result
 * Result of password strength calculation
 */
export interface PasswordStrength {
  /** Strength score (0-4) */
  score: number;

  /** Strength label (e.g., "Weak", "Strong") */
  label: string;

  /** Strength color class */
  color: string;

  /** Whether password meets requirements */
  meetsRequirements: boolean;

  /** Validation errors (if any) */
  errors: string[];
}

/**
 * Auth Context Value
 * Value provided by AuthContext
 */
export interface AuthContextValue {
  /** Current authentication state */
  state: AuthState;

  /** Login function */
  login: (credentials: LoginCredentials) => Promise<void>;

  /** Register function */
  register: (data: RegisterData) => Promise<void>;

  /** Logout function */
  logout: () => Promise<void>;

  /** Refresh token function */
  refreshToken: () => Promise<void>;

  /** Check if user has permission */
  hasPermission: (permission: string) => boolean;

  /** Check if user has role */
  hasRole: (role: string) => boolean;

  /** Check if user has any of the permissions */
  hasAnyPermission: (permissions: string[]) => boolean;

  /** Check if user has all of the permissions */
  hasAllPermissions: (permissions: string[]) => boolean;

  /** Get current user */
  getUser: () => UserProfile | null;

  /** Get current user permissions */
  getPermissions: () => string[];

  /** Check if authentication is loading */
  isLoading: () => boolean;

  /** Check if user is authenticated */
  isAuthenticated: () => boolean;
}

/**
 * Auth Guard Props
 * Props for authentication guard components
 */
export interface AuthGuardProps {
  /** Child components to render if authenticated */
  children: React.ReactNode;

  /** Fallback component to render if not authenticated */
  fallback?: React.ReactNode;

  /** Redirect path if not authenticated */
  redirectTo?: string;

  /** Show loading state while checking authentication */
  showLoading?: boolean;
}

/**
 * Permission Guard Props
 * Props for permission guard components
 */
export interface PermissionGuardProps {
  /** Child components to render if permission granted */
  children: React.ReactNode;

  /** Required permission(s) */
  permission: string | string[];

  /** Require all permissions (true) or any permission (false) */
  requireAll?: boolean;

  /** Fallback component to render if permission denied */
  fallback?: React.ReactNode;

  /** Show loading state while checking permissions */
  showLoading?: boolean;
}

/**
 * Role Guard Props
 * Props for role guard components
 */
export interface RoleGuardProps {
  /** Child components to render if role matches */
  children: React.ReactNode;

  /** Required role(s) */
  role: string | string[];

  /** Require all roles (true) or any role (false) */
  requireAll?: boolean;

  /** Fallback component to render if role doesn't match */
  fallback?: React.ReactNode;

  /** Show loading state while checking roles */
  showLoading?: boolean;
}

/**
 * Login Form Values
 * Form values for login form
 */
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Register Form Values
 * Form values for registration form
 */
export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

/**
 * Password Reset Request Form Values
 * Form values for password reset request form
 */
export interface PasswordResetRequestFormValues {
  email: string;
}

/**
 * Password Reset Confirm Form Values
 * Form values for password reset confirmation form
 */
export interface PasswordResetConfirmFormValues {
  password: string;
  confirmPassword: string;
}

/**
 * Change Password Form Values
 * Form values for change password form
 */
export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
