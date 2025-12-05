import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailTemplateService } from './services/email-template.service';
import { SmtpService } from './services/smtp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;
  let templateService: EmailTemplateService;
  let smtpService: SmtpService;

  const mockEmailService = {
    saveConfiguration: jest.fn(),
    getConfiguration: jest.fn(),
    toggleEmailSystem: jest.fn(),
    sendEmail: jest.fn(),
    logEmail: jest.fn(),
  };

  const mockTemplateService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSmtpService = {
    testConnection: jest.fn(),
  };

  const mockPrismaService = {
    emailLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      role: { name: 'SUPER_ADMIN' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        { provide: EmailService, useValue: mockEmailService },
        { provide: EmailTemplateService, useValue: mockTemplateService },
        { provide: SmtpService, useValue: mockSmtpService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
    templateService = module.get<EmailTemplateService>(EmailTemplateService);
    smtpService = module.get<SmtpService>(SmtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveConfiguration', () => {
    it('should save email configuration', async () => {
      const dto = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: 'password123',
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      const savedConfig = {
        id: 'config-1',
        ...dto,
        isEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockEmailService.saveConfiguration.mockResolvedValue(savedConfig);

      const result = await controller.saveConfiguration(dto, mockRequest as any);

      expect(mockEmailService.saveConfiguration).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({
        data: savedConfig,
        message: 'Email configuration saved successfully',
      });
    });

    it('should save configuration with empty password (Brevo case)', async () => {
      const dto = {
        smtpHost: 'smtp-relay.brevo.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUsername: 'xsmtpsib-full-key',
        smtpPassword: '', // Empty password
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      const savedConfig = {
        id: 'config-1',
        ...dto,
        isEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockEmailService.saveConfiguration.mockResolvedValue(savedConfig);

      const result = await controller.saveConfiguration(dto, mockRequest as any);

      expect(mockEmailService.saveConfiguration).toHaveBeenCalledWith(dto, 'user-1');
      expect(result.data.smtpPassword).toBe('');
    });

    it('should save configuration without password field (update case)', async () => {
      const dto = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        // smtpPassword not provided - should keep existing
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      const savedConfig = {
        id: 'config-1',
        ...dto,
        smtpPassword: '********', // Masked existing password
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockEmailService.saveConfiguration.mockResolvedValue(savedConfig);

      const result = await controller.saveConfiguration(dto as any, mockRequest as any);

      expect(mockEmailService.saveConfiguration).toHaveBeenCalledWith(dto, 'user-1');
      expect(result.data.smtpPassword).toBe('********');
    });
  });

  describe('getConfiguration', () => {
    it('should return email configuration', async () => {
      const config = {
        id: 'config-1',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: '********',
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockEmailService.getConfiguration.mockResolvedValue(config);

      const result = await controller.getConfiguration();

      expect(mockEmailService.getConfiguration).toHaveBeenCalled();
      expect(result).toEqual({ data: config });
    });

    it('should return null if no configuration exists', async () => {
      mockEmailService.getConfiguration.mockResolvedValue(null);

      const result = await controller.getConfiguration();

      expect(result).toEqual({ data: null });
    });
  });

  describe('toggleEmailSystem', () => {
    it('should enable email system', async () => {
      const dto = { isEnabled: true };
      const updatedConfig = {
        id: 'config-1',
        isEnabled: true,
        updatedBy: 'user-1',
      };

      mockEmailService.toggleEmailSystem.mockResolvedValue(updatedConfig);

      const result = await controller.toggleEmailSystem(dto, mockRequest as any);

      expect(mockEmailService.toggleEmailSystem).toHaveBeenCalledWith(true, 'user-1');
      expect(result).toEqual({
        data: updatedConfig,
        message: 'Email system enabled successfully',
      });
    });

    it('should disable email system', async () => {
      const dto = { isEnabled: false };
      const updatedConfig = {
        id: 'config-1',
        isEnabled: false,
        updatedBy: 'user-1',
      };

      mockEmailService.toggleEmailSystem.mockResolvedValue(updatedConfig);

      const result = await controller.toggleEmailSystem(dto, mockRequest as any);

      expect(mockEmailService.toggleEmailSystem).toHaveBeenCalledWith(false, 'user-1');
      expect(result).toEqual({
        data: updatedConfig,
        message: 'Email system disabled successfully',
      });
    });
  });

  describe('sendTestEmail', () => {
    it('should send test email successfully', async () => {
      const dto = {
        recipient: 'test@example.com',
        message: 'This is a test email',
      };

      mockSmtpService.testConnection.mockResolvedValue(true);
      mockEmailService.sendEmail.mockResolvedValue('queue-id-123');

      const result = await controller.sendTestEmail(dto, mockRequest as any);

      expect(mockSmtpService.testConnection).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        recipient: dto.recipient,
        subject: 'Test Email from Test App',
        htmlBody: expect.stringContaining(dto.message),
        textBody: expect.stringContaining(dto.message),
        priority: 10,
        userId: 'user-1',
      });
      expect(result).toEqual({
        success: true,
        message: 'Test email sent successfully',
      });
    });

    it('should handle test email failure', async () => {
      const dto = {
        recipient: 'test@example.com',
      };

      mockSmtpService.testConnection.mockRejectedValue(
        new Error('Connection failed'),
      );

      await expect(controller.sendTestEmail(dto, mockRequest as any)).rejects.toThrow();
    });
  });

  describe('getAllTemplates', () => {
    it('should return paginated templates', async () => {
      const templates = [
        {
          id: 'template-1',
          name: 'Welcome Email',
          slug: 'welcome-email',
          subject: 'Welcome!',
          htmlBody: '<p>Welcome</p>',
          textBody: 'Welcome',
          variables: [],
          category: 'USER_ACTION',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
      ];

      mockTemplateService.findAll.mockResolvedValue({
        data: templates,
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await controller.getAllTemplates(1, 20);

      expect(mockTemplateService.findAll).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual({
        data: templates,
        total: 1,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return template by id', async () => {
      const template = {
        id: 'template-1',
        name: 'Welcome Email',
        slug: 'welcome-email',
        subject: 'Welcome!',
        htmlBody: '<p>Welcome</p>',
        textBody: 'Welcome',
        variables: {},
        category: 'USER_ACTION',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockTemplateService.findById.mockResolvedValue(template);

      const result = await controller.getTemplateById('template-1');

      expect(mockTemplateService.findById).toHaveBeenCalledWith('template-1');
      expect(result).toEqual({ data: template });
    });
  });

  describe('createTemplate', () => {
    it('should create new template', async () => {
      const dto = {
        name: 'New Template',
        slug: 'new-template',
        subject: 'Subject',
        htmlBody: '<p>Body</p>',
        textBody: 'Body',
        variables: [],
        category: 'SYSTEM',
        isActive: true,
      };

      const createdTemplate = {
        id: 'template-2',
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockTemplateService.create.mockResolvedValue(createdTemplate);

      const result = await controller.createTemplate(dto, mockRequest as any);

      expect(mockTemplateService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({
        data: createdTemplate,
        message: 'Email template created successfully',
      });
    });
  });

  describe('updateTemplate', () => {
    it('should update template', async () => {
      const dto = {
        name: 'Updated Template',
        subject: 'Updated Subject',
      };

      const updatedTemplate = {
        id: 'template-1',
        ...dto,
        slug: 'template-1',
        htmlBody: '<p>Body</p>',
        textBody: 'Body',
        variables: [],
        category: 'SYSTEM',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      mockTemplateService.update.mockResolvedValue(updatedTemplate);

      const result = await controller.updateTemplate(
        'template-1',
        dto,
        mockRequest as any,
      );

      expect(mockTemplateService.update).toHaveBeenCalledWith(
        'template-1',
        dto,
        'user-1',
      );
      expect(result).toEqual({
        data: updatedTemplate,
        message: 'Email template updated successfully',
      });
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', async () => {
      mockTemplateService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteTemplate('template-1');

      expect(mockTemplateService.delete).toHaveBeenCalledWith('template-1');
      expect(result).toEqual({
        message: 'Email template deleted successfully',
      });
    });
  });
});
