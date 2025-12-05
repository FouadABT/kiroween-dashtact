import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailEncryptionService } from './services/email-encryption.service';
import { SmtpService } from './services/smtp.service';
import { EmailQueueService } from './services/email-queue.service';
import { EmailTemplateService } from './services/email-template.service';

describe('EmailService', () => {
  let service: EmailService;
  let prismaService: PrismaService;
  let encryptionService: EmailEncryptionService;
  let queueService: EmailQueueService;
  let templateService: EmailTemplateService;

  const mockPrismaService = {
    emailConfiguration: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailLog: {
      create: jest.fn(),
    },
    emailRateLimit: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    notificationPreference: {
      findMany: jest.fn(),
    },
  };

  const mockEncryptionService = {
    encrypt: jest.fn((password) => `encrypted_${password}`),
    decrypt: jest.fn((encrypted) => encrypted.replace('encrypted_', '')),
    maskPassword: jest.fn(() => '********'),
  };

  const mockSmtpService = {
    createTransporter: jest.fn(),
    sendEmail: jest.fn(),
    testConnection: jest.fn(),
  };

  const mockQueueService = {
    addToQueue: jest.fn((data) => Promise.resolve('queue-id-123')),
  };

  const mockTemplateService = {
    findBySlug: jest.fn(),
    renderTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailEncryptionService, useValue: mockEncryptionService },
        { provide: SmtpService, useValue: mockSmtpService },
        { provide: EmailQueueService, useValue: mockQueueService },
        { provide: EmailTemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    prismaService = module.get<PrismaService>(PrismaService);
    encryptionService = module.get<EmailEncryptionService>(EmailEncryptionService);
    queueService = module.get<EmailQueueService>(EmailQueueService);
    templateService = module.get<EmailTemplateService>(EmailTemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveConfiguration', () => {
    it('should create new configuration if none exists', async () => {
      const dto = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: 'password123',
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue(null);
      mockPrismaService.emailConfiguration.create.mockResolvedValue({
        id: 'config-1',
        ...dto,
        smtpPassword: 'encrypted_password123',
        isEnabled: false,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.saveConfiguration(dto, 'user-1');

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('password123');
      expect(mockPrismaService.emailConfiguration.create).toHaveBeenCalled();
      expect(result.smtpPassword).toBe('encrypted_password123');
    });

    it('should update existing configuration', async () => {
      const dto = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: 'newpassword',
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
      });
      mockPrismaService.emailConfiguration.update.mockResolvedValue({
        id: 'config-1',
        ...dto,
        smtpPassword: 'encrypted_newpassword',
        isEnabled: true,
        createdBy: 'user-1',
        updatedBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.saveConfiguration(dto, 'user-2');

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('newpassword');
      expect(mockPrismaService.emailConfiguration.update).toHaveBeenCalled();
      expect(result.updatedBy).toBe('user-2');
    });

    it('should handle optional password (empty string)', async () => {
      const dto = {
        smtpHost: 'smtp-relay.brevo.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUsername: 'xsmtpsib-full-key-here',
        smtpPassword: '', // Empty password for Brevo
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue(null);
      mockPrismaService.emailConfiguration.create.mockResolvedValue({
        id: 'config-1',
        ...dto,
        smtpPassword: 'encrypted_',
        isEnabled: false,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.saveConfiguration(dto, 'user-1');

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('');
      expect(mockPrismaService.emailConfiguration.create).toHaveBeenCalled();
      expect(result.smtpPassword).toBe('encrypted_');
    });

    it('should handle undefined password on update (keeps existing)', async () => {
      const dto = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: undefined, // Not provided - should keep existing
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
      };

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
      });
      mockPrismaService.emailConfiguration.update.mockResolvedValue({
        id: 'config-1',
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpSecure: dto.smtpSecure,
        smtpUsername: dto.smtpUsername,
        smtpPassword: 'existing_encrypted_password',
        senderEmail: dto.senderEmail,
        senderName: dto.senderName,
        isEnabled: true,
        createdBy: 'user-1',
        updatedBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.saveConfiguration(dto as any, 'user-2');

      // Encrypt is called with empty string (dto.smtpPassword || '')
      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('');
      // But password should not be in update data since it's undefined
      expect(mockPrismaService.emailConfiguration.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: expect.not.objectContaining({ smtpPassword: expect.anything() }),
      });
      // Result should have existing password
      expect(result.smtpPassword).toBe('existing_encrypted_password');
    });
  });

  describe('getConfiguration', () => {
    it('should return null if no configuration exists', async () => {
      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue(null);

      const result = await service.getConfiguration();

      expect(result).toBeNull();
    });

    it('should return configuration with masked password', async () => {
      const config = {
        id: 'config-1',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUsername: 'user@example.com',
        smtpPassword: 'encrypted_password',
        senderEmail: 'noreply@example.com',
        senderName: 'Test App',
        isEnabled: true,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue(config);

      const result = await service.getConfiguration();

      expect(mockEncryptionService.maskPassword).toHaveBeenCalled();
      expect(result?.smtpPassword).toBe('********');
    });
  });

  describe('toggleEmailSystem', () => {
    it('should throw error if configuration not found', async () => {
      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue(null);

      await expect(service.toggleEmailSystem(true, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should toggle email system on', async () => {
      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
      });
      mockPrismaService.emailConfiguration.update.mockResolvedValue({
        id: 'config-1',
        isEnabled: true,
        updatedBy: 'user-1',
      });

      const result = await service.toggleEmailSystem(true, 'user-1');

      expect(result.isEnabled).toBe(true);
      expect(mockPrismaService.emailConfiguration.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: { isEnabled: true, updatedBy: 'user-1' },
      });
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
        isEnabled: true,
        smtpPassword: 'encrypted_password',
      });
      mockPrismaService.notificationPreference.findMany.mockResolvedValue([]);
      mockPrismaService.emailRateLimit.findUnique.mockResolvedValue(null);
      mockPrismaService.emailRateLimit.upsert.mockResolvedValue({});
    });

    it('should throw error if email system is disabled', async () => {

      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
        isEnabled: false,
      });

      await expect(
        service.sendEmail({
          recipient: 'test@example.com',
          subject: 'Test',
          htmlBody: '<p>Test</p>',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should queue email successfully', async () => {
      const result = await service.sendEmail({
        recipient: 'test@example.com',
        subject: 'Test Email',
        htmlBody: '<p>Test content</p>',
        textBody: 'Test content',
        priority: 5,
      });

      expect(mockQueueService.addToQueue).toHaveBeenCalledWith({
        recipient: 'test@example.com',
        subject: 'Test Email',
        htmlBody: '<p>Test content</p>',
        textBody: 'Test content',
        templateId: undefined,
        templateData: undefined,
        priority: 5,
        metadata: undefined,
      });
      expect(result).toBe('queue-id-123');
    });

    it('should handle multiple recipients', async () => {
      const result = await service.sendEmail({
        recipient: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Email',
        htmlBody: '<p>Test</p>',
      });

      expect(mockQueueService.addToQueue).toHaveBeenCalledTimes(2);
      expect(result).toBe('queue-id-123');
    });

    it('should skip email if user preferences disabled', async () => {
      mockPrismaService.notificationPreference.findMany.mockResolvedValue([
        { userId: 'user-1', enabled: false },
      ]);

      const result = await service.sendEmail({
        recipient: 'test@example.com',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        userId: 'user-1',
      });

      expect(result).toBe('skipped');
      expect(mockQueueService.addToQueue).not.toHaveBeenCalled();
      expect(mockPrismaService.emailLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'SKIPPED',
          }),
        }),
      );
    });

    it('should throw error for invalid email address', async () => {
      await expect(
        service.sendEmail({
          recipient: 'invalid-email',
          subject: 'Test',
          htmlBody: '<p>Test</p>',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when rate limit exceeded', async () => {
      mockPrismaService.emailRateLimit.findUnique.mockResolvedValue({
        emailCount: 100,
        maxEmails: 100,
      });

      await expect(
        service.sendEmail({
          recipient: 'test@example.com',
          subject: 'Test',
          htmlBody: '<p>Test</p>',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send email using template', async () => {
      mockPrismaService.emailConfiguration.findFirst.mockResolvedValue({
        id: 'config-1',
        isEnabled: true,
        smtpPassword: 'encrypted_password',
      });
      mockPrismaService.notificationPreference.findMany.mockResolvedValue([]);
      mockPrismaService.emailRateLimit.findUnique.mockResolvedValue(null);
      mockPrismaService.emailRateLimit.upsert.mockResolvedValue({});

      mockTemplateService.findBySlug.mockResolvedValue({
        id: 'template-1',
        slug: 'welcome-email',
      });
      mockTemplateService.renderTemplate.mockResolvedValue({
        subject: 'Welcome!',
        htmlBody: '<p>Welcome {{name}}</p>',
        textBody: 'Welcome {{name}}',
      });

      const result = await service.sendTemplateEmail(
        'welcome-email',
        'test@example.com',
        { name: 'John' },
        'user-1',
      );

      expect(mockTemplateService.findBySlug).toHaveBeenCalledWith('welcome-email');
      expect(mockTemplateService.renderTemplate).toHaveBeenCalledWith('template-1', {
        name: 'John',
      });
      expect(mockQueueService.addToQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'test@example.com',
          subject: 'Welcome!',
          templateId: 'template-1',
        }),
      );
      expect(result).toBe('queue-id-123');
    });
  });

  describe('logEmail', () => {
    it('should create email log entry', async () => {
      const logData = {
        recipient: 'test@example.com',
        subject: 'Test Email',
        status: 'SENT' as const,
        templateId: 'template-1',
        userId: 'user-1',
        metadata: { key: 'value' },
      };

      mockPrismaService.emailLog.create.mockResolvedValue({
        id: 'log-1',
        ...logData,
        sentAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.logEmail(logData);

      expect(mockPrismaService.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipient: 'test@example.com',
          subject: 'Test Email',
          status: 'SENT',
          sentAt: expect.any(Date),
        }),
      });
      expect(result.id).toBe('log-1');
    });
  });
});
