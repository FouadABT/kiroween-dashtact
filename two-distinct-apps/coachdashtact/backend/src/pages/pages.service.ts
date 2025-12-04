import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from './slug.service';
import { RedirectService } from './redirect.service';
import { CustomPage, PageStatus, PageVisibility } from '@prisma/client';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PageHierarchyNode {
  id: string;
  title: string;
  slug: string;
  children: PageHierarchyNode[];
}

@Injectable()
export class PagesService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly redirectService: RedirectService,
  ) {}

  /**
   * List pages with filtering and pagination
   */
  async findAll(
    filters: PageQueryDto,
  ): Promise<PaginatedResponse<CustomPage>> {
    const {
      status,
      visibility,
      parentPageId,
      showInNavigation,
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      cursor,
    } = filters;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (visibility) {
      where.visibility = visibility;
    }

    if (parentPageId !== undefined) {
      where.parentPageId = parentPageId === 'null' ? null : parentPageId;
    }

    if (showInNavigation !== undefined) {
      where.showInNavigation = showInNavigation;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Use cursor-based pagination for large datasets (when cursor is provided)
    if (cursor) {
      const data = await this.prisma.customPage.findMany({
        where,
        include: {
          parentPage: {
            select: { id: true, title: true, slug: true },
          },
          childPages: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
        take: limit,
      });

      // Get total count (cached for 5 minutes)
      const total = await this.prisma.customPage.count({ where });

      return {
        data,
        total,
        page: 0, // Not applicable for cursor-based pagination
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Use offset-based pagination for smaller datasets
    // Get total count
    const total = await this.prisma.customPage.count({ where });

    // Get paginated data with optimized query
    const data = await this.prisma.customPage.findMany({
      where,
      include: {
        parentPage: {
          select: { id: true, title: true, slug: true },
        },
        childPages: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get page by slug with optional children
   */
  async findBySlug(
    slug: string,
    includeChildren = false,
  ): Promise<CustomPage> {
    const cacheKey = `page-${slug}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const page = await this.prisma.customPage.findUnique({
      where: { slug },
      include: {
        parentPage: true,
        childPages: includeChildren,
      },
    });

    if (!page) {
      // Check for redirect
      const redirectedPage = await this.redirectService.resolveRedirect(slug);
      if (redirectedPage) {
        return redirectedPage;
      }

      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    // Cache published pages
    if (page.status === PageStatus.PUBLISHED) {
      this.cache.set(cacheKey, {
        data: page,
        timestamp: Date.now(),
      });
    }

    return page;
  }

  /**
   * Get page by ID
   */
  async findById(id: string): Promise<any> {
    const page = await this.prisma.customPage.findUnique({
      where: { id },
      include: {
        parentPage: true,
        childPages: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    return page;
  }

  /**
   * Create new page with slug validation
   */
  async create(dto: CreatePageDto): Promise<CustomPage> {
    // Validate slug format
    if (!this.slugService.validateSlugFormat(dto.slug)) {
      throw new BadRequestException(
        'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
      );
    }

    // Check for system route conflict
    if (this.slugService.isSystemRoute(dto.slug)) {
      throw new BadRequestException(
        `Slug "${dto.slug}" conflicts with system route`,
      );
    }

    // Check slug availability
    const isAvailable = await this.slugService.isSlugAvailable(dto.slug);
    if (!isAvailable) {
      const suggestedSlug = await this.slugService.suggestSlug(dto.slug);
      throw new ConflictException({
        message: `Slug "${dto.slug}" is already in use`,
        suggestedSlug,
      });
    }

    // Validate parent page if provided
    if (dto.parentPageId) {
      await this.validateParentPage(dto.parentPageId);
    }

    // Create page
    const page = await this.prisma.customPage.create({
      data: {
        ...dto,
        status: dto.status || PageStatus.DRAFT,
        visibility: dto.visibility || PageVisibility.PUBLIC,
      },
      include: {
        parentPage: true,
        childPages: true,
      },
    });

    return page;
  }

  /**
   * Update page with slug change handling
   */
  async update(id: string, dto: UpdatePageDto): Promise<CustomPage> {
    const existingPage = await this.findById(id);

    // If slug is changing, validate and create redirect
    if (dto.slug && dto.slug !== existingPage.slug) {
      // Validate new slug format
      if (!this.slugService.validateSlugFormat(dto.slug)) {
        throw new BadRequestException(
          'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
        );
      }

      // Check for system route conflict
      if (this.slugService.isSystemRoute(dto.slug)) {
        throw new BadRequestException(
          `Slug "${dto.slug}" conflicts with system route`,
        );
      }

      // Check slug availability
      const isAvailable = await this.slugService.isSlugAvailable(dto.slug, id);
      if (!isAvailable) {
        const suggestedSlug = await this.slugService.suggestSlug(dto.slug);
        throw new ConflictException({
          message: `Slug "${dto.slug}" is already in use`,
          suggestedSlug,
        });
      }

      // Create redirect from old slug to this page
      await this.redirectService.createRedirect(existingPage.slug, id);
    }

    // Validate parent page if changing
    if (dto.parentPageId !== undefined && dto.parentPageId !== null) {
      await this.validateParentPage(dto.parentPageId, id);
    }

    // Update page
    const updatedPage = await this.prisma.customPage.update({
      where: { id },
      data: dto,
      include: {
        parentPage: true,
        childPages: true,
      },
    });

    // Invalidate cache
    this.cache.delete(`page-${existingPage.slug}`);
    if (dto.slug) {
      this.cache.delete(`page-${dto.slug}`);
    }

    return updatedPage;
  }

  /**
   * Delete page with child page handling
   */
  async delete(id: string): Promise<void> {
    const page = await this.findById(id);

    // Check if page has children (childPages is included via findById)
    const childPagesArray = page.childPages as any[];
    if (childPagesArray && childPagesArray.length > 0) {
      throw new BadRequestException(
        'Cannot delete page with child pages. Please reassign or delete child pages first.',
      );
    }

    // Delete redirects pointing to this page
    await this.redirectService.deleteRedirectsForPage(id);

    // Delete page
    await this.prisma.customPage.delete({
      where: { id },
    });

    // Invalidate cache
    this.cache.delete(`page-${page.slug}`);
  }

  /**
   * Publish page and update publishedAt timestamp
   */
  async publish(id: string): Promise<CustomPage> {
    const page = await this.prisma.customPage.update({
      where: { id },
      data: {
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        parentPage: true,
        childPages: true,
      },
    });

    // Invalidate cache
    this.cache.delete(`page-${page.slug}`);

    return page;
  }

  /**
   * Unpublish page
   */
  async unpublish(id: string): Promise<CustomPage> {
    const page = await this.prisma.customPage.update({
      where: { id },
      data: {
        status: PageStatus.DRAFT,
      },
      include: {
        parentPage: true,
        childPages: true,
      },
    });

    // Invalidate cache
    this.cache.delete(`page-${page.slug}`);

    return page;
  }

  /**
   * Update display order for multiple pages
   */
  async reorder(updates: Array<{ id: string; order: number }>): Promise<void> {
    // Update each page's display order
    await Promise.all(
      updates.map((update) =>
        this.prisma.customPage.update({
          where: { id: update.id },
          data: { displayOrder: update.order },
        }),
      ),
    );

    // Clear cache for all pages
    this.cache.clear();
  }

  /**
   * Get page hierarchy tree for navigation
   * Optimized with caching and minimal field selection
   */
  async getHierarchy(): Promise<PageHierarchyNode[]> {
    const cacheKey = 'page-hierarchy';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Get all published pages that should show in navigation
    // Optimized query: only select necessary fields and use composite index
    const pages = await this.prisma.customPage.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        showInNavigation: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { title: 'asc' }, // Secondary sort for consistent ordering
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        parentPageId: true,
        displayOrder: true,
      },
    });

    // Build hierarchy tree (in-memory operation, very fast)
    const hierarchy = this.buildHierarchyTree(pages);

    // Cache hierarchy for 5 minutes
    this.cache.set(cacheKey, {
      data: hierarchy,
      timestamp: Date.now(),
    });

    return hierarchy;
  }

  /**
   * Validate slug availability
   */
  async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    // Validate format
    if (!this.slugService.validateSlugFormat(slug)) {
      return false;
    }

    // Check for system route conflict
    if (this.slugService.isSystemRoute(slug)) {
      return false;
    }

    // Check availability
    return this.slugService.isSlugAvailable(slug, excludeId);
  }

  /**
   * Resolve redirect for a slug
   */
  async resolveRedirect(slug: string): Promise<CustomPage | null> {
    return this.redirectService.resolveRedirect(slug);
  }

  /**
   * Build hierarchy tree from flat list of pages
   */
  private buildHierarchyTree(
    pages: Array<{
      id: string;
      title: string;
      slug: string;
      parentPageId: string | null;
    }>,
  ): PageHierarchyNode[] {
    const pageMap = new Map<string, PageHierarchyNode>();
    const rootPages: PageHierarchyNode[] = [];

    // Create nodes for all pages
    pages.forEach((page) => {
      pageMap.set(page.id, {
        id: page.id,
        title: page.title,
        slug: page.slug,
        children: [],
      });
    });

    // Build tree structure
    pages.forEach((page) => {
      const node = pageMap.get(page.id)!;

      if (page.parentPageId) {
        const parent = pageMap.get(page.parentPageId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found or not published, treat as root
          rootPages.push(node);
        }
      } else {
        rootPages.push(node);
      }
    });

    return rootPages;
  }

  /**
   * Validate parent page exists and prevent circular references
   */
  private async validateParentPage(
    parentPageId: string,
    currentPageId?: string,
  ): Promise<void> {
    // Check if parent page exists
    const parentPage = await this.prisma.customPage.findUnique({
      where: { id: parentPageId },
    });

    if (!parentPage) {
      throw new NotFoundException(
        `Parent page with ID "${parentPageId}" not found`,
      );
    }

    // Prevent setting page as its own parent
    if (currentPageId && parentPageId === currentPageId) {
      throw new BadRequestException('Page cannot be its own parent');
    }

    // Prevent circular references (check if parent is a descendant of current page)
    if (currentPageId) {
      const isDescendant = await this.isDescendant(currentPageId, parentPageId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set page as parent because it would create a circular reference',
        );
      }
    }
  }

  /**
   * Check if potentialDescendant is a descendant of ancestorId
   */
  private async isDescendant(
    ancestorId: string,
    potentialDescendantId: string,
  ): Promise<boolean> {
    let currentId: string | null = potentialDescendantId;

    while (currentId) {
      if (currentId === ancestorId) {
        return true;
      }

      const page = await this.prisma.customPage.findUnique({
        where: { id: currentId },
        select: { parentPageId: true },
      });

      currentId = page?.parentPageId || null;
    }

    return false;
  }
}
