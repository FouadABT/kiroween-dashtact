/**
 * Frontend Authentication Configuration
 *
 * Centralized configuration for the frontend authentication system.
 * All settings can be customized via environment variables or defaults.
 *
 * This configuration works in tandem with the backend auth.config.ts
 * to provide a complete authentication solution.
 */

/**
 * API Endpoints Configuration
 * Defines all authentication-related API endpoints
 */
export const authEndpoints = {
  /** User login endpoint */
  login: '/auth/login',

  /** User registration endpoint */
  register: '/auth/register',

  /** User logout endpoint */
  logout: '/auth/logout',

  /** Token refresh endpoint */
  refresh: '/auth/refresh',

  /** Get current user profile endpoint */
  profile: '/auth/profile',

  /** Password reset request endpoint (future feature) */
  requestPasswordReset: '/auth/password-reset/request',

  /** Password reset confirmation endpoint (future feature) */
  resetPassword: '/auth/password-reset/confirm',

  /** Email verification endpoint (future feature) */
  verifyEmail: '/auth/verify-email',

  /** Resend verification email endpoint (future feature) */
  resendVerification: '/auth/resend-verification',
} as const;

/**
 * Token Storage Configuration
 * Controls how authentication tokens are stored in the browser
 */
export const tokenStorage = {
  /** Key for storing access token in localStorage */
  accessTokenKey: 'accessToken',

  /** Use localStorage (true) or sessionStorage (false) */
  useLocalStorage: true,

  /** Refresh token is stored in httpOnly cookie by backend */
  refreshTokenCookie: 'refreshToken',
} as const;

/**
 * Redirect Paths Configuration
 * Defines where users are redirected after various auth actions
 */
export const redirectPaths = {
  /** Redirect after successful login */
  afterLogin: '/dashboard',

  /** Redirect after successful logout */
  afterLogout: '/login',

  /** Redirect when user is not authenticated */
  unauthorized: '/login',

  /** Redirect when user lacks required permissions */
  forbidden: '/403',

  /** Redirect after successful registration */
  afterRegister: '/dashboard',

  /** Redirect after email verification (future feature) */
  afterEmailVerification: '/dashboard',
} as const;

/**
 * Token Refresh Configuration
 * Controls automatic token refresh behavior
 */
export const tokenRefresh = {
  /** Enable automatic token refresh */
  enabled: true,

  /**
   * Refresh token this many seconds before expiration
   * Default: 120 seconds (2 minutes)
   */
  refreshBeforeExpiry: 120,

  /**
   * Retry refresh on failure
   * Number of retry attempts before giving up
   */
  maxRetries: 2,

  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay: 1000,
} as const;

/**
 * UI Settings Configuration
 * Controls various UI features in authentication forms
 */
export const uiSettings = {
  /** Show password strength indicator on registration */
  showPasswordStrength: true,

  /** Show "Remember me" checkbox on login */
  showRememberMe: true,

  /** Enable debug panel in development mode */
  enableDebugPanel: process.env.NODE_ENV === 'development',

  /** Show loading states during auth operations */
  showLoadingStates: true,

  /** Auto-focus first input field in forms */
  autoFocusFirstInput: true,

  /** Show detailed error messages (disable in production for security) */
  showDetailedErrors: process.env.NODE_ENV === 'development',
} as const;

/**
 * Password Requirements Configuration
 * Must match backend password requirements for consistency
 */
export const passwordRequirements = {
  /** Minimum password length */
  minLength: 8,

  /** Require at least one uppercase letter */
  requireUppercase: true,

  /** Require at least one lowercase letter */
  requireLowercase: true,

  /** Require at least one number */
  requireNumbers: true,

  /** Require at least one special character */
  requireSpecialChars: false,

  /**
   * Get human-readable password requirements message
   */
  get requirementsMessage(): string {
    const requirements: string[] = [];
    requirements.push(`at least ${this.minLength} characters`);
    if (this.requireUppercase) requirements.push('one uppercase letter');
    if (this.requireLowercase) requirements.push('one lowercase letter');
    if (this.requireNumbers) requirements.push('one number');
    if (this.requireSpecialChars) requirements.push('one special character');
    return `Password must contain ${requirements.join(', ')}`;
  },

  /**
   * Validate password against requirements
   * @param password Password to validate
   * @returns Object with isValid flag and error message
   */
  validate(password: string): { isValid: boolean; error?: string } {
    if (password.length < this.minLength) {
      return {
        isValid: false,
        error: `Password must be at least ${this.minLength} characters`,
      };
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter',
      };
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter',
      };
    }

    if (this.requireNumbers && !/\d/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number',
      };
    }

    if (this.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character',
      };
    }

    return { isValid: true };
  },

  /**
   * Calculate password strength (0-4)
   * @param password Password to evaluate
   * @returns Strength score: 0 (weak) to 4 (very strong)
   */
  calculateStrength(password: string): number {
    let strength = 0;

    if (password.length >= this.minLength) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return Math.min(strength, 4);
  },

  /**
   * Get password strength label
   * @param strength Strength score (0-4)
   * @returns Human-readable strength label
   */
  getStrengthLabel(strength: number): string {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    return labels[strength] || 'Very Weak';
  },

  /**
   * Get password strength color
   * @param strength Strength score (0-4)
   * @returns Tailwind color class
   */
  getStrengthColor(strength: number): string {
    const colors = [
      'text-red-500',
      'text-orange-500',
      'text-yellow-500',
      'text-green-500',
      'text-emerald-500',
    ];
    return colors[strength] || 'text-red-500';
  },
} as const;

/**
 * Session Configuration
 * Controls session behavior and timeouts
 */
export const sessionConfig = {
  /** Show warning before session expires (in seconds) */
  expiryWarningTime: 300, // 5 minutes

  /** Enable session timeout warnings */
  enableTimeoutWarnings: true,

  /** Automatically extend session on user activity */
  extendOnActivity: true,

  /** Activity events that extend session */
  activityEvents: ['mousedown', 'keydown', 'scroll', 'touchstart'] as const,

  /** Debounce time for activity detection (milliseconds) */
  activityDebounce: 5000, // 5 seconds
} as const;

/**
 * Feature Flags Configuration
 * Enable/disable optional authentication features
 * Must match backend feature flags
 */
export const features = {
  /** Email verification for new accounts */
  emailVerification: process.env.NEXT_PUBLIC_FEATURE_EMAIL_VERIFICATION === 'true',

  /** Two-factor authentication */
  twoFactorAuth: process.env.NEXT_PUBLIC_FEATURE_TWO_FACTOR_AUTH === 'true',

  /** Social/OAuth authentication */
  socialAuth: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_AUTH === 'true',

  /** "Remember me" functionality */
  rememberMe: process.env.NEXT_PUBLIC_FEATURE_REMEMBER_ME !== 'false',

  /** Password reset via email */
  passwordReset: process.env.NEXT_PUBLIC_FEATURE_PASSWORD_RESET !== 'false',

  /** Session management (view/revoke active sessions) */
  sessionManagement: process.env.NEXT_PUBLIC_FEATURE_SESSION_MANAGEMENT === 'true',
} as const;

/**
 * API Configuration
 * Base URL and request settings
 */
export const apiConfig = {
  /** Base URL for API requests */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',

  /** Request timeout in milliseconds */
  timeout: 30000, // 30 seconds

  /** Include credentials (cookies) in requests */
  withCredentials: true,

  /** Retry failed requests */
  retryOnError: true,

  /** Maximum number of retry attempts */
  maxRetries: 3,
} as const;

/**
 * Complete Authentication Configuration
 * Combines all configuration sections
 */
export const authConfig = {
  endpoints: authEndpoints,
  storage: tokenStorage,
  redirects: redirectPaths,
  tokenRefresh,
  ui: uiSettings,
  password: passwordRequirements,
  session: sessionConfig,
  features,
  api: apiConfig,
} as const;

/**
 * Export type for TypeScript type safety
 */
export type AuthConfig = typeof authConfig;

/**
 * Helper function to get full API URL
 * @param endpoint Endpoint path
 * @returns Full URL
 */
export function getApiUrl(endpoint: string): string {
  return `${apiConfig.baseUrl}${endpoint}`;
}

/**
 * Helper function to check if a feature is enabled
 * @param feature Feature name
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof typeof features
): boolean {
  return features[feature];
}

export default authConfig;
