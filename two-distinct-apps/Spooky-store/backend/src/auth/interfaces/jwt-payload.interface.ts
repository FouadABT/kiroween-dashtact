/**
 * JWT Payload Interface
 * Defines the structure of data encoded in JWT tokens
 */
export interface JwtPayload {
  /**
   * Subject - User ID
   */
  sub: string;

  /**
   * User email address
   */
  email: string;

  /**
   * User role ID
   */
  roleId: string;

  /**
   * User role name (e.g., "ADMIN", "USER")
   */
  roleName: string;

  /**
   * Array of permission strings (e.g., ["users:read", "users:write"])
   */
  permissions: string[];

  /**
   * Issued at timestamp (Unix timestamp)
   */
  iat?: number;

  /**
   * Expiration timestamp (Unix timestamp)
   */
  exp?: number;

  /**
   * Token issuer
   */
  iss?: string;

  /**
   * Token audience
   */
  aud?: string;
}
