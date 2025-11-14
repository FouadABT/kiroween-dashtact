import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageRedirect, CustomPage } from '@prisma/client';

@Injectable()
export class RedirectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a 301 redirect from old slug to new page
   */
  async createRedirect(
    fromSlug: string,
    toPageId: string,
  ): Promise<PageRedirect> {
    // Check if redirect already exists
    const existingRedirect = await this.prisma.pageRedirect.findUnique({
      where: { fromSlug },
    });

    if (existingRedirect) {
      // Update existing redirect to point to new page
      return this.prisma.pageRedirect.update({
        where: { fromSlug },
        data: { toPageId },
      });
    }

    // Create new redirect
    return this.prisma.pageRedirect.create({
      data: {
        fromSlug,
        toPageId,
        redirectType: 301, // Permanent redirect
      },
    });
  }

  /**
   * Resolve redirect to target page
   * Returns the target page if redirect exists, null otherwise
   */
  async resolveRedirect(slug: string): Promise<CustomPage | null> {
    const redirect = await this.prisma.pageRedirect.findUnique({
      where: { fromSlug: slug },
      include: { 
        toPage: {
          include: {
            parentPage: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    return redirect?.toPage || null;
  }

  /**
   * Delete all redirects pointing to a specific page
   * Called when a page is deleted
   */
  async deleteRedirectsForPage(pageId: string): Promise<void> {
    await this.prisma.pageRedirect.deleteMany({
      where: { toPageId: pageId },
    });
  }
}
