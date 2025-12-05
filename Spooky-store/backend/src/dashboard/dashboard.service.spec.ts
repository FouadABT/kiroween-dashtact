import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockPrismaService = {
    order: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    customer: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    productVariant: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    blogPost: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    page: {
      count: jest.fn(),
    },
    cronLog: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    emailLog: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    notification: {
      count: jest.fn(),
    },
    message: {
      count: jest.fn(),
    },
    upload: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatsForRole', () => {
    const userId = 'test-user-id';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    beforeEach(() => {
      mockCacheManager.get.mockResolvedValue(null);
    });

    describe('Super Admin Stats', () => {
      it('should return Super Admin stats with system metrics', async () => {
        // Mock cron job success rate
        mockPrismaService.cronLog.count
          .mockResolvedValueOnce(100) // total
          .mockResolvedValueOnce(95); // successful

        // Mock email delivery rate
        mockPrismaService.emailLog.count
          .mockResolvedValueOnce(200) // total
          .mockResolvedValueOnce(190); // delivered

        // Mock active users
        mockPrismaService.user.count.mockResolvedValue(50);

        // Mock business metrics
        mockPrismaService.order.aggregate
          .mockResolvedValueOnce({ _sum: { total: 5000 } }) // today
          .mockResolvedValueOnce({ _sum: { total: 4500 } }) // yesterday
          .mockResolvedValueOnce({ _sum: { total: 150000 } }); // this month

        mockPrismaService.order.groupBy.mockResolvedValue([
          { status: 'PENDING', _count: { _all: 10 } },
          { status: 'PROCESSING', _count: { _all: 5 } },
          { status: 'COMPLETED', _count: { _all: 100 } },
          { status: 'CANCELLED', _count: { _all: 2 } },
        ]);

        mockPrismaService.customer.count
          .mockResolvedValueOnce(1000) // total
          .mockResolvedValueOnce(15); // today

        mockPrismaService.productVariant.count
          .mockResolvedValueOnce(5) // low stock
          .mockResolvedValueOnce(2); // out of stock

        mockPrismaService.blogPost.groupBy.mockResolvedValue([
          { status: 'DRAFT', _count: { _all: 10 } },
          { status: 'PUBLISHED', _count: { _all: 50 } },
        ]);

        const result = await service.getStatsForRole(userId, 'SUPER_ADMIN');

        expect(result.cronJobSuccessRate).toBe(95);
        expect(result.emailDeliveryRate).toBe(95);
        expect(result.activeUsersCount).toBe(50);
        expect(result.revenueToday).toBe(5000);
        expect(result.revenueThisMonth).toBe(150000);
        expect(result.ordersPending).toBe(10);
        expect(result.ordersCompleted).toBe(100);
        expect(result.customersTotal).toBe(1000);
        expect(result.lowStockCount).toBe(5);
        expect(result.blogPostsDraft).toBe(10);
        expect(result.blogPostsPublished).toBe(50);
      });

      it('should handle zero cron jobs gracefully', async () => {
        mockPrismaService.cronLog.count
          .mockResolvedValueOnce(0) // total
          .mockResolvedValueOnce(0); // successful

        mockPrismaService.emailLog.count
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(95);

        mockPrismaService.user.count.mockResolvedValue(50);
        mockPrismaService.order.aggregate.mockResolvedValue({ _sum: { total: 0 } });
        mockPrismaService.order.groupBy.mockResolvedValue([]);
        mockPrismaService.customer.count.mockResolvedValue(0);
        mockPrismaService.productVariant.count.mockResolvedValue(0);
        mockPrismaService.blogPost.groupBy.mockResolvedValue([]);

        const result = await service.getStatsForRole(userId, 'SUPER_ADMIN');

        expect(result.cronJobSuccessRate).toBe(0);
        expect(result.emailDeliveryRate).toBe(95);
      });
    });

    describe('Admin Stats', () => {
      it('should return Admin stats without system metrics', async () => {
        mockPrismaService.order.aggregate
          .mockResolvedValueOnce({ _sum: { total: 5000 } })
          .mockResolvedValueOnce({ _sum: { total: 4500 } })
          .mockResolvedValueOnce({ _sum: { total: 150000 } });

        mockPrismaService.order.groupBy.mockResolvedValue([
          { status: 'PENDING', _count: { _all: 10 } },
          { status: 'COMPLETED', _count: { _all: 100 } },
        ]);

        mockPrismaService.customer.count
          .mockResolvedValueOnce(1000)
          .mockResolvedValueOnce(15);

        mockPrismaService.productVariant.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(2);

        mockPrismaService.blogPost.groupBy.mockResolvedValue([
          { status: 'DRAFT', _count: { _all: 10 } },
          { status: 'PUBLISHED', _count: { _all: 50 } },
        ]);

        mockPrismaService.page.count.mockResolvedValue(20);

        const result = await service.getStatsForRole(userId, 'ADMIN');

        expect(result.cronJobSuccessRate).toBeUndefined();
        expect(result.emailDeliveryRate).toBeUndefined();
        expect(result.activeUsersCount).toBeUndefined();
        expect(result.revenueToday).toBe(5000);
        expect(result.blogPostsDraft).toBe(10);
        expect(result.customPagesCount).toBe(20);
      });

      it('should calculate revenue change percentage correctly', async () => {
        mockPrismaService.order.aggregate
          .mockResolvedValueOnce({ _sum: { total: 6000 } }) // today
          .mockResolvedValueOnce({ _sum: { total: 5000 } }) // yesterday
          .mockResolvedValueOnce({ _sum: { total: 150000 } }); // this month

        mockPrismaService.order.groupBy.mockResolvedValue([]);
        mockPrismaService.customer.count.mockResolvedValue(0);
        mockPrismaService.productVariant.count.mockResolvedValue(0);
        mockPrismaService.blogPost.groupBy.mockResolvedValue([]);
        mockPrismaService.page.count.mockResolvedValue(0);

        const result = await service.getStatsForRole(userId, 'ADMIN');

        expect(result.revenueToday).toBe(6000);
        expect(result.revenueYesterday).toBe(5000);
        expect(result.revenueChange).toBe(20); // (6000 - 5000) / 5000 * 100
      });
    });

    describe('Manager Stats', () => {
      it('should return Manager stats without blog metrics', async () => {
        mockPrismaService.order.aggregate
          .mockResolvedValueOnce({ _sum: { total: 5000 } })
          .mockResolvedValueOnce({ _sum: { total: 4500 } })
          .mockResolvedValueOnce({ _sum: { total: 150000 } });

        mockPrismaService.order.groupBy.mockResolvedValue([
          { status: 'PENDING', _count: { _all: 10 } },
          { status: 'COMPLETED', _count: { _all: 100 } },
        ]);

        mockPrismaService.customer.count
          .mockResolvedValueOnce(1000)
          .mockResolvedValueOnce(15);

        mockPrismaService.productVariant.count
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(2);

        const result = await service.getStatsForRole(userId, 'MANAGER');

        expect(result.blogPostsDraft).toBeUndefined();
        expect(result.blogPostsPublished).toBeUndefined();
        expect(result.customPagesCount).toBeUndefined();
        expect(result.revenueToday).toBe(5000);
        expect(result.lowStockCount).toBe(5);
      });
    });

    describe('User Stats', () => {
      it('should return User stats with only personal metrics', async () => {
        mockPrismaService.notification.count.mockResolvedValue(5);
        mockPrismaService.message.count.mockResolvedValue(3);
        mockPrismaService.upload.count.mockResolvedValue(10);

        const result = await service.getStatsForRole(userId, 'USER');

        expect(result.revenueToday).toBeUndefined();
        expect(result.ordersTotal).toBeUndefined();
        expect(result.customersTotal).toBeUndefined();
        expect(result.notificationsUnread).toBe(5);
        expect(result.messagesUnread).toBe(3);
        expect(result.fileUploads).toBe(10);
      });
    });

    it('should throw ForbiddenException for invalid role', async () => {
      await expect(
        service.getStatsForRole(userId, 'INVALID_ROLE'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should use cache when available', async () => {
      const cachedStats = {
        revenueToday: 5000,
        revenueThisMonth: 150000,
      };

      mockCacheManager.get.mockResolvedValue(cachedStats);

      const result = await service.getStatsForRole(userId, 'ADMIN');

      expect(result).toEqual(cachedStats);
      expect(mockPrismaService.order.aggregate).not.toHaveBeenCalled();
    });

    it('should cache stats after fetching', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.order.aggregate.mockResolvedValue({ _sum: { total: 5000 } });
      mockPrismaService.order.groupBy.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(0);
      mockPrismaService.productVariant.count.mockResolvedValue(0);
      mockPrismaService.blogPost.groupBy.mockResolvedValue([]);
      mockPrismaService.page.count.mockResolvedValue(0);

      await service.getStatsForRole(userId, 'ADMIN');

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `dashboard:stats:${userId}:ADMIN`,
        expect.any(Object),
        300000, // 5 minutes
      );
    });
  });

  describe('getAlerts', () => {
    const userId = 'test-user-id';

    beforeEach(() => {
      mockCacheManager.get.mockResolvedValue(null);
    });

    it('should return Super Admin alerts', async () => {
      mockPrismaService.cronLog.count.mockResolvedValue(5);
      mockPrismaService.emailLog.count.mockResolvedValue(10);

      const result = await service.getAlerts(userId, 'SUPER_ADMIN');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(alert => alert.severity === 'error')).toBe(true);
    });

    it('should return Admin alerts for low stock', async () => {
      mockPrismaService.productVariant.count.mockResolvedValue(5);
      mockPrismaService.order.count.mockResolvedValue(3);

      const result = await service.getAlerts(userId, 'ADMIN');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return Manager alerts', async () => {
      mockPrismaService.productVariant.count.mockResolvedValue(5);
      mockPrismaService.order.count.mockResolvedValue(10);

      const result = await service.getAlerts(userId, 'MANAGER');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return User alerts', async () => {
      mockPrismaService.notification.count.mockResolvedValue(5);
      mockPrismaService.message.count.mockResolvedValue(3);

      const result = await service.getAlerts(userId, 'USER');

      expect(Array.isArray(result)).toBe(true);
      expect(result.every(alert => alert.severity === 'info')).toBe(true);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health metrics', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.cronLog.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(95);

      mockPrismaService.emailLog.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(190);

      mockPrismaService.user.count.mockResolvedValue(50);

      const result = await service.getSystemHealth();

      expect(result.cronJobSuccessRate).toBe(95);
      expect(result.emailDeliveryRate).toBe(95);
      expect(result.activeUsersCount).toBe(50);
      expect(result.databaseStatus).toBe('healthy');
    });
  });

  describe('getRevenueData', () => {
    it('should return revenue data for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.order.findMany.mockResolvedValue([
        {
          id: '1',
          total: 100,
          createdAt: new Date('2024-01-15'),
          orderItems: [
            {
              product: { category: { name: 'Electronics' } },
              quantity: 1,
              price: 100,
            },
          ],
        },
      ]);

      const result = await service.getRevenueData(startDate, endDate, 'ADMIN');

      expect(result.totalRevenue).toBeDefined();
      expect(result.totalOrders).toBeDefined();
      expect(result.averageOrderValue).toBeDefined();
      expect(Array.isArray(result.daily)).toBe(true);
      expect(Array.isArray(result.byCategory)).toBe(true);
    });

    it('should throw ForbiddenException for USER role', async () => {
      const startDate = new Date();
      const endDate = new Date();

      await expect(
        service.getRevenueData(startDate, endDate, 'USER'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSalesData', () => {
    it('should return sales data with top products', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.order.findMany.mockResolvedValue([
        {
          orderItems: [
            {
              productVariantId: 'variant-1',
              productVariant: {
                product: {
                  name: 'Product 1',
                  sku: 'SKU-1',
                  category: { name: 'Electronics' },
                },
              },
              quantity: 5,
              price: 100,
            },
          ],
        },
      ]);

      const result = await service.getSalesData(startDate, endDate, 'ADMIN');

      expect(Array.isArray(result.topProducts)).toBe(true);
      expect(Array.isArray(result.byCategory)).toBe(true);
      expect(result.topProducts.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getInventoryData', () => {
    it('should return inventory data with low stock items', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-1',
          product: { name: 'Product 1' },
          sku: 'SKU-1',
          quantity: 5,
          reorderThreshold: 10,
          price: 100,
        },
      ]);

      const result = await service.getInventoryData('ADMIN');

      expect(Array.isArray(result.lowStock)).toBe(true);
      expect(Array.isArray(result.outOfStock)).toBe(true);
      expect(result.totalValue).toBeDefined();
    });
  });

  describe('getContentMetrics', () => {
    it('should return content metrics for Admin', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.blogPost.groupBy.mockResolvedValue([
        { status: 'DRAFT', _count: { _all: 10 } },
        { status: 'PUBLISHED', _count: { _all: 50 } },
      ]);

      mockPrismaService.blogPost.findMany.mockResolvedValue([
        {
          id: '1',
          title: 'Post 1',
          author: { name: 'Author 1' },
          publishedAt: new Date(),
        },
      ]);

      mockPrismaService.page.count.mockResolvedValue(20);

      const result = await service.getContentMetrics('ADMIN');

      expect(result.blogPostsDraft).toBe(10);
      expect(result.blogPostsPublished).toBe(50);
      expect(result.customPagesCount).toBe(20);
      expect(Array.isArray(result.recentPosts)).toBe(true);
    });

    it('should throw ForbiddenException for Manager role', async () => {
      await expect(service.getContentMetrics('MANAGER')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserMetrics', () => {
    it('should return user metrics for Super Admin', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.user.count
        .mockResolvedValueOnce(1000) // total
        .mockResolvedValueOnce(500) // active
        .mockResolvedValueOnce(15); // today

      mockPrismaService.user.groupBy.mockResolvedValue([
        { roleId: 'role-1', _count: { _all: 900 } },
        { roleId: 'role-2', _count: { _all: 100 } },
      ]);

      const result = await service.getUserMetrics('SUPER_ADMIN');

      expect(result.totalUsers).toBe(1000);
      expect(result.activeUsers).toBe(500);
      expect(result.newUsersToday).toBe(15);
      expect(Array.isArray(result.byRole)).toBe(true);
    });

    it('should allow Admin to view user metrics', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.user.count.mockResolvedValue(1000);
      mockPrismaService.user.groupBy.mockResolvedValue([]);

      const result = await service.getUserMetrics('ADMIN');

      expect(result.totalUsers).toBe(1000);
    });

    it('should throw ForbiddenException for Manager role', async () => {
      await expect(service.getUserMetrics('MANAGER')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
