import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class PagesSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'pages';
  }

  getRequiredPermission(): string {
    return 'pages:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // Get user's role
    const user = await this.usersService.findOne(userId);
    
    // Build query based on role and visibility
    const whereClause = this.buildWhereClause(user, query);
    
    // Execute search with pagination
    const pages = await this.prisma.customPage.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
    });
    
    // Format and score results
    return pages.map(p => {
      const result = this.formatResult(p);
      result.relevanceScore = this.calculateRelevance(p, query);
      return result;
    }).sort((a, b) => {
      if (options.sortBy === 'relevance' || !options.sortBy) {
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });
  }

  async count(userId: string, query: string): Promise<number> {
    const user = await this.usersService.findOne(userId);
    const whereClause = this.buildWhereClause(user, query);
    return this.prisma.customPage.count({ where: whereClause });
  }

  formatResult(page: any): SearchResultItem {
    const description = page.excerpt || page.metaDescription || 'No description';
    
    return {
      id: page.id,
      entityType: 'pages',
      title: page.title,
      description: `${description.substring(0, 150)}${description.length > 150 ? '...' : ''}`,
      url: this.getEntityUrl(page.id),
      metadata: {
        date: page.publishedAt || page.createdAt,
        status: page.status,
        visibility: page.visibility,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/pages/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { slug: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // Admins see all pages
    if (user.role?.name === 'ADMIN') {
      return baseWhere;
    }
    
    // Regular users see only public published pages
    return {
      ...baseWhere,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };
  }

  private calculateRelevance(page: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Title matches get highest priority
    if (page.title?.toLowerCase() === lowerQuery) score += 100;
    else if (page.title?.toLowerCase().startsWith(lowerQuery)) score += 75;
    else if (page.title?.toLowerCase().includes(lowerQuery)) score += 50;
    
    // Slug matches
    if (page.slug?.toLowerCase() === lowerQuery) score += 90;
    else if (page.slug?.toLowerCase().includes(lowerQuery)) score += 40;
    
    // Content matches (lower priority)
    if (page.content?.toLowerCase().includes(lowerQuery)) score += 20;
    if (page.excerpt?.toLowerCase().includes(lowerQuery)) score += 30;
    
    return score;
  }

  private getOrderBy(sortBy?: string): any {
    switch (sortBy) {
      case 'date':
        return { publishedAt: 'desc' as const };
      case 'name':
        return { title: 'asc' as const };
      default:
        return {}; // Relevance handled by scoring
    }
  }
}
