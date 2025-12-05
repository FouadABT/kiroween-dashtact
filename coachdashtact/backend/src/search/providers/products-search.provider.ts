import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class ProductsSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'products';
  }

  getRequiredPermission(): string {
    return 'products:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // Get user's role
    const user = await this.usersService.findOne(userId);
    
    // Build query based on role
    const whereClause = this.buildWhereClause(user, query);
    
    // Execute search with pagination
    const products = await this.prisma.product.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
    });
    
    // Format and score results
    return products.map(p => {
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
    return this.prisma.product.count({ where: whereClause });
  }

  formatResult(product: any): SearchResultItem {
    const price = product.basePrice ? `$${Number(product.basePrice).toFixed(2)}` : 'N/A';
    const description = product.shortDescription || product.description || 'No description';
    
    return {
      id: product.id,
      entityType: 'products',
      title: product.name,
      description: `${description.substring(0, 150)}${description.length > 150 ? '...' : ''}`,
      url: this.getEntityUrl(product.id),
      metadata: {
        date: product.createdAt,
        status: product.status,
        price,
        sku: product.sku,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/products/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { shortDescription: { contains: query, mode: 'insensitive' as const } },
        { sku: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // Regular users see only published products
    if (user.role?.name !== 'ADMIN') {
      return {
        ...baseWhere,
        status: 'PUBLISHED',
        isVisible: true,
      };
    }
    
    // Admins see all products
    return baseWhere;
  }

  private calculateRelevance(product: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Title matches get highest priority
    if (product.name?.toLowerCase() === lowerQuery) score += 100;
    else if (product.name?.toLowerCase().startsWith(lowerQuery)) score += 75;
    else if (product.name?.toLowerCase().includes(lowerQuery)) score += 50;
    
    // SKU matches
    if (product.sku?.toLowerCase() === lowerQuery) score += 90;
    else if (product.sku?.toLowerCase().includes(lowerQuery)) score += 40;
    
    // Description matches
    if (product.description?.toLowerCase().includes(lowerQuery)) score += 20;
    if (product.shortDescription?.toLowerCase().includes(lowerQuery)) score += 25;
    
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
