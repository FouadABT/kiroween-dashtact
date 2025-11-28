import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { BrandSettingsResponseDto } from './dto/brand-settings-response.dto';
import { FileUploadUtil } from './utils/file-upload.util';

@Injectable()
export class BrandingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current brand settings (creates default if not exists)
   */
  async getBrandSettings(): Promise<BrandSettingsResponseDto> {
    let settings = await this.prisma.brandSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.brandSettings.create({
        data: {
          brandName: 'Dashboard',
        },
      });
    }

    return new BrandSettingsResponseDto({
      ...settings,
      socialLinks: settings.socialLinks as Record<string, string> | null,
    });
  }

  /**
   * Update brand settings
   */
  async updateBrandSettings(
    dto: UpdateBrandSettingsDto,
  ): Promise<BrandSettingsResponseDto> {
    const existing = await this.getBrandSettings();

    const updated = await this.prisma.brandSettings.update({
      where: { id: existing.id },
      data: {
        ...(dto.brandName !== undefined && { brandName: dto.brandName }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.supportEmail !== undefined && {
          supportEmail: dto.supportEmail,
        }),
        ...(dto.socialLinks !== undefined && { socialLinks: dto.socialLinks }),
      },
    });

    return new BrandSettingsResponseDto({
      ...updated,
      socialLinks: updated.socialLinks as Record<string, string> | null,
    });
  }

  /**
   * Upload logo (light or dark mode)
   */
  async uploadLogo(
    file: Express.Multer.File,
    isDark = false,
  ): Promise<{ url: string }> {
    const existing = await this.getBrandSettings();

    // Upload new logo
    const relativePath = await FileUploadUtil.uploadLogo(file, isDark);
    
    // Convert to full URL
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const url = `${baseUrl}${relativePath}`;

    // Delete old logo if exists
    const oldUrl = isDark ? existing.logoDarkUrl : existing.logoUrl;
    if (oldUrl) {
      await FileUploadUtil.deleteFile(this.extractRelativePath(oldUrl));
    }

    // Update database
    await this.prisma.brandSettings.update({
      where: { id: existing.id },
      data: isDark ? { logoDarkUrl: url } : { logoUrl: url },
    });

    return { url };
  }

  /**
   * Upload favicon
   */
  async uploadFavicon(file: Express.Multer.File): Promise<{ url: string }> {
    const existing = await this.getBrandSettings();

    // Upload new favicon
    const relativePath = await FileUploadUtil.uploadFavicon(file);
    
    // Convert to full URL
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const url = `${baseUrl}${relativePath}`;

    // Delete old favicon if exists
    if (existing.faviconUrl) {
      await FileUploadUtil.deleteFile(this.extractRelativePath(existing.faviconUrl));
    }

    // Update database
    await this.prisma.brandSettings.update({
      where: { id: existing.id },
      data: { faviconUrl: url },
    });

    return { url };
  }

  /**
   * Reset to default branding
   */
  async resetToDefault(): Promise<BrandSettingsResponseDto> {
    const existing = await this.getBrandSettings();

    // Delete all uploaded files
    if (existing.logoUrl) {
      await FileUploadUtil.deleteFile(this.extractRelativePath(existing.logoUrl));
    }
    if (existing.logoDarkUrl) {
      await FileUploadUtil.deleteFile(this.extractRelativePath(existing.logoDarkUrl));
    }
    if (existing.faviconUrl) {
      await FileUploadUtil.deleteFile(this.extractRelativePath(existing.faviconUrl));
    }

    // Reset to defaults
    const reset = await this.prisma.brandSettings.update({
      where: { id: existing.id },
      data: {
        brandName: 'Dashboard',
        tagline: undefined,
        description: undefined,
        logoUrl: undefined,
        logoDarkUrl: undefined,
        faviconUrl: undefined,
        websiteUrl: undefined,
        supportEmail: undefined,
        socialLinks: undefined,
      },
    });

    return new BrandSettingsResponseDto({
      ...reset,
      socialLinks: reset.socialLinks as Record<string, string> | null,
    });
  }

  /**
   * Extract relative path from full URL
   * Converts http://localhost:3001/public/uploads/... to /public/uploads/...
   */
  private extractRelativePath(url: string): string {
    if (!url) return url;
    
    // If it's already a relative path, return as is
    if (url.startsWith('/')) return url;
    
    // Extract path from full URL
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, return as is
      return url;
    }
  }
}
