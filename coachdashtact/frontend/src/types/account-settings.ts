/**
 * Account Settings Types
 * 
 * TypeScript interfaces for customer account settings
 * Synced with backend Prisma schema and DTOs
 */

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
}

export interface AccountSettings {
  id: string;
  customerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  twoFactorEnabled: boolean;
  privacyLevel: PrivacyLevel;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountSettingsRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  orderUpdates?: boolean;
  privacyLevel?: PrivacyLevel;
}

export interface AccountSettingsResponse extends AccountSettings {}
