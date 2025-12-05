import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class CustomersSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'customers';
  }

  getRequiredPermission(): string {
    return 'customers:read';
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
    const customers = await this.prisma.customer.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
    });
    
    // Format and score results
    return customers.map(c => {
      const result = this.formatResult(c);
      result.relevanceScore = this.calculateRelevance(c, query);
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
    return this.prisma.customer.count({ where: whereClause });
  }

  formatResult(customer: any): SearchResultItem {
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const company = customer.company ? ` • ${customer.company}` : '';
    
    return {
      id: customer.id,
      entityType: 'customers',
      title: fullName || customer.email,
      description: `${customer.email}${company}`,
      url: this.getEntityUrl(customer.id),
      metadata: {
        date: customer.createdAt,
        email: customer.email,
        company: customer.company,
        phone: customer.phone,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/customers/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { company: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    // All staff members with customers:read permission can see all customers
    // In a more complex system, you might filter by assigned customers, regions, etc.
    return baseWhere;
  }

  private calculateRelevance(customer: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    
    // Name matches
    if (fullName === lowerQuery) score += 100;
    else if (fullName.startsWith(lowerQuery)) score += 75;
    else if (fullName.includes(lowerQuery)) score += 50;
    
    if (customer.firstName?.toLowerCase() === lowerQuery) score += 90;
    else if (customer.firstName?.toLowerCase().startsWith(lowerQuery)) score += 60;
    
    if (customer.lastName?.toLowerCase() === lowerQuery) score += 90;
    else if (customer.lastName?.toLowerCase().startsWith(lowerQuery)) score += 60;
    
    // Email matches
    if (customer.email?.toLowerCase() === lowerQuery) score += 100;
    else if (customer.email?.toLowerCase().startsWith(lowerQuery)) score += 50;
    else if (customer.email?.toLowerCase().includes(lowerQuery)) score += 30;
    
    // Company matches
    if (customer.company?.toLowerCase() === lowerQuery) score += 80;
    else if (customer.company?.toLowerCase().includes(lowerQuery)) score += 40;
    
    return score;
  }

  private getOrderBy(sortBy?: string): any {
    switch (sortBy) {
      case 'date':
        return { createdAt: 'desc' as const };
      case 'name':
        return { firstName: 'asc' as const };
      default:
        return {}; // Relevance handled by scoring
    }
  }
}
