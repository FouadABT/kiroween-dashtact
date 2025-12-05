import { Test, TestingModule } from '@nestjs/testing';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('MessagingController', () => {
  let controller: MessagingController;
  let service: MessagingService;

  const mockMessagingService = {
    getUserConversations: jest.fn(),
    getConversation: jest.fn(),
    createConversation: jest.fn(),
    updateConversation: jest.fn(),
    deleteConversation: jest.fn(),
    leaveConversation: jest.fn(),
    muteConversation: jest.fn(),
    markConversationAsRead: jest.fn(),
    getConversationUnreadCount: jest.fn(),
    getMessages: jest.fn(),
    getMessage: jest.fn(),
    sendMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    markMessageAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    toggleMessagingSystem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockMessagingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessagingController>(MessagingController);
    service = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConversations', () => {
    it('should return user conversations', async () => {
      const mockResult = {
        conversations: [],
        total: 0,
        page: 1,
        limit: 20,
      };

      mockMessagingService.getUserConversations.mockResolvedValue(mockResult);

      const result = await controller.getConversations({ id: 'user1' }, {});

      expect(result).toEqual(mockResult);
      expect(service.getUserConversations).toHaveBeenCalledWith('user1', {});
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const mockMessage = {
        id: 'msg1',
        content: 'Hello',
      };

      mockMessagingService.sendMessage.mockResolvedValue(mockMessage);

      const dto = {
        conversationId: 'conv1',
        content: 'Hello',
      };

      const result = await controller.sendMessage({ id: 'user1' }, dto);

      expect(result.data).toEqual(mockMessage);
      expect(result.message).toBe('Message sent successfully');
    });
  });

  describe('getSettings', () => {
    it('should return messaging settings', async () => {
      const mockSettings = {
        id: 'settings1',
        enabled: true,
      };

      mockMessagingService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getSettings();

      expect(result.data).toEqual(mockSettings);
    });
  });
});
