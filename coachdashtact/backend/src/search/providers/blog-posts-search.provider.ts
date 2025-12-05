import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class BlogPostsSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'posts';
  }

  getRequiredPermission(): string {
    return 'blog:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // Get user's role
    const user = await this.usersService.findOne(userId);
    
    // Build query based on role and author
    const whereClause = this.buildWhereClause(user, query);
    
    // Execute search with pagination
    const posts = await this.prisma.blogPost.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Format and score results
    return posts.map(p => {
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
    return this.prisma.blogPost.count({ where: whereClause });
  }

  formatResult(post: any): SearchResultItem {
    const excerpt = post.excerpt || post.content?.substring(0, 150) || 'No excerpt';
    const authorName = post.author?.name || post.authorName || 'Unknown';
    
    return {
      id: post.id,
      entityType: 'posts',
      title: post.title,
      description: `${excerpt.substring(0, 150)}${excerpt.length > 150 ? '...' : ''}`,
      url: this.getEntityUrl(post.id),
      metadata: {
        date: post.publishedAt || post.createdAt,
        author: authorName,
        status: post.status,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/blog/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // Admins see all posts
    if (user.role?.name === 'ADMIN') {
      return baseWhere;
    }
    
    // Authors see published posts + their own drafts
    // Regular users see only published posts
    return {
      ...baseWhere,
      OR: [
        // Published posts visible to all
        { status: 'PUBLISHED' },
        // Own drafts visible to author
        {
          AND: [
            { authorId: user.id },
            { status: { in: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] } },
          ],
        },
      ],
    };
  }

  private calculateRelevance(post: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Title matches get highest priority
    if (post.title?.toLowerCase() === lowerQuery) score += 100;
    else if (post.title?.toLowerCase().startsWith(lowerQuery)) score += 75;
    else if (post.title?.toLowerCase().includes(lowerQuery)) score += 50;
    
    // Excerpt matches
    if (post.excerpt?.toLowerCase().includes(lowerQuery)) score += 40;
    
    // Content matches (lower priority)
    if (post.content?.toLowerCase().includes(lowerQuery)) score += 20;
    
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
