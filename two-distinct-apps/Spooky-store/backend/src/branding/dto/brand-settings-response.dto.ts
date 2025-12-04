export class BrandSettingsResponseDto {
  id: string;
  brandName: string;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
  websiteUrl?: string | null;
  supportEmail?: string | null;
  socialLinks?: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<BrandSettingsResponseDto>) {
    Object.assign(this, partial);
  }
}
