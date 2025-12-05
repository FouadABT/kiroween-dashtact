import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationsController - Create', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    deleteAll: jest.fn(),
    getUnreadCount: jest.fn(),
    filterByPermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'This is a test notification',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.HIGH,
        channel: NotificationChannel.IN_APP,
      };

      const expectedNotification = {
        id: 'notif-123',
        ...dto,
        isRead: false,
        readAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
        actionUrl: null,
        actionLabel: null,
        imageUrl: null,
        requiredPermission: null,
        scheduledFor: null,
      };

      mockNotificationsService.create.mockResolvedValue(expectedNotification);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedNotification);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(dto);
    });

    it('should create notification with all optional fields', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Complete Notification',
        message: 'This has all fields',
        category: NotificationCategory.USER_ACTION,
        priority: NotificationPriority.URGENT,
        channel: NotificationChannel.IN_APP,
        metadata: { key: 'value', nested: { data: 'test' } },
        actionUrl: '/dashboard/action',
        actionLabel: 'Take Action',
        imageUrl: 'https://example.com/image.png',
        requiredPermission: 'users:write',
        scheduledFor: new Date('2025-12-31'),
      };

      const expectedNotification = {
        id: 'notif-456',
        ...dto,
        isRead: false,
        readAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotificationsService.create.mockResolvedValue(expectedNotification);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedNotification);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(dto);
    });

    it('should handle service errors', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.CONTENT,
      };

      mockNotificationsService.create.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.create(dto)).rejects.toThrow('Service error');
    });

    it('should create notification for different categories', async () => {
      const categories = [
        NotificationCategory.SYSTEM,
        NotificationCategory.USER_ACTION,
        NotificationCategory.SECURITY,
        NotificationCategory.BILLING,
        NotificationCategory.CONTENT,
        NotificationCategory.WORKFLOW,
        NotificationCategory.SOCIAL,
        NotificationCategory.CUSTOM,
      ];

      for (const category of categories) {
        const dto: CreateNotificationDto = {
          userId: 'user-123',
          title: `${category} Notification`,
          message: `Test ${category} notification`,
          category,
        };

        mockNotificationsService.create.mockResolvedValue({
          id: `notif-${category}`,
          ...dto,
        });

        await controller.create(dto);

        expect(mockNotificationsService.create).toHaveBeenCalledWith(dto);
      }
    });

    it('should create notification for different priorities', async () => {
      const priorities = [
        NotificationPriority.LOW,
        NotificationPriority.NORMAL,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT,
      ];

      for (const priority of priorities) {
        const dto: CreateNotificationDto = {
          userId: 'user-123',
          title: `${priority} Priority`,
          message: `Test ${priority} priority notification`,
          category: NotificationCategory.SYSTEM,
          priority,
        };

        mockNotificationsService.create.mockResolvedValue({
          id: `notif-${priority}`,
          ...dto,
        });

        await controller.create(dto);

        expect(mockNotificationsService.create).toHaveBeenCalledWith(dto);
      }
    });

    it('should create notification with complex metadata', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Complex Metadata',
        message: 'Notification with complex metadata',
        category: NotificationCategory.CUSTOM,
        metadata: {
          user: { id: '123', name: 'John' },
          action: 'update',
          timestamp: new Date().toISOString(),
          tags: ['important', 'urgent'],
          nested: {
            level1: {
              level2: {
                value: 'deep',
              },
            },
          },
        },
      };

      mockNotificationsService.create.mockResolvedValue({
        id: 'notif-complex',
        ...dto,
      });

      const result = await controller.create(dto);

      expect(result.metadata).toEqual(dto.metadata);
    });

    it('should create notification with permission requirement', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Permission Required',
        message: 'This notification requires permission',
        category: NotificationCategory.SECURITY,
        requiredPermission: 'admin:read',
      };

      mockNotificationsService.create.mockResolvedValue({
        id: 'notif-perm',
        ...dto,
      });

      const result = await controller.create(dto);

      expect(result.requiredPermission).toBe('admin:read');
    });

    it('should create scheduled notification', async () => {
      const scheduledDate = new Date('2025-12-31T10:00:00Z');
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Scheduled',
        message: 'This will be delivered later',
        category: NotificationCategory.WORKFLOW,
        scheduledFor: scheduledDate,
      };

      mockNotificationsService.create.mockResolvedValue({
        id: 'notif-scheduled',
        ...dto,
      });

      const result = await controller.create(dto);

      expect(result.scheduledFor).toEqual(scheduledDate);
    });
  });
});
