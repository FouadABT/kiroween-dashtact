/**
 * User Profile Interface
 * Represents user data returned in authentication responses
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  permissions: string[];
  lastPasswordChange: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Token Pair Interface
 * Contains both access and refresh tokens
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth Response Interface
 * Complete response returned after successful authentication
 */
export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds
}

/**
 * Token Response Interface
 * Response returned after token refresh
 */
export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Two-Factor Required Response Interface
 * Response returned when 2FA verification is required
 */
export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  userId: string;
  message: string;
}
