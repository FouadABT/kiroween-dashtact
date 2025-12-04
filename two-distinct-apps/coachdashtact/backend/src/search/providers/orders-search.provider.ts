import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { ISearchable } from '../interfaces/searchable.interface';
import { SearchOptions } from '../interfaces/search-options.interface';
import { SearchResultItem } from '../interfaces/search-result.interface';

@Injectable()
export class OrdersSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'orders';
  }

  getRequiredPermission(): string {
    return 'orders:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // Get user's role
    const user = await this.usersService.findOne(userId);
    
    // Build query based on role
    const whereClause = await this.buildWhereClause(user, query);
    
    // Execute search with pagination
    const orders = await this.prisma.order.findMany({
      where: whereClause,
      skip: ((options.page || 1) - 1) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: this.getOrderBy(options.sortBy),
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          select: {
            productName: true,
          },
        },
      },
    });
    
    // Format and score results
    return orders.map(o => {
      const result = this.formatResult(o);
      result.relevanceScore = this.calculateRelevance(o, query);
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
    const whereClause = await this.buildWhereClause(user, query);
    return this.prisma.order.count({ where: whereClause });
  }

  formatResult(order: any): SearchResultItem {
    const customerName = order.customer 
      ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
      : order.customerName;
    const total = `$${Number(order.total).toFixed(2)}`;
    
    return {
      id: order.id,
      entityType: 'orders',
      title: `Order ${order.orderNumber}`,
      description: `${customerName} • ${total} • ${order.status}`,
      url: this.getEntityUrl(order.id),
      metadata: {
        date: order.createdAt,
        customer: customerName,
        total,
        status: order.status,
        orderNumber: order.orderNumber,
      },
      relevanceScore: 0,
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/orders/${entityId}`;
  }

  private async buildWhereClause(user: any, query: string): Promise<any> {
    // Build base search conditions
    const searchConditions = {
      OR: [
        { orderNumber: { contains: query, mode: 'insensitive' as const } },
        { customerName: { contains: query, mode: 'insensitive' as const } },
        { customerEmail: { contains: query, mode: 'insensitive' as const } },
        {
          customer: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' as const } },
              { lastName: { contains: query, mode: 'insensitive' as const } },
              { email: { contains: query, mode: 'insensitive' as const } },
            ],
          },
        },
        {
          items: {
            some: {
              productName: { contains: query, mode: 'insensitive' as const },
            },
          },
        },
      ],
    };

    // Staff members (with orders:read permission) see all orders
    if (user.role?.name === 'ADMIN' || user.role?.name === 'MODERATOR') {
      return searchConditions;
    }
    
    // Check if user is a customer (has a customer account)
    const customerAccount = await this.prisma.customerAccount.findFirst({
      where: { email: user.email },
      include: { customer: true },
    });
    
    if (customerAccount) {
      // Customers see only their own orders
      return {
        ...searchConditions,
        customerId: customerAccount.customerId,
      };
    }
    
    // Regular users without customer account see no orders
    return {
      ...searchConditions,
      id: 'impossible-id', // No results
    };
  }

  private calculateRelevance(order: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Order number matches get highest priority
    if (order.orderNumber?.toLowerCase() === lowerQuery) score += 100;
    else if (order.orderNumber?.toLowerCase().startsWith(lowerQuery)) score += 80;
    else if (order.orderNumber?.toLowerCase().includes(lowerQuery)) score += 60;
    
    // Customer name matches
    const customerName = order.customer 
      ? `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase()
      : order.customerName?.toLowerCase();
    
    if (customerName === lowerQuery) score += 90;
    else if (customerName?.includes(lowerQuery)) score += 50;
    
    // Customer email matches
    const customerEmail = order.customer?.email || order.customerEmail;
    if (customerEmail?.toLowerCase() === lowerQuery) score += 85;
    else if (customerEmail?.toLowerCase().includes(lowerQuery)) score += 40;
    
    // Product name matches
    const productNames = order.items?.map((item: any) => item.productName.toLowerCase()) || [];
    if (productNames.some((name: string) => name === lowerQuery)) score += 70;
    else if (productNames.some((name: string) => name.includes(lowerQuery))) score += 35;
    
    return score;
  }

  private getOrderBy(sortBy?: string): any {
    switch (sortBy) {
      case 'date':
        return { createdAt: 'desc' as const };
      case 'name':
        return { orderNumber: 'asc' as const };
      default:
        return {}; // Relevance handled by scoring
    }
  }
}
