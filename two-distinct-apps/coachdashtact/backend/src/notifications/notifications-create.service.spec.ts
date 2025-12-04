import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationsService - Create', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification with all fields', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'This is a test notification',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.HIGH,
        channel: NotificationChannel.IN_APP,
        metadata: { key: 'value' },
        actionUrl: '/dashboard',
        actionLabel: 'View Dashboard',
        imageUrl: 'https://example.com/image.png',
        requiredPermission: 'users:read',
        scheduledFor: new Date('2025-12-31'),
      };

      const expectedNotification = {
        id: 'notif-123',
        ...dto,
        isRead: false,
        readAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(expectedNotification);

      const result = await service.create(dto);

      expect(result).toEqual(expectedNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: dto.userId,
          title: dto.title,
          message: dto.message,
          category: dto.category,
          priority: dto.priority,
          channel: dto.channel,
          metadata: dto.metadata,
          actionUrl: dto.actionUrl,
          actionLabel: dto.actionLabel,
          imageUrl: dto.imageUrl,
          requiredPermission: dto.requiredPermission,
          scheduledFor: dto.scheduledFor,
        },
      });
    });

    it('should create a notification with minimal required fields', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'This is a test notification',
        category: NotificationCategory.USER_ACTION,
      };

      const expectedNotification = {
        id: 'notif-123',
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        category: dto.category,
        priority: NotificationPriority.NORMAL,
        channel: NotificationChannel.IN_APP,
        metadata: null,
        actionUrl: undefined,
        actionLabel: undefined,
        imageUrl: undefined,
        requiredPermission: undefined,
        scheduledFor: undefined,
        isRead: false,
        readAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(expectedNotification);

      const result = await service.create(dto);

      expect(result).toEqual(expectedNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: dto.userId,
          title: dto.title,
          message: dto.message,
          category: dto.category,
          priority: 'NORMAL',
          channel: 'IN_APP',
          metadata: null,
          actionUrl: undefined,
          actionLabel: undefined,
          imageUrl: undefined,
          requiredPermission: undefined,
          scheduledFor: undefined,
        },
      });
    });

    it('should apply default priority when not provided', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.CONTENT,
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-123',
        ...dto,
        priority: NotificationPriority.NORMAL,
      });

      await service.create(dto);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: 'NORMAL',
          }),
        }),
      );
    });

    it('should apply default channel when not provided', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SECURITY,
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-123',
        ...dto,
        channel: NotificationChannel.IN_APP,
      });

      await service.create(dto);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            channel: 'IN_APP',
          }),
        }),
      );
    });

    it('should handle metadata as null when not provided', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.BILLING,
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-123',
        ...dto,
        metadata: null,
      });

      await service.create(dto);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: null,
          }),
        }),
      );
    });

    it('should throw error when database operation fails', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.WORKFLOW,
      };

      mockPrismaService.notification.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(dto)).rejects.toThrow('Database error');
    });

    it('should create notification with permission requirement', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Admin Notification',
        message: 'This requires admin permission',
        category: NotificationCategory.SYSTEM,
        requiredPermission: 'admin:read',
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-123',
        ...dto,
      });

      const result = await service.create(dto);

      expect(result.requiredPermission).toBe('admin:read');
    });

    it('should create notification with scheduled delivery', async () => {
      const scheduledDate = new Date('2025-12-31T10:00:00Z');
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Scheduled Notification',
        message: 'This will be delivered later',
        category: NotificationCategory.CUSTOM,
        scheduledFor: scheduledDate,
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-123',
        ...dto,
      });

      const result = await service.create(dto);

      expect(result.scheduledFor).toEqual(scheduledDate);
    });
  });
});
