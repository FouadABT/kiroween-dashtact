import { Test, TestingModule } from '@nestjs/testing';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplateService } from './notification-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationTemplateController - Create Operations', () => {
  let controller: NotificationTemplateController;
  let service: NotificationTemplateService;

  const mockTemplateService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByKey: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    render: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationTemplateController],
      providers: [
        {
          provide: NotificationTemplateService,
          useValue: mockTemplateService,
        },
      ],
    }).compile();

    controller = module.get<NotificationTemplateController>(NotificationTemplateController);
    service = module.get<NotificationTemplateService>(NotificationTemplateService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateTemplateDto = {
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
      ...createDto,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new template', async () => {
      mockTemplateService.create.mockResolvedValue(mockCreatedTemplate);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCreatedTemplate);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should pass all DTO fields to service', async () => {
      mockTemplateService.create.mockResolvedValue(mockCreatedTemplate);

      await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          key: createDto.key,
          name: createDto.name,
          description: createDto.description,
          category: createDto.category,
          title: createDto.title,
          message: createDto.message,
          variables: createDto.variables,
          defaultChannels: createDto.defaultChannels,
          defaultPriority: createDto.defaultPriority,
          isActive: createDto.isActive,
        }),
      );
    });

    it('should handle minimal DTO with only required fields', async () => {
      const minimalDto: CreateTemplateDto = {
        key: 'simple-template',
        name: 'Simple Template',
        category: NotificationCategory.SYSTEM,
        title: 'Simple Title',
        message: 'Simple message',
      };

      mockTemplateService.create.mockResolvedValue({
        id: 'template-2',
        ...minimalDto,
        variables: [],
        defaultChannels: [NotificationChannel.IN_APP],
        defaultPriority: NotificationPriority.NORMAL,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.create(minimalDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(minimalDto);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Template creation failed');
      mockTemplateService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Template creation failed');
    });

    it('should handle templates with multiple variables', async () => {
      const multiVarDto: CreateTemplateDto = {
        key: 'order-confirmation',
        name: 'Order Confirmation',
        category: NotificationCategory.BILLING,
        title: 'Order {{orderId}} confirmed',
        message: 'Hi {{customerName}}, your order {{orderId}} for {{amount}} has been confirmed.',
        variables: ['orderId', 'customerName', 'amount'],
        defaultChannels: [NotificationChannel.IN_APP],
        defaultPriority: NotificationPriority.HIGH,
      };

      mockTemplateService.create.mockResolvedValue({
        id: 'template-3',
        ...multiVarDto,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.create(multiVarDto);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(multiVarDto);
    });

    it('should handle all notification categories', async () => {
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
        const dto: CreateTemplateDto = {
          ...createDto,
          key: `test-${category}`,
          category,
        };

        mockTemplateService.create.mockResolvedValue({
          id: `template-${category}`,
          ...dto,
          version: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await controller.create(dto);
      }

      expect(service.create).toHaveBeenCalledTimes(categories.length);
    });

    it('should handle all notification priorities', async () => {
      const priorities = [
        NotificationPriority.LOW,
        NotificationPriority.NORMAL,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT,
      ];

      for (const priority of priorities) {
        const dto: CreateTemplateDto = {
          ...createDto,
          key: `test-${priority}`,
          defaultPriority: priority,
        };

        mockTemplateService.create.mockResolvedValue({
          id: `template-${priority}`,
          ...dto,
          version: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await controller.create(dto);
      }

      expect(service.create).toHaveBeenCalledTimes(priorities.length);
    });

    it('should handle inactive templates', async () => {
      const inactiveDto: CreateTemplateDto = {
        ...createDto,
        isActive: false,
      };

      mockTemplateService.create.mockResolvedValue({
        id: 'template-inactive',
        ...inactiveDto,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.create(inactiveDto);

      expect(result.isActive).toBe(false);
      expect(service.create).toHaveBeenCalledWith(inactiveDto);
    });
  });
});
