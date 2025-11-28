import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class UsersSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'users';
  }

  getRequiredPermission(): string {
    return 'users:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // Get user's role and permissions
    const user = await this.usersService.findOne(userId);
    
    // Build query based on role
    const whereClause = this.buildWhereClause(user, query);
    
    // Execute search with pagination
    const users = await this.prisma.user.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
      include: {
        role: true,
      },
    });
    
    // Format and score results
    return users.map(u => {
      const result = this.formatResult(u);
      result.relevanceScore = this.calculateRelevance(u, query);
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
    return this.prisma.user.count({ where: whereClause });
  }

  formatResult(user: any): SearchResultItem {
    return {
      id: user.id,
      entityType: 'users',
      title: user.name || user.email,
      description: `${user.email} • ${user.role?.name || 'User'}`,
      url: this.getEntityUrl(user.id),
      metadata: {
        date: user.createdAt,
        status: user.isActive ? 'Active' : 'Inactive',
        role: user.role?.name,
        email: user.email,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/users/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // Apply role-based filtering
    // Regular users see only themselves
    if (user.role?.name === 'USER') {
      return { ...baseWhere, id: user.id };
    }
    
    // Managers see their team (simplified - in real app would check team membership)
    // For now, managers see all non-admin users
    if (user.role?.name === 'MANAGER' || user.role?.name === 'MODERATOR') {
      return {
        ...baseWhere,
        role: {
          name: { not: 'ADMIN' },
        },
      };
    }
    
    // Admins see all users
    return baseWhere;
  }

  private calculateRelevance(user: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Exact matches get highest score
    if (user.name?.toLowerCase() === lowerQuery) score += 100;
    else if (user.name?.toLowerCase().startsWith(lowerQuery)) score += 50;
    else if (user.name?.toLowerCase().includes(lowerQuery)) score += 25;
    
    if (user.email?.toLowerCase() === lowerQuery) score += 100;
    else if (user.email?.toLowerCase().startsWith(lowerQuery)) score += 50;
    else if (user.email?.toLowerCase().includes(lowerQuery)) score += 25;
    
    return score;
  }

  private getOrderBy(sortBy?: string): any {
    switch (sortBy) {
      case 'date':
        return { createdAt: 'desc' as const };
      case 'name':
        return { name: 'asc' as const };
      default:
        return {}; // Relevance handled by scoring
    }
  }
}
