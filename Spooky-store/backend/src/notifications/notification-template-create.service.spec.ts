import { Test, TestingModule } from '@nestjs/testing';
import { NotificationTemplateService } from './notification-template.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationTemplateService - Create Operations', () => {
  let service: NotificationTemplateService;
  let prisma: PrismaService;

  const mockPrismaService = {
    notificationTemplate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTemplateService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationTemplateService>(NotificationTemplateService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validCreateDto = {
      key: 'welcome-email',
      name: 'Welcome Email',
      description: 'Sent to new users',
      category: NotificationCategory.USER_ACTION,
      title: 'Welcome {{userName}}!',
      message: 'Hello {{userName}}, welcome to our platform!',
      variables: ['userName'],
      defaultChannels: [NotificationChannel.IN_APP],
      defaultPriority: NotificationPriority.NORMAL,
      isActive: true,
    };

    const mockCreatedTemplate = {
      id: 'template-1',
      ...validCreateDto,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new template successfully', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const result = await service.create(validCreateDto);

      expect(result).toEqual(mockCreatedTemplate);
      expect(prisma.notificationTemplate.findUnique).toHaveBeenCalledWith({
        where: { key: validCreateDto.key },
      });
      expect(prisma.notificationTemplate.create).toHaveBeenCalledWith({
        data: {
          key: validCreateDto.key,
          name: validCreateDto.name,
          description: validCreateDto.description,
          category: validCreateDto.category,
          title: validCreateDto.title,
          message: validCreateDto.message,
          variables: validCreateDto.variables,
          defaultChannels: validCreateDto.defaultChannels,
          defaultPriority: validCreateDto.defaultPriority,
          version: 1,
          isActive: validCreateDto.isActive,
        },
      });
    });

    it('should throw ConflictException if template key already exists', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(mockCreatedTemplate);

      await expect(service.create(validCreateDto)).rejects.toThrow(ConflictException);
      await expect(service.create(validCreateDto)).rejects.toThrow(
        'Template with key "welcome-email" already exists',
      );
      expect(prisma.notificationTemplate.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if template uses undeclared variables', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);

      const invalidDto = {
        ...validCreateDto,
        title: 'Welcome {{userName}} from {{companyName}}!',
        variables: ['userName'], // Missing companyName
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Template uses undeclared variables: companyName',
      );
      expect(prisma.notificationTemplate.create).not.toHaveBeenCalled();
    });

    it('should create template with default values when optional fields are omitted', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const minimalDto = {
        key: 'simple-template',
        name: 'Simple Template',
        category: NotificationCategory.SYSTEM,
        title: 'Simple Title',
        message: 'Simple message',
      };

      await service.create(minimalDto);

      expect(prisma.notificationTemplate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          key: minimalDto.key,
          name: minimalDto.name,
          category: minimalDto.category,
          title: minimalDto.title,
          message: minimalDto.message,
          variables: [],
          defaultChannels: ['IN_APP'],
          defaultPriority: 'NORMAL',
          version: 1,
          isActive: true,
        }),
      });
    });

    it('should handle multiple variables in template', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const multiVarDto = {
        ...validCreateDto,
        title: 'Hello {{firstName}} {{lastName}}!',
        message: 'Your email is {{email}} and role is {{role}}',
        variables: ['firstName', 'lastName', 'email', 'role'],
      };

      await service.create(multiVarDto);

      expect(prisma.notificationTemplate.create).toHaveBeenCalled();
    });

    it('should validate variables in both title and message', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);

      const invalidDto = {
        ...validCreateDto,
        title: 'Welcome {{userName}}!',
        message: 'Hello {{userName}}, your email is {{email}}',
        variables: ['userName'], // Missing email
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Template uses undeclared variables: email',
      );
    });

    it('should handle templates with no variables', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const noVarDto = {
        ...validCreateDto,
        title: 'Static Title',
        message: 'Static message with no variables',
        variables: [],
      };

      await service.create(noVarDto);

      expect(prisma.notificationTemplate.create).toHaveBeenCalled();
    });

    it('should handle all notification categories', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

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
        const dto = { ...validCreateDto, key: `test-${category}`, category };
        await service.create(dto);
      }

      expect(prisma.notificationTemplate.create).toHaveBeenCalledTimes(categories.length);
    });

    it('should handle all notification priorities', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const priorities = [
        NotificationPriority.LOW,
        NotificationPriority.NORMAL,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT,
      ];

      for (const priority of priorities) {
        const dto = { ...validCreateDto, key: `test-${priority}`, defaultPriority: priority };
        await service.create(dto);
      }

      expect(prisma.notificationTemplate.create).toHaveBeenCalledTimes(priorities.length);
    });

    it('should set isActive to false when explicitly provided', async () => {
      mockPrismaService.notificationTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationTemplate.create.mockResolvedValue(mockCreatedTemplate);

      const inactiveDto = {
        ...validCreateDto,
        isActive: false,
      };

      await service.create(inactiveDto);

      expect(prisma.notificationTemplate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: false,
        }),
      });
    });
  });
});
