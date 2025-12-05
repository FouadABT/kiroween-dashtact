/**
 * Authentication Configuration
 * 
 * Centralized configuration for the JWT authentication system.
 * All settings can be customized via environment variables or defaults.
 * 
 * Permission Naming Convention: {resource}:{action}
 * - Resources: users, roles, permissions, settings, profile, etc.
 * - Actions: read, write, delete, admin
 * - Special: *:* (super admin), resource:* (all actions on resource)
 * 
 * Examples:
 * - users:read - View users
 * - users:write - Create/edit users
 * - users:delete - Delete users
 * - settings:admin - Full settings access
 * - profile:write - Edit own profile
 * - *:* - Super admin (all permissions)
 */

export const authConfig = {
  /**
   * JWT Token Configuration
   * Controls token expiration times for access and refresh tokens
   */
  tokens: {
    // Access token expiration (short-lived for security)
    accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    
    // Refresh token expiration (longer-lived for user convenience)
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    
    // Password reset token expiration
    resetTokenExpiration: '1h',
    
    // Email verification token expiration
    verificationTokenExpiration: '24h',
  },

  /**
   * JWT Secret Configuration
   * IMPORTANT: Change JWT_SECRET in production to a strong random value
   */
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    
    // Token issuer (optional, for additional validation)
    issuer: process.env.JWT_ISSUER || 'dashboard-app',
    
    // Token audience (optional, for additional validation)
    audience: process.env.JWT_AUDIENCE || 'dashboard-users',
  },

  /**
   * Password Requirements
   * Enforces password complexity rules during registration and password changes
   */
  password: {
    // Minimum password length
    minLength: 8,
    
    // Require at least one uppercase letter
    requireUppercase: true,
    
    // Require at least one lowercase letter
    requireLowercase: true,
    
    // Require at least one number
    requireNumbers: true,
    
    // Require at least one special character (can be enabled per project)
    requireSpecialChars: false,
    
    // Password regex pattern (auto-generated based on requirements)
    get pattern(): RegExp {
      let pattern = '^';
      if (this.requireUppercase) pattern += '(?=.*[A-Z])';
      if (this.requireLowercase) pattern += '(?=.*[a-z])';
      if (this.requireNumbers) pattern += '(?=.*\\d)';
      if (this.requireSpecialChars) pattern += '(?=.*[@$!%*?&])';
      pattern += `.{${this.minLength},}$`;
      return new RegExp(pattern);
    },
    
    // Human-readable password requirements message
    get requirementsMessage(): string {
      const requirements: string[] = [];
      requirements.push(`at least ${this.minLength} characters`);
      if (this.requireUppercase) requirements.push('one uppercase letter');
      if (this.requireLowercase) requirements.push('one lowercase letter');
      if (this.requireNumbers) requirements.push('one number');
      if (this.requireSpecialChars) requirements.push('one special character');
      return `Password must contain ${requirements.join(', ')}`;
    },
  },

  /**
   * Security Settings
   * Controls various security features like hashing, rate limiting, and logging
   */
  security: {
    // bcrypt salt rounds for password hashing (higher = more secure but slower)
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    
    // Rate limiting configuration
    rateLimit: {
      // Time window in seconds (15 minutes)
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '900', 10),
      
      // Maximum requests per time window
      max: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
    },
    
    // Enable audit logging for security events
    enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
    
    // Account lockout after failed attempts (future feature)
    accountLockout: {
      enabled: process.env.ACCOUNT_LOCKOUT_ENABLED === 'true',
      maxAttempts: parseInt(process.env.ACCOUNT_LOCKOUT_MAX_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '900', 10), // 15 minutes
    },
  },

  /**
   * Feature Flags
   * Enable/disable optional authentication features
   * These features are prepared in the schema but disabled by default
   */
  features: {
    // Email verification for new accounts
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
    
    // Two-factor authentication (TOTP)
    twoFactorAuth: process.env.FEATURE_TWO_FACTOR_AUTH === 'true',
    
    // OAuth/Social authentication providers
    socialAuth: process.env.FEATURE_SOCIAL_AUTH === 'true',
    
    // "Remember me" functionality
    rememberMe: process.env.FEATURE_REMEMBER_ME !== 'false',
    
    // Password reset via email
    passwordReset: process.env.FEATURE_PASSWORD_RESET !== 'false',
    
    // Session management (view/revoke active sessions)
    sessionManagement: process.env.FEATURE_SESSION_MANAGEMENT === 'true',
  },

  /**
   * Default Role Assignment
   * Role assigned to new users upon registration
   */
  defaultRole: process.env.DEFAULT_USER_ROLE || 'User',

  /**
   * Permission Naming Convention
   * Standard format for permission strings
   * 
   * Format: {resource}:{action}
   * 
   * Resources: Plural nouns representing entities (users, posts, settings)
   * Actions: CRUD operations (read, write, delete) or special (admin)
   * 
   * Special Permissions:
   * - *:* - Super admin with all permissions
   * - {resource}:* - All actions on a specific resource
   */
  permissionFormat: '{resource}:{action}',

  /**
   * Standard Permission Actions
   * Common actions used across resources
   */
  standardActions: {
    read: 'read',       // View/list resources
    write: 'write',     // Create/update resources
    delete: 'delete',   // Delete resources
    admin: 'admin',     // Full administrative access
    wildcard: '*',      // All actions
  },

  /**
   * Cookie Configuration
   * Settings for refresh token cookies
   */
  cookies: {
    // Refresh token cookie name
    refreshTokenName: 'refreshToken',
    
    // Cookie options
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    
    // Cookie path
    path: '/',
    
    // Cookie max age (should match refresh token expiration)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },

  /**
   * CORS Configuration
   * Allowed origins for cross-origin requests
   */
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  /**
   * Token Blacklist Cleanup
   * Configuration for automatic cleanup of expired blacklisted tokens
   */
  blacklistCleanup: {
    // Enable automatic cleanup
    enabled: process.env.BLACKLIST_CLEANUP_ENABLED !== 'false',
    
    // Cleanup interval in milliseconds (default: daily)
    interval: parseInt(process.env.BLACKLIST_CLEANUP_INTERVAL || '86400000', 10),
  },
};

/**
 * Helper function to validate permission format
 * @param permission Permission string to validate
 * @returns true if permission follows the standard format
 */
export function isValidPermissionFormat(permission: string): boolean {
  // Special case: super admin
  if (permission === '*:*') return true;
  
  // Standard format: resource:action or resource:*
  const parts = permission.split(':');
  if (parts.length !== 2) return false;
  
  const [resource, action] = parts;
  
  // Resource must be non-empty and alphanumeric (with hyphens/underscores)
  if (!/^[a-z0-9_-]+$/.test(resource)) return false;
  
  // Action must be non-empty and alphanumeric (with hyphens/underscores) or wildcard
  if (!/^[a-z0-9_-]+$/.test(action) && action !== '*') return false;
  
  return true;
}

/**
 * Helper function to parse permission string
 * @param permission Permission string to parse
 * @returns Object with resource and action
 */
export function parsePermission(permission: string): { resource: string; action: string } {
  const [resource, action] = permission.split(':');
  return { resource, action };
}

/**
 * Helper function to create permission string
 * @param resource Resource name
 * @param action Action name
 * @returns Formatted permission string
 */
export function createPermission(resource: string, action: string): string {
  return `${resource}:${action}`;
}

/**
 * Export type for TypeScript type safety
 */
export type AuthConfig = typeof authConfig;
