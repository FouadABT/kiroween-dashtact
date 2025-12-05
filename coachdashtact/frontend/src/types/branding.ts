/**
 * Branding Types
 * 
 * TypeScript interfaces for branding management system.
 * Matches backend DTOs for type safety across the stack.
 */

export interface BrandSettings {
  id: string;
  brandName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBrandSettingsDto {
  brandName?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  supportEmail?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface FileUploadResponse {
  url: string;
}
