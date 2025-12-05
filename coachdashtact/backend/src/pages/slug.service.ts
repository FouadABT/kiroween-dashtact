import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SlugService {
  // System routes that cannot be used as page slugs
  private readonly SYSTEM_ROUTES = [
    'dashboard',
    'login',
    'signup',
    'logout',
    'api',
    'auth',
    'admin',
    'settings',
    'profile',
    'users',
    'roles',
    'permissions',
    'notifications',
    'blog',
    'pages',
    'landing',
    'uploads',
    '_next',
    'static',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate URL-friendly slug from title
   * Converts to lowercase, replaces spaces with hyphens, removes special characters
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Check if slug is available (not already used by another page)
   */
  async isSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existingPage = await this.prisma.customPage.findUnique({
      where: { slug },
    });

    // Slug is available if no page exists or if it's the same page being updated
    return !existingPage || existingPage.id === excludeId;
  }

  /**
   * Suggest an alternative slug if the requested one is taken
   * Appends a number to the slug (e.g., about-2, about-3)
   */
  async suggestSlug(baseSlug: string): Promise<string> {
    let counter = 2;
    let suggestedSlug = `${baseSlug}-${counter}`;

    while (!(await this.isSlugAvailable(suggestedSlug))) {
      counter++;
      suggestedSlug = `${baseSlug}-${counter}`;
    }

    return suggestedSlug;
  }

  /**
   * Check if slug conflicts with system routes
   */
  isSystemRoute(slug: string): boolean {
    return this.SYSTEM_ROUTES.includes(slug.toLowerCase());
  }

  /**
   * Validate slug format (lowercase, alphanumeric, hyphens only)
   */
  validateSlugFormat(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length > 0 && slug.length <= 200;
  }
}
