import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingNotificationService } from './messaging-notification.service';

describe('MessagingService', () => {
  let service: MessagingService;

  const mockMessagingNotificationService = {
    createMessageNotification: jest.fn(),
  };

  const mockPrismaService = {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    conversationParticipant: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    messageStatus: {
      createMany: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    messagingSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MessagingNotificationService,
          useValue: mockMessagingNotificationService,
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a direct conversation', async () => {
      const mockConversation = {
        id: 'conv1',
        type: 'DIRECT',
        name: null,
        createdById: 'user1',
        participants: [
          { userId: 'user1', user: { id: 'user1', email: 'user1@test.com', name: 'User 1' } },
          { userId: 'user2', user: { id: 'user2', email: 'user2@test.com', name: 'User 2' } },
        ],
        createdBy: { id: 'user1', email: 'user1@test.com', name: 'User 1' },
      };

      mockPrismaService.conversation.findMany.mockResolvedValue([]);
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.createConversation('user1', {
        type: 'DIRECT' as any,
        participantIds: ['user2'],
      });

      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.create).toHaveBeenCalled();
    });

    it('should create a group conversation', async () => {
      const mockConversation = {
        id: 'conv2',
        type: 'GROUP',
        name: 'Test Group',
        createdById: 'user1',
        participants: [],
      };

      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.createConversation('user1', {
        type: 'GROUP' as any,
        name: 'Test Group',
        participantIds: ['user2', 'user3'],
      });

      expect(result).toEqual(mockConversation);
    });

    it('should throw error if group conversation has no name', async () => {
      await expect(
        service.createConversation('user1', {
          type: 'GROUP' as any,
          participantIds: ['user2'],
        })
      ).rejects.toThrow('Group conversations must have a name');
    });

    it('should throw error if direct conversation has wrong number of participants', async () => {
      await expect(
        service.createConversation('user1', {
          type: 'DIRECT' as any,
          participantIds: ['user2', 'user3'],
        })
      ).rejects.toThrow('Direct conversations must have exactly one other participant');
    });

    it('should return existing direct conversation if it exists', async () => {
      const existingConversation = {
        id: 'conv1',
        type: 'DIRECT',
        participants: [
          { userId: 'user1', user: { id: 'user1', email: 'user1@test.com', name: 'User 1' } },
          { userId: 'user2', user: { id: 'user2', email: 'user2@test.com', name: 'User 2' } },
        ],
      };

      mockPrismaService.conversation.findMany.mockResolvedValue([existingConversation]);

      const result = await service.createConversation('user1', {
        type: 'DIRECT' as any,
        participantIds: ['user2'],
      });

      expect(result).toEqual(existingConversation);
      expect(mockPrismaService.conversation.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserConversations', () => {
    it('should return paginated conversations', async () => {
      const mockConversations = [
        { id: 'conv1', type: 'DIRECT', participants: [] },
        { id: 'conv2', type: 'GROUP', participants: [] },
      ];

      mockPrismaService.conversation.findMany.mockResolvedValue(mockConversations);
      mockPrismaService.conversation.count.mockResolvedValue(2);

      const result = await service.getUserConversations('user1', { page: 1, limit: 20 });

      expect(result.conversations).toEqual(mockConversations);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const mockMessage = {
        id: 'msg1',
        content: 'Hello',
        conversationId: 'conv1',
        senderId: 'user1',
        type: 'TEXT',
      };

      const mockConversation = {
        id: 'conv1',
        participants: [
          { userId: 'user1', isActive: true, user: { id: 'user1', email: 'user1@test.com', name: 'User 1' } },
          { userId: 'user2', isActive: true, user: { id: 'user2', email: 'user2@test.com', name: 'User 2' } },
        ],
      };

      const mockSettings = {
        id: 'settings1',
        enabled: true,
        maxMessageLength: 2000,
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.conversationParticipant.findMany.mockResolvedValue(mockConversation.participants);
      mockPrismaService.messagingSettings.findFirst.mockResolvedValue(mockSettings);
      mockPrismaService.message.create.mockResolvedValue(mockMessage);
      mockPrismaService.messageStatus.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.conversation.update.mockResolvedValue(mockConversation);
      mockMessagingNotificationService.createMessageNotification.mockResolvedValue(undefined);

      const result = await service.sendMessage('user1', {
        conversationId: 'conv1',
        content: 'Hello',
        type: 'TEXT' as any,
      });

      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.create).toHaveBeenCalled();
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read', async () => {
      const mockMessage = {
        id: 'msg1',
        conversationId: 'conv1',
        conversation: {
          participants: [
            { userId: 'user1', isActive: true },
          ],
        },
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.messageStatus.upsert.mockResolvedValue({});

      await service.markMessageAsRead('user1', 'msg1');

      expect(mockPrismaService.messageStatus.upsert).toHaveBeenCalled();
    });

    it('should throw error if message not found', async () => {
      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(
        service.markMessageAsRead('user1', 'msg1')
      ).rejects.toThrow('Message not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockPrismaService.messageStatus.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user1');

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('getSettings', () => {
    it('should return settings', async () => {
      const mockSettings = { 
        id: 'settings1', 
        enabled: true,
        maxMessageLength: 2000,
        messageRetentionDays: 90,
      };
      mockPrismaService.messagingSettings.findFirst.mockResolvedValue(mockSettings);

      const result = await service.getSettings();

      expect(result).toEqual(mockSettings);
    });

    it('should create default settings if none exist', async () => {
      const defaultSettings = {
        id: 'settings1',
        enabled: false,
        maxMessageLength: 2000,
        messageRetentionDays: 90,
      };

      mockPrismaService.messagingSettings.findFirst.mockResolvedValue(null);
      mockPrismaService.messagingSettings.create.mockResolvedValue(defaultSettings);

      const result = await service.getSettings();

      expect(result).toEqual(defaultSettings);
      expect(mockPrismaService.messagingSettings.create).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const updatedSettings = {
        id: 'settings1',
        enabled: true,
        maxMessageLength: 3000,
      };

      mockPrismaService.messagingSettings.update.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings({
        enabled: true,
        maxMessageLength: 3000,
      });

      expect(result).toEqual(updatedSettings);
    });
  });
});
