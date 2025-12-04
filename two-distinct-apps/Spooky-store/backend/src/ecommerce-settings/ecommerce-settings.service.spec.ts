import { Test, TestingModule } from '@nestjs/testing';
import { EcommerceSettingsService } from './ecommerce-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EcommerceSettingsService', () => {
  let service: EcommerceSettingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ecommerceSettings: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSettings = {
    id: 'settings-1',
    scope: 'global',
    userId: null,
    storeName: 'Test Store',
    storeDescription: 'Test Description',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0.08,
    taxLabel: 'Sales Tax',
    shippingEnabled: true,
    portalEnabled: true,
    allowGuestCheckout: false,
    trackInventory: true,
    lowStockThreshold: 10,
    autoGenerateOrderNumbers: true,
    orderNumberPrefix: 'ORD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EcommerceSettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EcommerceSettingsService>(EcommerceSettingsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      const mockSettingsList = [mockSettings];
      mockPrismaService.ecommerceSettings.findMany.mockResolvedValue(mockSettingsList);

      const result = await service.findAll();

      expect(result).toEqual(mockSettingsList);
      expect(mockPrismaService.ecommerceSettings.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no settings exist', async () => {
      mockPrismaService.ecommerceSettings.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return settings by ID', async () => {
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await service.findById('settings-1');

      expect(result).toEqual(mockSettings);
      expect(mockPrismaService.ecommerceSettings.findUnique).toHaveBeenCalledWith({
        where: { id: 'settings-1' },
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findGlobal', () => {
    it('should return global settings', async () => {
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(mockSettings);

      const result = await service.findGlobal();

      expect(result).toEqual(mockSettings);
      expect(mockPrismaService.ecommerceSettings.findFirst).toHaveBeenCalledWith({
        where: { scope: 'global' },
      });
    });

    it('should throw NotFoundException if global settings not found', async () => {
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);

      await expect(service.findGlobal()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return user-specific settings', async () => {
      const userSettings = { ...mockSettings, scope: 'user', userId: 'user-1' };
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(userSettings);

      const result = await service.findByUserId('user-1');

      expect(result).toEqual(userSettings);
      expect(mockPrismaService.ecommerceSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should throw NotFoundException if user settings not found', async () => {
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      scope: 'global' as const,
      storeName: 'New Store',
      currency: 'EUR',
      currencySymbol: '€',
    };

    it('should create new settings', async () => {
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);
      mockPrismaService.ecommerceSettings.create.mockResolvedValue(mockSettings);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSettings);
      expect(mockPrismaService.ecommerceSettings.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if global settings already exist', async () => {
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(mockSettings);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user settings already exist', async () => {
      const userDto = { ...createDto, scope: 'user' as const, userId: 'user-1' };
      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(mockSettings);

      await expect(service.create(userDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto = {
      storeName: 'Updated Store',
      taxRate: 0.10,
    };

    it('should update settings', async () => {
      const updatedSettings = { ...mockSettings, ...updateDto };
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.ecommerceSettings.update.mockResolvedValue(updatedSettings);

      const result = await service.update('settings-1', updateDto);

      expect(result).toEqual(updatedSettings);
      expect(mockPrismaService.ecommerceSettings.update).toHaveBeenCalledWith({
        where: { id: 'settings-1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete settings', async () => {
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.ecommerceSettings.delete.mockResolvedValue(mockSettings);

      await service.delete('settings-1');

      expect(mockPrismaService.ecommerceSettings.delete).toHaveBeenCalledWith({
        where: { id: 'settings-1' },
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.ecommerceSettings.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validation', () => {
    it('should validate tax rate is between 0 and 100', async () => {
      const invalidDto = {
        scope: 'global' as const,
        taxRate: 150,
      };

      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);

      // This would be caught by DTO validation in real scenario
      // Here we're testing service-level validation if it exists
      await expect(service.create(invalidDto as any)).rejects.toThrow();
    });

    it('should validate currency code format', async () => {
      const invalidDto = {
        scope: 'global' as const,
        currency: 'INVALID',
      };

      mockPrismaService.ecommerceSettings.findFirst.mockResolvedValue(null);

      // This would be caught by DTO validation in real scenario
      await expect(service.create(invalidDto as any)).rejects.toThrow();
    });
  });
});
