/**
 * Profile Validation Schemas
 * 
 * Zod schemas for profile form validation
 */

import { z } from 'zod';

/**
 * Profile update schema
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Invalid URL format')
    .max(200, 'Website URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Password change schema
 */
export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ['newPassword'],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * Avatar file validation
 */
export const avatarFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'File must be JPEG, PNG, WebP, or GIF'
    ),
});

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  score: number;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  feedback: string[];
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const score = metRequirements;

  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score <= 1) strength = 'weak';
  else if (score === 2) strength = 'fair';
  else if (score === 3) strength = 'good';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';

  const feedback: string[] = [];
  if (!requirements.minLength) feedback.push('Add at least 8 characters');
  if (!requirements.hasUppercase) feedback.push('Add an uppercase letter');
  if (!requirements.hasLowercase) feedback.push('Add a lowercase letter');
  if (!requirements.hasNumber) feedback.push('Add a number');
  if (!requirements.hasSpecialChar) feedback.push('Add a special character (@$!%*?&)');

  return {
    isValid: metRequirements === 5,
    strength,
    score,
    requirements,
    feedback,
  };
}
