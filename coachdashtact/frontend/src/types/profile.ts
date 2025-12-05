/**
 * Profile Type Definitions
 * 
 * TypeScript interfaces for profile-related data structures
 */

/**
 * Profile response from backend
 */
export interface ProfileResponse {
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
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastPasswordChange: string | null;
}

/**
 * Profile update data
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
}

/**
 * Password change data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Avatar upload response
 */
export interface AvatarUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

/**
 * Password validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  score: number; // 0-5
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  feedback: string[];
}
