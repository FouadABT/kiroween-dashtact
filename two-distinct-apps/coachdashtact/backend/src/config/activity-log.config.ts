/**
 * Activity Log Configuration
 * 
 * Controls what gets logged to reduce database bloat while maintaining
 * important security and audit trail.
 */

export const activityLogConfig = {
  /**
   * Enable/disable activity logging globally
   */
  enabled: process.env.ACTIVITY_LOG_ENABLED !== 'false',

  /**
   * Log levels - what types of actions to log
   */
  logLevels: {
    // Critical security events (always log)
    authentication: true,        // Login, logout, register
    authorization: true,          // Permission denied, role changes
    passwordChanges: true,        // Password resets, changes
    twoFactor: true,             // 2FA enable/disable, verification
    
    // Important business operations (recommended)
    userManagement: true,         // User CRUD operations
    contentPublishing: true,      // Publish/unpublish actions
    orderManagement: true,        // Order creation, status changes
    paymentOperations: true,      // Payment processing
    
    // Routine operations (can disable to reduce noise)
    contentEditing: true,         // Page/post updates
    productManagement: true,      // Product CRUD
    settingsChanges: true,        // Settings updates
    
    // High-frequency operations (disabled by default)
    tokenRefresh: process.env.AUDIT_LOG_TOKEN_REFRESH === 'true',  // Token refresh (every ~13 min)
    notificationRead: false,      // Notification read/mark
    autoSave: false,              // Auto-save operations
    filePreview: false,           // File preview/thumbnail
    healthChecks: false,          // Health/ping endpoints
  },

  /**
   * Endpoints to skip (regex patterns)
   */
  skipPatterns: [
    /\/auth\/refresh$/,           // Token refresh
    /\/health$/,                  // Health checks
    /\/metrics$/,                 // Metrics
    /\/ping$/,                    // Ping/heartbeat
    /\/notifications\/.*\/read$/, // Notification read
    /\/notifications\/.*\/mark$/, // Notification mark
    /\/auth\/validate$/,          // Session validation
    /\/auth\/check$/,             // Auth check
    /\/ws\/ping$/,                // WebSocket ping
    /\/socket\/ping$/,            // Socket ping
    /\/preview$/,                 // File preview
    /\/thumbnail$/,               // Thumbnail generation
    /\/autosave$/,                // Auto-save
  ],

  /**
   * Sensitive fields to redact from logs
   */
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'creditCard',
    'credit_card',
    'cardNumber',
    'card_number',
    'cvv',
    'ssn',
    'socialSecurity',
    'social_security',
  ],

  /**
   * Retention policy (days)
   */
  retention: {
    critical: 365,      // Keep critical logs for 1 year
    important: 90,      // Keep important logs for 3 months
    routine: 30,        // Keep routine logs for 1 month
  },

  /**
   * Performance settings
   */
  performance: {
    asyncLogging: true,           // Log asynchronously (don't block responses)
    batchSize: 100,               // Batch insert size
    maxMetadataSize: 5000,        // Max metadata JSON size (bytes)
  },
};

/**
 * Determine log category for retention policy
 */
export function getLogCategory(action: string): 'critical' | 'important' | 'routine' {
  const criticalActions = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_REGISTER',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET',
    'TWO_FACTOR_ENABLED',
    'TWO_FACTOR_DISABLED',
    'PERMISSION_DENIED',
    'USER_ROLE_CHANGED',
    'PAYMENT_PROCESSED',
  ];

  const importantActions = [
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'ORDER_CREATED',
    'ORDER_STATUS_CHANGED',
    'PRODUCT_PUBLISHED',
    'PAGE_PUBLISHED',
    'BLOG_POST_PUBLISHED',
  ];

  if (criticalActions.some(a => action.includes(a))) {
    return 'critical';
  }

  if (importantActions.some(a => action.includes(a))) {
    return 'important';
  }

  return 'routine';
}
