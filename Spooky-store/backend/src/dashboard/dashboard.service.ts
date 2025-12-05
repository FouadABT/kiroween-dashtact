import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ActivityDto } from './dto/activity.dto';
import { AlertDto } from './dto/alert.dto';
import { SystemHealthDto } from './dto/system-health.dto';
import { InventoryDataDto } from './dto/inventory-data.dto';
import { ContentMetricsDto } from './dto/content-metrics.dto';
import { UserMetricsDto } from './dto/user-metrics.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStatsForRole(userId: string, role: string): Promise<DashboardStatsDto> {
    // Check cache first
    const cacheKey = `dashboard:stats:${userId}:${role}`;
    const cached = await this.cacheManager.get<DashboardStatsDto>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Normalize role name to handle both formats (e.g., "Super Admin" or "SUPER_ADMIN")
    const normalizedRole = role.toUpperCase().replace(/\s+/g, '_');

    // Fetch data based on role
    let stats: DashboardStatsDto;
    switch (normalizedRole) {
      case 'SUPER_ADMIN':
        stats = await this.getSuperAdminStats(userId);
        break;
      case 'ADMIN':
        stats = await this.getAdminStats(userId);
        break;
      case 'MANAGER':
        stats = await this.getManagerStats(userId);
        break;
      case 'USER':
        stats = await this.getUserStats(userId);
        break;
      default:
        throw new ForbiddenException(`Invalid role: ${role}`);
    }

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, stats, 300000);
    
    return stats;
  }

  private async getSuperAdminStats(userId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get business metrics (same as Admin)
    const businessMetrics = await this.getBusinessMetrics(startOfToday, startOfYesterday, startOfMonth);

    // Get system metrics (Super Admin only)
    const [emailStats, activeUsersCount] = await Promise.all([
      // Email delivery rate
      this.prisma.emailLog.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: last24Hours },
        },
        _count: true,
      }),
      // Active users count
      this.prisma.user.count({
        where: {
          isActive: true,
          updatedAt: { gte: last30Days },
        },
      }),
    ]);

    // Calculate cron job success rate (placeholder until cron jobs feature is implemented)
    const cronJobSuccessRate = 100;

    // Calculate email delivery rate
    const totalEmails = emailStats.reduce((sum, stat) => sum + stat._count, 0);
    const sentEmails = emailStats.find(stat => stat.status === 'SENT')?._count || 0;
    const emailDeliveryRate = totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 100;

    return {
      ...businessMetrics,
      cronJobSuccessRate,
      emailDeliveryRate,
      activeUsersCount,
      systemUptime: 99.9, // Placeholder - would need actual uptime tracking
    };
  }

  private async getAdminStats(userId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get business metrics
    const businessMetrics = await this.getBusinessMetrics(startOfToday, startOfYesterday, startOfMonth);

    // Get blog post counts (Admin only)
    const blogPostCounts = await this.prisma.blogPost.groupBy({
      by: ['status'],
      _count: true,
    });

    const blogPostsDraft = blogPostCounts.find(stat => stat.status === 'DRAFT')?._count || 0;
    const blogPostsPublished = blogPostCounts.find(stat => stat.status === 'PUBLISHED')?._count || 0;

    // Get custom pages count
    const customPagesCount = await this.prisma.customPage.count({
      where: { status: 'PUBLISHED' },
    });

    return {
      ...businessMetrics,
      blogPostsDraft,
      blogPostsPublished,
      customPagesCount,
    };
  }

  private async getManagerStats(userId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get business metrics (same as Admin but without blog metrics)
    return this.getBusinessMetrics(startOfToday, startOfYesterday, startOfMonth);
  }

  private async getUserStats(userId: string): Promise<DashboardStatsDto> {
    // Get personal metrics only
    const [unreadNotifications, unreadMessages, fileUploads] = await Promise.all([
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
          deletedAt: null,
        },
      }),
      this.prisma.message.count({
        where: {
          conversation: {
            participants: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
          senderId: { not: userId },
          statuses: {
            none: {
              userId,
              status: 'READ',
            },
          },
          deletedAt: null,
        },
      }),
      this.prisma.upload.count({
        where: {
          uploadedById: userId,
          deletedAt: null,
        },
      }),
    ]);

    // Return minimal stats for regular users
    return {
      revenueToday: 0,
      revenueThisMonth: 0,
      revenueYesterday: 0,
      revenueChange: 0,
      ordersTotal: unreadNotifications, // Repurpose for notifications
      ordersPending: unreadMessages, // Repurpose for messages
      ordersProcessing: fileUploads, // Repurpose for file uploads
      ordersCompleted: 0,
      ordersCancelled: 0,
      customersTotal: 0,
      customersToday: 0,
      customersThisMonth: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalProducts: 0,
    };
  }

  private async getBusinessMetrics(
    startOfToday: Date,
    startOfYesterday: Date,
    startOfMonth: Date,
  ): Promise<DashboardStatsDto> {
    const endOfYesterday = startOfToday;

    // Execute all queries in parallel for performance
    const [
      revenueToday,
      revenueYesterday,
      revenueThisMonth,
      ordersByStatus,
      customersTotal,
      customersToday,
      customersYesterday,
      customersThisMonth,
      lowStockProducts,
      outOfStockProducts,
      totalProducts,
    ] = await Promise.all([
      // Revenue today
      this.prisma.order.aggregate({
        where: {
          status: { in: ['DELIVERED', 'SHIPPED'] },
          createdAt: { gte: startOfToday },
        },
        _sum: { total: true },
      }),
      // Revenue yesterday
      this.prisma.order.aggregate({
        where: {
          status: { in: ['DELIVERED', 'SHIPPED'] },
          createdAt: { gte: startOfYesterday, lt: endOfYesterday },
        },
        _sum: { total: true },
      }),
      // Revenue this month
      this.prisma.order.aggregate({
        where: {
          status: { in: ['DELIVERED', 'SHIPPED'] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Orders by status
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Total customers
      this.prisma.customer.count(),
      // Customers today
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      // Customers yesterday
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfYesterday, lt: endOfYesterday } },
      }),
      // Customers this month
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      // Low stock products (quantity <= lowStockThreshold AND quantity > 0)
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count
        FROM inventory
        WHERE quantity <= low_stock_threshold AND quantity > 0
      `.then(result => Number(result[0]?.count || 0)),
      // Out of stock products
      this.prisma.inventory.count({
        where: { quantity: 0 },
      }),
      // Total products
      this.prisma.product.count({
        where: { status: 'PUBLISHED' },
      }),
    ]);

    // Calculate revenue change percentage
    const revenueTodayValue = Number(revenueToday._sum.total || 0);
    const revenueYesterdayValue = Number(revenueYesterday._sum.total || 0);
    const revenueChange =
      revenueYesterdayValue > 0
        ? ((revenueTodayValue - revenueYesterdayValue) / revenueYesterdayValue) * 100
        : 0;

    // Calculate customer change percentage
    const customersChange =
      customersYesterday > 0
        ? ((customersToday - customersYesterday) / customersYesterday) * 100
        : 0;

    // Extract order counts by status
    const ordersPending = ordersByStatus.find(stat => stat.status === 'PENDING')?._count || 0;
    const ordersProcessing = ordersByStatus.find(stat => stat.status === 'PROCESSING')?._count || 0;
    const ordersCompleted = ordersByStatus.find(stat => stat.status === 'DELIVERED')?._count || 0;
    const ordersCancelled = ordersByStatus.find(stat => stat.status === 'CANCELLED')?._count || 0;
    const ordersTotal = ordersByStatus.reduce((sum, stat) => sum + stat._count, 0);

    return {
      revenueToday: revenueTodayValue,
      revenueThisMonth: Number(revenueThisMonth._sum.total || 0),
      revenueYesterday: revenueYesterdayValue,
      revenueChange,
      ordersTotal,
      ordersPending,
      ordersProcessing,
      ordersCompleted,
      ordersCancelled,
      customersTotal,
      customersToday,
      customersThisMonth,
      customersChange,
      lowStockCount: lowStockProducts,
      outOfStockCount: outOfStockProducts,
      totalProducts,
    };
  }

  async getRecentActivity(userId: string, role: string, limit: number = 10): Promise<ActivityDto[]> {
    // Validate limit
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    // Check cache first
    const cacheKey = `dashboard:activity:${userId}:${role}:${safeLimit}`;
    const cached = await this.cacheManager.get<ActivityDto[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Normalize role name to handle both formats
    const normalizedRole = role.toUpperCase().replace(/\s+/g, '_');

    // Fetch activity based on role
    let activities: ActivityDto[];
    switch (normalizedRole) {
      case 'SUPER_ADMIN':
        activities = await this.getSuperAdminActivity(safeLimit);
        break;
      case 'ADMIN':
        activities = await this.getAdminActivity(safeLimit);
        break;
      case 'MANAGER':
        activities = await this.getManagerActivity(safeLimit);
        break;
      case 'USER':
        activities = await this.getUserActivity(userId, safeLimit);
        break;
      default:
        throw new ForbiddenException(`Invalid role: ${role}`);
    }

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, activities, 300000);
    
    return activities;
  }

  private async getSuperAdminActivity(limit: number): Promise<ActivityDto[]> {
    const activities: ActivityDto[] = [];

    // Fetch recent email sends
    const emails = await this.prisma.emailLog.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        recipient: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

    emails.forEach(email => {
      activities.push({
        id: email.id,
        type: 'email',
        description: `Email "${email.subject}" sent to ${email.recipient}`,
        timestamp: email.createdAt,
        entityId: email.id,
        entityType: 'EmailLog',
        metadata: {
          recipient: email.recipient,
          subject: email.subject,
          status: email.status,
        },
      });
    });

    // Fetch recent user registrations
    const users = await this.prisma.user.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
      },
    });

    users.forEach(user => {
      activities.push({
        id: user.id,
        type: 'user',
        description: `New user registered: ${user.name || user.email}`,
        timestamp: user.createdAt,
        entityId: user.id,
        entityType: 'User',
        metadata: {
          email: user.email,
          name: user.name,
          roleId: user.roleId,
        },
      });
    });

    // Fetch recent user activity from activity logs
    const activityLogs = await this.prisma.activityLog.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        actorName: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        metadata: true,
      },
    });

    activityLogs.forEach(log => {
      activities.push({
        id: log.id,
        type: 'user',
        description: `${log.actorName} performed ${log.action}${log.entityType ? ` on ${log.entityType}` : ''}`,
        timestamp: log.createdAt,
        entityId: log.entityId || log.id,
        entityType: log.entityType || 'ActivityLog',
        metadata: log.metadata as Record<string, any>,
      });
    });

    // Sort all activities by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private async getAdminActivity(limit: number): Promise<ActivityDto[]> {
    const activities: ActivityDto[] = [];

    // Fetch recent orders
    const orders = await this.prisma.order.findMany({
      take: Math.ceil(limit / 4),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    orders.forEach(order => {
      const customerName = order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Guest';
      activities.push({
        id: order.id,
        type: 'order',
        description: `Order #${order.orderNumber} placed by ${customerName} - ${order.status}`,
        timestamp: order.createdAt,
        entityId: order.id,
        entityType: 'Order',
        metadata: {
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          customer: customerName,
        },
      });
    });

    // Fetch recent blog post publications
    const blogPosts = await this.prisma.blogPost.findMany({
      take: Math.ceil(limit / 4),
      where: {
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    blogPosts.forEach(post => {
      activities.push({
        id: post.id,
        type: 'blog',
        description: `Blog post "${post.title}" published by ${post.author?.name || post.author?.email || 'Unknown'}`,
        timestamp: post.publishedAt || new Date(),
        entityId: post.id,
        entityType: 'BlogPost',
        metadata: {
          title: post.title,
          slug: post.slug,
          author: post.author?.name || post.author?.email,
        },
      });
    });

    // Fetch recent customer registrations
    const customers = await this.prisma.customer.findMany({
      take: Math.ceil(limit / 4),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    customers.forEach(customer => {
      activities.push({
        id: customer.id,
        type: 'customer',
        description: `New customer registered: ${customer.firstName} ${customer.lastName}`,
        timestamp: customer.createdAt,
        entityId: customer.id,
        entityType: 'Customer',
        metadata: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
        },
      });
    });

    // Fetch recent product updates
    const products = await this.prisma.product.findMany({
      take: Math.ceil(limit / 4),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        sku: true,
        status: true,
        updatedAt: true,
      },
    });

    products.forEach(product => {
      activities.push({
        id: product.id,
        type: 'product',
        description: `Product "${product.name}" updated - ${product.status}`,
        timestamp: product.updatedAt,
        entityId: product.id,
        entityType: 'Product',
        metadata: {
          name: product.name,
          sku: product.sku,
          status: product.status,
        },
      });
    });

    // Sort all activities by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private async getManagerActivity(limit: number): Promise<ActivityDto[]> {
    const activities: ActivityDto[] = [];

    // Fetch recent orders
    const orders = await this.prisma.order.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    orders.forEach(order => {
      const customerName = order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Guest';
      activities.push({
        id: order.id,
        type: 'order',
        description: `Order #${order.orderNumber} placed by ${customerName} - ${order.status}`,
        timestamp: order.createdAt,
        entityId: order.id,
        entityType: 'Order',
        metadata: {
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          customer: customerName,
        },
      });
    });

    // Fetch recent inventory adjustments
    const inventoryAdjustments = await this.prisma.inventoryAdjustment.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quantityChange: true,
        reason: true,
        createdAt: true,
        inventory: {
          select: {
            quantity: true,
            productVariant: {
              select: {
                sku: true,
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    inventoryAdjustments.forEach(adjustment => {
      const productName = adjustment.inventory.productVariant.product.name;
      const sku = adjustment.inventory.productVariant.sku;
      activities.push({
        id: adjustment.id,
        type: 'inventory',
        description: `Inventory adjusted for "${productName}" - ${adjustment.reason} (${adjustment.quantityChange > 0 ? '+' : ''}${adjustment.quantityChange})`,
        timestamp: adjustment.createdAt,
        entityId: adjustment.id,
        entityType: 'InventoryAdjustment',
        metadata: {
          productName,
          sku,
          quantityChange: adjustment.quantityChange,
          reason: adjustment.reason,
          currentQuantity: adjustment.inventory.quantity,
        },
      });
    });

    // Fetch recent customer activity
    const customers = await this.prisma.customer.findMany({
      take: Math.ceil(limit / 3),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        updatedAt: true,
      },
    });

    customers.forEach(customer => {
      activities.push({
        id: customer.id,
        type: 'customer',
        description: `Customer activity: ${customer.firstName} ${customer.lastName}`,
        timestamp: customer.updatedAt,
        entityId: customer.id,
        entityType: 'Customer',
        metadata: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
        },
      });
    });

    // Sort all activities by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  private async getUserActivity(userId: string, limit: number): Promise<ActivityDto[]> {
    const activities: ActivityDto[] = [];

    // Fetch user's own notifications
    const notifications = await this.prisma.notification.findMany({
      take: Math.ceil(limit / 3),
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        category: true,
        createdAt: true,
      },
    });

    notifications.forEach(notification => {
      activities.push({
        id: notification.id,
        type: 'notification',
        description: notification.title,
        timestamp: notification.createdAt,
        entityId: notification.id,
        entityType: 'Notification',
        metadata: {
          message: notification.message,
          category: notification.category,
        },
      });
    });

    // Fetch user's own messages
    const messages = await this.prisma.message.findMany({
      take: Math.ceil(limit / 3),
      where: {
        conversation: {
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    messages.forEach(message => {
      const preview = message.content.length > 50 
        ? message.content.substring(0, 50) + '...' 
        : message.content;
      activities.push({
        id: message.id,
        type: 'message',
        description: `Message from ${message.sender?.name || message.sender?.email || 'Unknown'}: ${preview}`,
        timestamp: message.createdAt,
        entityId: message.id,
        entityType: 'Message',
        metadata: {
          sender: message.sender?.name || message.sender?.email,
          preview,
        },
      });
    });

    // Fetch user's own file uploads
    const uploads = await this.prisma.upload.findMany({
      take: Math.ceil(limit / 3),
      where: {
        uploadedById: userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });

    uploads.forEach(upload => {
      const sizeInKB = Math.round(upload.size / 1024);
      activities.push({
        id: upload.id,
        type: 'upload',
        description: `Uploaded file: ${upload.filename} (${sizeInKB} KB)`,
        timestamp: upload.createdAt,
        entityId: upload.id,
        entityType: 'Upload',
        metadata: {
          filename: upload.filename,
          mimeType: upload.mimeType,
          size: upload.size,
        },
      });
    });

    // Sort all activities by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getAlerts(userId: string, role: string): Promise<AlertDto[]> {
    // Check cache first
    const cacheKey = `dashboard:alerts:${userId}:${role}`;
    const cached = await this.cacheManager.get<AlertDto[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Normalize role name to handle both formats
    const normalizedRole = role.toUpperCase().replace(/\s+/g, '_');

    // Fetch alerts based on role
    let alerts: AlertDto[];
    switch (normalizedRole) {
      case 'SUPER_ADMIN':
        alerts = await this.getSuperAdminAlerts();
        break;
      case 'ADMIN':
        alerts = await this.getAdminAlerts();
        break;
      case 'MANAGER':
        alerts = await this.getManagerAlerts();
        break;
      case 'USER':
        alerts = await this.getUserAlerts(userId);
        break;
      default:
        throw new ForbiddenException(`Invalid role: ${role}`);
    }

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, alerts, 300000);
    
    return alerts;
  }

  private async getSuperAdminAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for failed email deliveries in last 24 hours
    const failedEmails = await this.prisma.emailLog.count({
      where: {
        status: { in: ['FAILED', 'BOUNCED'] },
        createdAt: { gte: last24Hours },
      },
    });

    if (failedEmails > 0) {
      alerts.push({
        id: 'email-failures',
        severity: 'error',
        title: 'Email Delivery Failures',
        message: `${failedEmails} email(s) failed to deliver in the last 24 hours`,
        timestamp: now,
        actionUrl: '/admin/email-logs',
        actionLabel: 'View Email Logs',
        dismissible: true,
      });
    }

    // Check for system errors in activity logs
    const systemErrors = await this.prisma.activityLog.count({
      where: {
        action: { contains: 'ERROR' },
        createdAt: { gte: last24Hours },
      },
    });

    if (systemErrors > 0) {
      alerts.push({
        id: 'system-errors',
        severity: 'critical',
        title: 'System Errors Detected',
        message: `${systemErrors} system error(s) logged in the last 24 hours`,
        timestamp: now,
        actionUrl: '/admin/activity-logs',
        actionLabel: 'View Activity Logs',
        dismissible: true,
      });
    }

    // Generate security alerts for failed login attempts
    const failedLogins = await this.prisma.activityLog.count({
      where: {
        action: { in: ['LOGIN_FAILED', 'FAILED_LOGIN'] },
        createdAt: { gte: last24Hours },
      },
    });

    if (failedLogins > 10) {
      alerts.push({
        id: 'failed-logins',
        severity: 'warning',
        title: 'Multiple Failed Login Attempts',
        message: `${failedLogins} failed login attempt(s) detected in the last 24 hours`,
        timestamp: now,
        actionUrl: '/admin/security-logs',
        actionLabel: 'View Security Logs',
        dismissible: true,
      });
    }

    return alerts;
  }

  private async getAdminAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for products with quantity <= reorder threshold
    const lowStockCount = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM inventory
      WHERE quantity <= low_stock_threshold AND quantity > 0
    `.then(result => Number(result[0]?.count || 0));

    if (lowStockCount > 0) {
      alerts.push({
        id: 'low-stock',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockCount} product(s) are running low on stock`,
        timestamp: now,
        actionUrl: '/admin/inventory',
        actionLabel: 'View Inventory',
        dismissible: true,
      });
    }

    // Check for pending orders older than 24 hours
    const oldPendingOrders = await this.prisma.order.count({
      where: {
        status: 'PENDING',
        createdAt: { lt: last24Hours },
      },
    });

    if (oldPendingOrders > 0) {
      alerts.push({
        id: 'old-pending-orders',
        severity: 'warning',
        title: 'Pending Orders Require Attention',
        message: `${oldPendingOrders} order(s) have been pending for more than 24 hours`,
        timestamp: now,
        actionUrl: '/admin/orders?status=PENDING',
        actionLabel: 'View Pending Orders',
        dismissible: true,
      });
    }

    // Check for failed payment transactions
    const failedPayments = await this.prisma.order.count({
      where: {
        paymentStatus: 'FAILED',
        createdAt: { gte: last24Hours },
      },
    });

    if (failedPayments > 0) {
      alerts.push({
        id: 'failed-payments',
        severity: 'error',
        title: 'Failed Payment Transactions',
        message: `${failedPayments} payment(s) failed in the last 24 hours`,
        timestamp: now,
        actionUrl: '/admin/orders?paymentStatus=FAILED',
        actionLabel: 'View Failed Payments',
        dismissible: true,
      });
    }

    return alerts;
  }

  private async getManagerAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];
    const now = new Date();

    // Check for products with quantity <= reorder threshold
    const lowStockCount = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM inventory
      WHERE quantity <= low_stock_threshold AND quantity > 0
    `.then(result => Number(result[0]?.count || 0));

    if (lowStockCount > 0) {
      alerts.push({
        id: 'low-stock',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockCount} product(s) are running low on stock`,
        timestamp: now,
        actionUrl: '/manager/inventory',
        actionLabel: 'View Inventory',
        dismissible: true,
      });
    }

    // Check for orders requiring fulfillment (status = processing)
    const processingOrders = await this.prisma.order.count({
      where: {
        status: 'PROCESSING',
      },
    });

    if (processingOrders > 0) {
      alerts.push({
        id: 'orders-to-fulfill',
        severity: 'info',
        title: 'Orders Awaiting Fulfillment',
        message: `${processingOrders} order(s) are ready for fulfillment`,
        timestamp: now,
        actionUrl: '/manager/orders?status=PROCESSING',
        actionLabel: 'View Orders',
        dismissible: true,
      });
    }

    return alerts;
  }

  private async getUserAlerts(userId: string): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];
    const now = new Date();

    // Count unread notifications
    const unreadNotifications = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    });

    if (unreadNotifications > 0) {
      alerts.push({
        id: 'unread-notifications',
        severity: 'info',
        title: 'Unread Notifications',
        message: `You have ${unreadNotifications} unread notification(s)`,
        timestamp: now,
        actionUrl: '/notifications',
        actionLabel: 'View Notifications',
        dismissible: false,
      });
    }

    // Count unread messages
    const unreadMessages = await this.prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
        senderId: { not: userId },
        statuses: {
          none: {
            userId,
            status: 'READ',
          },
        },
        deletedAt: null,
      },
    });

    if (unreadMessages > 0) {
      alerts.push({
        id: 'unread-messages',
        severity: 'info',
        title: 'Unread Messages',
        message: `You have ${unreadMessages} unread message(s)`,
        timestamp: now,
        actionUrl: '/messages',
        actionLabel: 'View Messages',
        dismissible: false,
      });
    }

    return alerts;
  }

  async getSystemHealth(): Promise<SystemHealthDto> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      cronLogStats,
      emailLogStats,
      activeUsersCount,
    ] = await Promise.all([
      // Cron job success rate (last 24 hours)
      this.prisma.cronLog.groupBy({
        by: ['status'],
        where: {
          startedAt: { gte: last24Hours },
        },
        _count: true,
      }).catch(() => [] as Array<{ status: string; _count: number }>), // Handle case where cron_logs table might not exist yet
      // Email delivery rate (last 24 hours)
      this.prisma.emailLog.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: last24Hours },
        },
        _count: true,
      }),
      // Active users count (last 30 days)
      this.prisma.user.count({
        where: {
          isActive: true,
          updatedAt: { gte: last30Days },
        },
      }),
    ]);

    // Calculate cron job success rate
    let totalCronJobs = 0;
    let successfulCronJobs = 0;
    for (const stat of cronLogStats) {
      totalCronJobs += stat._count;
      if (stat.status === 'SUCCESS') {
        successfulCronJobs += stat._count;
      }
    }
    const cronJobSuccessRate = totalCronJobs > 0 
      ? (successfulCronJobs / totalCronJobs) * 100 
      : 100;

    // Calculate email delivery rate
    const totalEmails = emailLogStats.reduce((sum, stat) => sum + stat._count, 0);
    const sentEmails = emailLogStats.find(stat => stat.status === 'SENT')?._count || 0;
    const emailDeliveryRate = totalEmails > 0 
      ? (sentEmails / totalEmails) * 100 
      : 100;

    // Check database status
    let databaseStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    // System uptime (placeholder - would need actual uptime tracking)
    const systemUptime = 99.9;

    return {
      cronJobSuccessRate: Math.round(cronJobSuccessRate * 100) / 100,
      emailDeliveryRate: Math.round(emailDeliveryRate * 100) / 100,
      activeUsersCount,
      databaseStatus,
      systemUptime,
    };
  }

  async getRevenueData(startDate: Date, endDate: Date, role: string) {
    // Check role permissions
    if (role === 'USER') {
      throw new ForbiddenException('Insufficient permissions to access revenue data');
    }

    // Check cache first
    const cacheKey = `dashboard:revenue:${startDate.toISOString()}:${endDate.toISOString()}:${role}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch completed orders within date range
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['DELIVERED', 'SHIPPED'] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            totalPrice: true,
            product: {
              select: {
                categories: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate daily revenue
    const dailyRevenueMap = new Map<string, { revenue: number; orders: number }>();
    
    // Initialize all dates in range with zero values
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyRevenueMap.set(dateKey, { revenue: 0, orders: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate revenue by date
    let totalRevenue = 0;
    let totalOrders = 0;

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const revenue = Number(order.total);
      
      const existing = dailyRevenueMap.get(dateKey) || { revenue: 0, orders: 0 };
      dailyRevenueMap.set(dateKey, {
        revenue: existing.revenue + revenue,
        orders: existing.orders + 1,
      });

      totalRevenue += revenue;
      totalOrders += 1;
    });

    // Convert map to array
    const daily = Array.from(dailyRevenueMap.entries()).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 
      ? Math.round((totalRevenue / totalOrders) * 100) / 100 
      : 0;

    // Calculate revenue by category
    const categoryRevenueMap = new Map<string, number>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const itemRevenue = Number(item.totalPrice);
        
        // Get first category (primary category)
        const category = item.product.categories[0]?.name || 'Uncategorized';
        
        const existing = categoryRevenueMap.get(category) || 0;
        categoryRevenueMap.set(category, existing + itemRevenue);
      });
    });

    // Convert category map to array and sort by revenue descending
    const byCategory = Array.from(categoryRevenueMap.entries())
      .map(([category, revenue]) => ({
        category,
        revenue: Math.round(revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const result = {
      daily,
      averageOrderValue,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      byCategory,
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getSalesData(startDate: Date, endDate: Date, role: string) {
    // Check role permissions
    if (role === 'USER') {
      throw new ForbiddenException('Insufficient permissions to access sales data');
    }

    // Check cache first
    const cacheKey = `dashboard:sales:${startDate.toISOString()}:${endDate.toISOString()}:${role}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch completed order items within date range with product and category information
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ['DELIVERED', 'SHIPPED'] },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: {
        id: true,
        productId: true,
        productName: true,
        sku: true,
        quantity: true,
        totalPrice: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            categories: {
              select: {
                name: true,
              },
              take: 1, // Get primary category only
            },
          },
        },
      },
    });

    // Aggregate sales by product
    const productSalesMap = new Map<string, {
      id: string;
      name: string;
      sku: string;
      category: string;
      quantitySold: number;
      revenue: number;
    }>();

    // Aggregate sales by category
    const categorySalesMap = new Map<string, {
      quantity: number;
      revenue: number;
    }>();

    orderItems.forEach(item => {
      const productId = item.productId;
      const productName = item.product.name;
      const sku = item.product.sku || item.sku || 'N/A';
      const category = item.product.categories[0]?.name || 'Uncategorized';
      const quantity = item.quantity;
      const revenue = Number(item.totalPrice);

      // Aggregate by product
      const existing = productSalesMap.get(productId);
      if (existing) {
        existing.quantitySold += quantity;
        existing.revenue += revenue;
      } else {
        productSalesMap.set(productId, {
          id: productId,
          name: productName,
          sku,
          category,
          quantitySold: quantity,
          revenue,
        });
      }

      // Aggregate by category
      const categoryExisting = categorySalesMap.get(category);
      if (categoryExisting) {
        categoryExisting.quantity += quantity;
        categoryExisting.revenue += revenue;
      } else {
        categorySalesMap.set(category, {
          quantity,
          revenue,
        });
      }
    });

    // Convert product map to array, sort by quantity sold descending, and take top 10
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10)
      .map(product => ({
        ...product,
        revenue: Math.round(product.revenue * 100) / 100,
      }));

    // Convert category map to array and sort by revenue descending
    const byCategory = Array.from(categorySalesMap.entries())
      .map(([category, data]) => ({
        category,
        quantity: data.quantity,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const result = {
      topProducts,
      byCategory,
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getInventoryData(role: string): Promise<InventoryDataDto> {
    // Check role permissions
    if (role === 'USER') {
      throw new ForbiddenException('Insufficient permissions to access inventory data');
    }

    // Check cache first
    const cacheKey = `dashboard:inventory:${role}`;
    const cached = await this.cacheManager.get<InventoryDataDto>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch low stock products (quantity <= reorderThreshold AND quantity > 0)
    const lowStockProducts = await this.prisma.$queryRaw<Array<{
      id: string;
      product_id: string;
      product_name: string;
      sku: string;
      quantity: number;
      low_stock_threshold: number;
      price: string;
    }>>`
      SELECT 
        i.id,
        pv.product_id,
        p.name as product_name,
        pv.sku,
        i.quantity,
        i.low_stock_threshold,
        pv.price
      FROM inventory i
      INNER JOIN product_variants pv ON i.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE i.quantity <= i.low_stock_threshold 
        AND i.quantity > 0
      ORDER BY i.quantity ASC
    `;

    // Fetch out of stock products (quantity = 0)
    const outOfStockProducts = await this.prisma.$queryRaw<Array<{
      id: string;
      product_id: string;
      product_name: string;
      sku: string;
    }>>`
      SELECT 
        i.id,
        pv.product_id,
        p.name as product_name,
        pv.sku
      FROM inventory i
      INNER JOIN product_variants pv ON i.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE i.quantity = 0
      ORDER BY p.name ASC
    `;

    // Calculate total inventory value
    const inventoryValue = await this.prisma.$queryRaw<Array<{ total_value: string }>>`
      SELECT COALESCE(SUM(i.quantity * pv.price), 0)::text as total_value
      FROM inventory i
      INNER JOIN product_variants pv ON i.product_variant_id = pv.id
    `;

    // Map low stock products to DTO
    const lowStock = lowStockProducts.map(product => ({
      id: product.product_id,
      name: product.product_name,
      sku: product.sku,
      quantity: product.quantity,
      reorderThreshold: product.low_stock_threshold,
      price: Math.round(Number(product.price) * 100) / 100,
    }));

    // Map out of stock products to DTO
    const outOfStock = outOfStockProducts.map(product => ({
      id: product.product_id,
      name: product.product_name,
      sku: product.sku,
    }));

    // Calculate total value
    const totalValue = Math.round(Number(inventoryValue[0]?.total_value || 0) * 100) / 100;

    const result = {
      lowStock,
      outOfStock,
      totalValue,
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getContentMetrics(role: string): Promise<ContentMetricsDto> {
    // Check role permissions - only Admin can access content metrics
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions to access content metrics');
    }

    // Check cache first
    const cacheKey = `dashboard:content:${role}`;
    const cached = await this.cacheManager.get<ContentMetricsDto>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Execute all queries in parallel for performance
    const [
      blogPostCounts,
      recentPublishedPosts,
      customPagesCount,
      landingPagesCount,
    ] = await Promise.all([
      // Blog post counts grouped by status
      this.prisma.blogPost.groupBy({
        by: ['status'],
        _count: true,
      }),
      // 5 most recently published blog posts
      this.prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
        },
        take: 5,
        orderBy: {
          publishedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      // Custom pages count
      this.prisma.customPage.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
      // Landing pages count (active landing page content)
      this.prisma.landingPageContent.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    // Extract blog post counts by status
    const blogPostsDraft = blogPostCounts.find(stat => stat.status === 'DRAFT')?._count || 0;
    const blogPostsPublished = blogPostCounts.find(stat => stat.status === 'PUBLISHED')?._count || 0;
    const blogPostsArchived = blogPostCounts.find(stat => stat.status === 'ARCHIVED')?._count || 0;

    // Map recent posts to DTO
    const recentPosts = recentPublishedPosts.map(post => ({
      id: post.id,
      title: post.title,
      author: post.author?.name || post.author?.email || 'Unknown',
      publishedAt: post.publishedAt || new Date(),
    }));

    const result = {
      blogPostsDraft,
      blogPostsPublished,
      blogPostsArchived,
      recentPosts,
      customPagesCount,
      landingPagesCount,
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  async getUserMetrics(role: string): Promise<UserMetricsDto> {
    // Check role permissions - only Super Admin and Admin can access user metrics
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions to access user metrics');
    }

    // Check cache first
    const cacheKey = `dashboard:users:${role}`;
    const cached = await this.cacheManager.get<UserMetricsDto>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      totalUsers,
      activeUsers,
      newRegistrationsToday,
      usersByRole,
    ] = await Promise.all([
      // Total users count
      this.prisma.user.count(),
      // Active users count (logged in within last 30 days)
      this.prisma.user.count({
        where: {
          isActive: true,
          updatedAt: { gte: last30Days },
        },
      }),
      // New registrations today
      this.prisma.user.count({
        where: {
          createdAt: { gte: startOfToday },
        },
      }),
      // User counts grouped by role
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: true,
      }),
    ]);

    // Fetch role names for the grouped results
    const roleIds = usersByRole.map(stat => stat.roleId);
    const roles = await this.prisma.userRole.findMany({
      where: {
        id: { in: roleIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create a map of roleId to role name
    const roleMap = new Map<string, string>(roles.map(role => [role.id, role.name]));

    // Map user counts by role with role names
    const usersByRoleWithNames = usersByRole.map(stat => ({
      role: roleMap.get(stat.roleId) || 'Unknown',
      count: stat._count,
    }));

    const result = {
      totalUsers,
      activeUsers,
      newRegistrationsToday,
      usersByRole: usersByRoleWithNames,
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }
}
