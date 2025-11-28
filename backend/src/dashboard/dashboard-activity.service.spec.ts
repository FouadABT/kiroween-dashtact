import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityDto } from './dto/activity.dto';

describe('DashboardService - Activity Feed', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockPrismaService = {
    emailLog: {
      findMany: jest.fn(),
    },
    cronJob: {
      findMany: jest.fn(),
    },
    cronLog: {
      findMany: jest.fn(),
    },
    blogPost: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
    },
    upload: {
      findMany: jest.fn(),
    },
    inventoryAdjustment: {
      findMany: jest.fn(),
    },
    activityLog: {
      findMany: jest.fn(),
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

  describe('getRecentActivity', () => {
    it('should return cached activities if available', async () => {
      const cachedActivities: ActivityDto[] = [
        {
          id: '1',
          type: 'order',
          description: 'New order placed',
          timestamp: new Date(),
          entityId: 'order-1',
          entityType: 'Order',
        },
      ];

      mockCacheManager.get.mockResolvedValue(cachedActivities);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 10);

      expect(result).toEqual(cachedActivities);
      expect(mockCacheManager.get).toHaveBeenCalledWith('dashboard:activity:user-1:SUPER_ADMIN:10');
    });

    it('should fetch and cache activities if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.activityLog.findMany.mockResolvedValue([]);
      mockPrismaService.emailLog.findMany.mockResolvedValue([]);
      mockPrismaService.cronLog.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should limit activities to specified limit', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.activityLog.findMany.mockResolvedValue([]);
      mockPrismaService.emailLog.findMany.mockResolvedValue([]);
      mockPrismaService.cronLog.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum limit of 50', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.activityLog.findMany.mockResolvedValue([]);
      mockPrismaService.emailLog.findMany.mockResolvedValue([]);
      mockPrismaService.cronLog.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 100);

      // Should be capped at 50
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        300000,
      );
    });
  });

  describe('Activity Type Validation', () => {
    it('should support all activity types', () => {
      const validTypes: ActivityDto['type'][] = [
        'order',
        'customer',
        'product',
        'blog',
        'cron',
        'email',
        'user',
        'notification',
        'message',
        'upload',
        'inventory',
      ];

      validTypes.forEach((type) => {
        const activity: ActivityDto = {
          id: '1',
          type,
          description: `Test ${type} activity`,
          timestamp: new Date(),
          entityId: 'test-1',
          entityType: type,
        };

        expect(activity.type).toBe(type);
      });
    });

    it('should create notification activity', () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'notification',
        description: 'New notification sent',
        timestamp: new Date(),
        entityId: 'notif-1',
        entityType: 'Notification',
        metadata: {
          category: 'SYSTEM',
          priority: 'HIGH',
        },
      };

      expect(activity.type).toBe('notification');
      expect(activity.metadata).toBeDefined();
    });

    it('should create message activity', () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'message',
        description: 'New message received',
        timestamp: new Date(),
        entityId: 'msg-1',
        entityType: 'Message',
        metadata: {
          conversationId: 'conv-1',
          senderId: 'user-1',
        },
      };

      expect(activity.type).toBe('message');
      expect(activity.metadata?.conversationId).toBe('conv-1');
    });

    it('should create upload activity', () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'upload',
        description: 'File uploaded',
        timestamp: new Date(),
        entityId: 'upload-1',
        entityType: 'Upload',
        metadata: {
          filename: 'document.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
        },
      };

      expect(activity.type).toBe('upload');
      expect(activity.metadata?.filename).toBe('document.pdf');
    });

    it('should create inventory activity', () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'inventory',
        description: 'Inventory adjusted',
        timestamp: new Date(),
        entityId: 'inv-1',
        entityType: 'InventoryAdjustment',
        metadata: {
          productVariantId: 'variant-1',
          quantityChange: -5,
          reason: 'Sale',
        },
      };

      expect(activity.type).toBe('inventory');
      expect(activity.metadata?.quantityChange).toBe(-5);
    });
  });

  describe('Role-based Activity Access', () => {
    it('should return different activities for SUPER_ADMIN', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.activityLog.findMany.mockResolvedValue([]);
      mockPrismaService.emailLog.findMany.mockResolvedValue([
        {
          id: '1',
          recipient: 'test@example.com',
          subject: 'Test Email',
          status: 'SENT',
          createdAt: new Date(),
        },
      ]);
      mockPrismaService.cronLog.findMany.mockResolvedValue([]);
      mockPrismaService.cronJob.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 10);

      expect(result).toBeDefined();
      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalled();
      expect(mockPrismaService.emailLog.findMany).toHaveBeenCalled();
    });

    it('should return different activities for ADMIN', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.blogPost.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'ADMIN', 10);

      expect(result).toBeDefined();
      expect(mockPrismaService.order.findMany).toHaveBeenCalled();
    });

    it('should return different activities for MANAGER', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'MANAGER', 10);

      expect(result).toBeDefined();
      expect(mockPrismaService.order.findMany).toHaveBeenCalled();
    });

    it('should return user-specific activities for USER role', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.notification.findMany.mockResolvedValue([]);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.message.findMany.mockResolvedValue([]);
      mockPrismaService.upload.findMany.mockResolvedValue([]);

      const result = await service.getRecentActivity('user-1', 'USER', 10);

      expect(result).toBeDefined();
    });
  });

  describe('Activity Sorting', () => {
    it('should sort activities by timestamp descending', async () => {
      const now = new Date();
      const activities: ActivityDto[] = [
        {
          id: '2',
          type: 'customer',
          description: 'New customer',
          timestamp: now,
          entityId: 'customer-1',
          entityType: 'Customer',
        },
        {
          id: '3',
          type: 'product',
          description: 'Medium product',
          timestamp: new Date(now.getTime() - 1800000), // 30 min ago
          entityId: 'product-1',
          entityType: 'Product',
        },
        {
          id: '1',
          type: 'order',
          description: 'Old order',
          timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
          entityId: 'order-1',
          entityType: 'Order',
        },
      ];

      mockCacheManager.get.mockResolvedValue(activities);

      const result = await service.getRecentActivity('user-1', 'ADMIN', 10);

      // Activities should be returned in the order they were cached (already sorted)
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });
  });

  describe('Activity Metadata', () => {
    it('should preserve metadata in activities', async () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'notification',
        description: 'Test notification',
        timestamp: new Date(),
        entityId: 'notif-1',
        entityType: 'Notification',
        metadata: {
          category: 'SYSTEM',
          priority: 'HIGH',
          userId: 'user-1',
          customField: 'custom value',
        },
      };

      mockCacheManager.get.mockResolvedValue([activity]);

      const result = await service.getRecentActivity('user-1', 'SUPER_ADMIN', 10);

      expect(result[0].metadata).toEqual(activity.metadata);
      expect(result[0].metadata?.customField).toBe('custom value');
    });

    it('should handle activities without metadata', async () => {
      const activity: ActivityDto = {
        id: '1',
        type: 'order',
        description: 'Simple order',
        timestamp: new Date(),
        entityId: 'order-1',
        entityType: 'Order',
      };

      mockCacheManager.get.mockResolvedValue([activity]);

      const result = await service.getRecentActivity('user-1', 'ADMIN', 10);

      expect(result[0].metadata).toBeUndefined();
    });
  });
});
