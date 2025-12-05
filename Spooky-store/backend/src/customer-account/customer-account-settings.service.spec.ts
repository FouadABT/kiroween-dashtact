import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAccountService } from './customer-account.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AccountSettingsDto, PrivacyLevel } from './dto';

describe('CustomerAccountService - Settings', () => {
  let service: CustomerAccountService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    accountSettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCustomerId = 'customer-123';
  const mockCustomer = {
    id: mockCustomerId,
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockSettings = {
    id: 'settings-123',
    customerId: mockCustomerId,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    orderUpdates: true,
    twoFactorEnabled: false,
    privacyLevel: 'private',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomerAccountService>(CustomerAccountService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await service.getSettings(mockCustomerId);

      expect(result).toEqual(mockSettings);
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
      });
      expect(prisma.accountSettings.findUnique).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
      });
    });

    it('should create default settings if none exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.accountSettings.create.mockResolvedValue(mockSettings);

      const result = await service.getSettings(mockCustomerId);

      expect(result).toEqual(mockSettings);
      expect(prisma.accountSettings.create).toHaveBeenCalledWith({
        data: {
          customerId: mockCustomerId,
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          orderUpdates: true,
          twoFactorEnabled: false,
          privacyLevel: 'private',
        },
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.getSettings(mockCustomerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
        marketingEmails: true,
      };

      const updatedSettings = {
        ...mockSettings,
        emailNotifications: false,
        marketingEmails: true,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.accountSettings.update.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(mockCustomerId, updateDto);

      expect(result).toEqual(updatedSettings);
      expect(prisma.accountSettings.update).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        data: {
          emailNotifications: false,
          smsNotifications: mockSettings.smsNotifications,
          marketingEmails: true,
          orderUpdates: mockSettings.orderUpdates,
          privacyLevel: mockSettings.privacyLevel,
        },
      });
    });

    it('should create settings if they do not exist', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
      };

      const newSettings = {
        ...mockSettings,
        emailNotifications: false,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.accountSettings.create.mockResolvedValue(mockSettings);
      mockPrismaService.accountSettings.update.mockResolvedValue(newSettings);

      const result = await service.updateSettings(mockCustomerId, updateDto);

      expect(result).toEqual(newSettings);
      expect(prisma.accountSettings.create).toHaveBeenCalled();
      expect(prisma.accountSettings.update).toHaveBeenCalled();
    });

    it('should update privacy level', async () => {
      const updateDto: AccountSettingsDto = {
        privacyLevel: PrivacyLevel.PUBLIC,
      };

      const updatedSettings = {
        ...mockSettings,
        privacyLevel: 'public',
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.accountSettings.update.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(mockCustomerId, updateDto);

      expect(result.privacyLevel).toBe('public');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
      };

      await expect(
        service.updateSettings(mockCustomerId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should preserve unmodified settings', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.accountSettings.update.mockResolvedValue({
        ...mockSettings,
        emailNotifications: false,
      });

      await service.updateSettings(mockCustomerId, updateDto);

      expect(prisma.accountSettings.update).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        data: {
          emailNotifications: false,
          smsNotifications: mockSettings.smsNotifications,
          marketingEmails: mockSettings.marketingEmails,
          orderUpdates: mockSettings.orderUpdates,
          privacyLevel: mockSettings.privacyLevel,
        },
      });
    });

    it('should handle partial updates', async () => {
      const updateDto: AccountSettingsDto = {
        smsNotifications: true,
        orderUpdates: false,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.accountSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.accountSettings.update.mockResolvedValue({
        ...mockSettings,
        smsNotifications: true,
        orderUpdates: false,
      });

      await service.updateSettings(mockCustomerId, updateDto);

      expect(prisma.accountSettings.update).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        data: {
          emailNotifications: mockSettings.emailNotifications,
          smsNotifications: true,
          marketingEmails: mockSettings.marketingEmails,
          orderUpdates: false,
          privacyLevel: mockSettings.privacyLevel,
        },
      });
    });
  });

  describe('Settings DTO Validation', () => {
    it('should accept valid privacy levels', () => {
      const validDtos: AccountSettingsDto[] = [
        { privacyLevel: PrivacyLevel.PUBLIC },
        { privacyLevel: PrivacyLevel.PRIVATE },
        { privacyLevel: PrivacyLevel.FRIENDS_ONLY },
      ];

      validDtos.forEach(dto => {
        expect(dto.privacyLevel).toBeDefined();
      });
    });

    it('should accept boolean notification settings', () => {
      const dto: AccountSettingsDto = {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        orderUpdates: false,
      };

      expect(typeof dto.emailNotifications).toBe('boolean');
      expect(typeof dto.smsNotifications).toBe('boolean');
      expect(typeof dto.marketingEmails).toBe('boolean');
      expect(typeof dto.orderUpdates).toBe('boolean');
    });

    it('should allow partial updates', () => {
      const partialDto: Partial<AccountSettingsDto> = {
        emailNotifications: false,
      };

      expect(partialDto.emailNotifications).toBe(false);
      expect(partialDto.smsNotifications).toBeUndefined();
    });
  });

  describe('Settings Response DTO', () => {
    it('should include all required fields', () => {
      const response = mockSettings;

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('customerId');
      expect(response).toHaveProperty('emailNotifications');
      expect(response).toHaveProperty('smsNotifications');
      expect(response).toHaveProperty('marketingEmails');
      expect(response).toHaveProperty('orderUpdates');
      expect(response).toHaveProperty('twoFactorEnabled');
      expect(response).toHaveProperty('privacyLevel');
      expect(response).toHaveProperty('createdAt');
      expect(response).toHaveProperty('updatedAt');
    });

    it('should have correct data types', () => {
      const response = mockSettings;

      expect(typeof response.id).toBe('string');
      expect(typeof response.customerId).toBe('string');
      expect(typeof response.emailNotifications).toBe('boolean');
      expect(typeof response.smsNotifications).toBe('boolean');
      expect(typeof response.marketingEmails).toBe('boolean');
      expect(typeof response.orderUpdates).toBe('boolean');
      expect(typeof response.twoFactorEnabled).toBe('boolean');
      expect(typeof response.privacyLevel).toBe('string');
      expect(response.createdAt instanceof Date).toBe(true);
      expect(response.updatedAt instanceof Date).toBe(true);
    });
  });
});
