import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

describe('ActivityLogService', () => {
  let service: ActivityLogService;

  const mockPrismaService = {
    activityLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logActivity', () => {
    const mockLog = {
      id: 'log123',
      action: 'USER_LOGIN',
      userId: 'user123',
      actorName: 'John Doe',
      entityType: 'User',
      entityId: 'user123',
      metadata: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
    };

    it('should create an activity log with all fields', async () => {
      mockPrismaService.activityLog.create.mockResolvedValue(mockLog);

      const result = await service.logActivity({
        action: 'USER_LOGIN',
        userId: 'user123',
        actorName: 'John Doe',
        entityType: 'User',
        entityId: 'user123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(result).toBeDefined();
      expect(result?.action).toBe('USER_LOGIN');
      expect(result?.userId).toBe('user123');
      expect(result?.actorName).toBe('John Doe');
      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'USER_LOGIN',
          userId: 'user123',
          actorName: 'John Doe',
          entityType: 'User',
          entityId: 'user123',
        }),
      });
    });

    it('should extract IP address from request', async () => {
      mockPrismaService.activityLog.create.mockResolvedValue(mockLog);

      const mockRequest = {
        ip: '192.168.1.1',
        headers: { 'user-agent': 'Mozilla/5.0' },
      } as unknown as Request;

      await service.logActivity(
        {
          action: 'USER_LOGIN',
          userId: 'user123',
          actorName: 'John Doe',
        },
        mockRequest,
      );

      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      });
    });

    it('should fetch user name if userId provided without actorName', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      });
      mockPrismaService.activityLog.create.mockResolvedValue(mockLog);

      await service.logActivity({
        action: 'USER_LOGIN',
        userId: 'user123',
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { name: true, email: true },
      });
      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorName: 'John Doe',
        }),
      });
    });

    it('should use email if user name not available', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: null,
        email: 'john@example.com',
      });
      mockPrismaService.activityLog.create.mockResolvedValue({
        ...mockLog,
        actorName: 'john@example.com',
      });

      await service.logActivity({
        action: 'USER_LOGIN',
        userId: 'user123',
      });

      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorName: 'john@example.com',
        }),
      });
    });

    it('should use "System" as actorName if no userId or actorName provided', async () => {
      mockPrismaService.activityLog.create.mockResolvedValue({
        ...mockLog,
        userId: null,
        actorName: 'System',
      });

      await service.logActivity({
        action: 'SYSTEM_STARTUP',
      });

      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorName: 'System',
        }),
      });
    });

    it('should handle metadata as JSON', async () => {
      const metadata = { oldValue: 'test', newValue: 'updated' };
      mockPrismaService.activityLog.create.mockResolvedValue({
        ...mockLog,
        metadata,
      });

      await service.logActivity({
        action: 'USER_UPDATED',
        userId: 'user123',
        actorName: 'John Doe',
        metadata,
      });

      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata,
        }),
      });
    });

    it('should gracefully handle logging failures', async () => {
      mockPrismaService.activityLog.create.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.logActivity({
        action: 'USER_LOGIN',
        userId: 'user123',
        actorName: 'John Doe',
      });

      expect(result).toBeNull();
    });

    it('should handle user fetch failures gracefully', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('User not found'),
      );
      mockPrismaService.activityLog.create.mockResolvedValue({
        ...mockLog,
        actorName: 'Unknown User',
      });

      await service.logActivity({
        action: 'USER_LOGIN',
        userId: 'user123',
      });

      expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorName: 'Unknown User',
        }),
      });
    });
  });

  describe('findAll', () => {
    const mockLogs = [
      {
        id: 'log1',
        action: 'USER_LOGIN',
        userId: 'user123',
        actorName: 'John Doe',
        entityType: 'User',
        entityId: 'user123',
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      },
      {
        id: 'log2',
        action: 'USER_LOGOUT',
        userId: 'user123',
        actorName: 'John Doe',
        entityType: 'User',
        entityId: 'user123',
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      },
    ];

    it('should return paginated logs with default parameters', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.activityLog.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by userId', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue([mockLogs[0]]);
      mockPrismaService.activityLog.count.mockResolvedValue(1);

      await service.findAll({ userId: 'user123' });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should filter by entityType', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.activityLog.count.mockResolvedValue(2);

      await service.findAll({ entityType: 'User' });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: { entityType: 'User' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should filter by action', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue([mockLogs[0]]);
      mockPrismaService.activityLog.count.mockResolvedValue(1);

      await service.findAll({ action: 'USER_LOGIN' });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: { action: 'USER_LOGIN' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should filter by date range', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.activityLog.count.mockResolvedValue(2);

      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await service.findAll({ startDate, endDate });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.activityLog.count.mockResolvedValue(100);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(10);
    });

    it('should support ascending sort order', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.activityLog.count.mockResolvedValue(2);

      await service.findAll({ sortOrder: 'asc' });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 50,
      });
    });

    it('should combine multiple filters', async () => {
      mockPrismaService.activityLog.findMany.mockResolvedValue([mockLogs[0]]);
      mockPrismaService.activityLog.count.mockResolvedValue(1);

      await service.findAll({
        userId: 'user123',
        action: 'USER_LOGIN',
        entityType: 'User',
      });

      expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          action: 'USER_LOGIN',
          entityType: 'User',
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });
  });

  describe('findOne', () => {
    const mockLog = {
      id: 'log123',
      action: 'USER_LOGIN',
      userId: 'user123',
      actorName: 'John Doe',
      entityType: 'User',
      entityId: 'user123',
      metadata: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
    };

    it('should return a single activity log by id', async () => {
      mockPrismaService.activityLog.findUnique.mockResolvedValue(mockLog);

      const result = await service.findOne('log123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('log123');
      expect(mockPrismaService.activityLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'log123' },
      });
    });

    it('should return null if log not found', async () => {
      mockPrismaService.activityLog.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('Helper Methods', () => {
    const mockLog = {
      id: 'log123',
      action: 'USER_LOGIN',
      userId: 'user123',
      actorName: 'John Doe',
      entityType: 'User',
      entityId: 'user123',
      metadata: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
    };

    const mockRequest = {
      ip: '192.168.1.1',
      headers: { 'user-agent': 'Mozilla/5.0' },
    } as unknown as Request;

    describe('logUserLogin', () => {
      it('should log user login activity', async () => {
        mockPrismaService.activityLog.create.mockResolvedValue(mockLog);

        await service.logUserLogin('user123', mockRequest);

        expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'USER_LOGIN',
            userId: 'user123',
            entityType: 'User',
            entityId: 'user123',
          }),
        });
      });
    });

    describe('logUserLogout', () => {
      it('should log user logout activity', async () => {
        mockPrismaService.activityLog.create.mockResolvedValue({
          ...mockLog,
          action: 'USER_LOGOUT',
        });

        await service.logUserLogout('user123', mockRequest);

        expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'USER_LOGOUT',
            userId: 'user123',
            entityType: 'User',
            entityId: 'user123',
          }),
        });
      });
    });

    describe('logEntityCreated', () => {
      it('should log entity creation', async () => {
        mockPrismaService.activityLog.create.mockResolvedValue({
          ...mockLog,
          action: 'PRODUCT_CREATED',
          entityType: 'Product',
          entityId: 'prod123',
        });

        await service.logEntityCreated('Product', 'prod123', 'user123', {
          name: 'Test Product',
        });

        expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'PRODUCT_CREATED',
            userId: 'user123',
            entityType: 'Product',
            entityId: 'prod123',
            metadata: { name: 'Test Product' },
          }),
        });
      });
    });

    describe('logEntityUpdated', () => {
      it('should log entity update with changes', async () => {
        mockPrismaService.activityLog.create.mockResolvedValue({
          ...mockLog,
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: 'prod123',
        });

        const changes = { name: { old: 'Old Name', new: 'New Name' } };

        await service.logEntityUpdated('Product', 'prod123', 'user123', changes);

        expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'PRODUCT_UPDATED',
            userId: 'user123',
            entityType: 'Product',
            entityId: 'prod123',
            metadata: { changes },
          }),
        });
      });
    });

    describe('logEntityDeleted', () => {
      it('should log entity deletion', async () => {
        mockPrismaService.activityLog.create.mockResolvedValue({
          ...mockLog,
          action: 'PRODUCT_DELETED',
          entityType: 'Product',
          entityId: 'prod123',
        });

        await service.logEntityDeleted('Product', 'prod123', 'user123');

        expect(mockPrismaService.activityLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'PRODUCT_DELETED',
            userId: 'user123',
            entityType: 'Product',
            entityId: 'prod123',
          }),
        });
      });
    });
  });
});
