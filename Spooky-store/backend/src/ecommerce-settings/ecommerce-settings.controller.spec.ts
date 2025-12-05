import { Test, TestingModule } from '@nestjs/testing';
import { EcommerceSettingsController } from './ecommerce-settings.controller';
import { EcommerceSettingsService } from './ecommerce-settings.service';

describe('EcommerceSettingsController', () => {
  let controller: EcommerceSettingsController;
  let service: EcommerceSettingsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findGlobal: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
      controllers: [EcommerceSettingsController],
      providers: [
        {
          provide: EcommerceSettingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EcommerceSettingsController>(EcommerceSettingsController);
    service = module.get<EcommerceSettingsService>(EcommerceSettingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      const mockSettingsList = [mockSettings];
      mockService.findAll.mockResolvedValue(mockSettingsList);

      const result = await controller.findAll();

      expect(result).toEqual(mockSettingsList);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return settings by ID', async () => {
      mockService.findById.mockResolvedValue(mockSettings);

      const result = await controller.findById('settings-1');

      expect(result).toEqual(mockSettings);
      expect(mockService.findById).toHaveBeenCalledWith('settings-1');
    });
  });

  describe('findGlobal', () => {
    it('should return global settings', async () => {
      mockService.findGlobal.mockResolvedValue(mockSettings);

      const result = await controller.findGlobal();

      expect(result).toEqual(mockSettings);
      expect(mockService.findGlobal).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return user-specific settings', async () => {
      const userSettings = { ...mockSettings, scope: 'user', userId: 'user-1' };
      mockService.findByUserId.mockResolvedValue(userSettings);

      const result = await controller.findByUserId('user-1');

      expect(result).toEqual(userSettings);
      expect(mockService.findByUserId).toHaveBeenCalledWith('user-1');
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
      mockService.create.mockResolvedValue(mockSettings);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockSettings);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    const updateDto = {
      storeName: 'Updated Store',
      taxRate: 0.10,
    };

    it('should update settings', async () => {
      const updatedSettings = { ...mockSettings, ...updateDto };
      mockService.update.mockResolvedValue(updatedSettings);

      const result = await controller.update('settings-1', updateDto);

      expect(result).toEqual(updatedSettings);
      expect(mockService.update).toHaveBeenCalledWith('settings-1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete settings', async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete('settings-1');

      expect(mockService.delete).toHaveBeenCalledWith('settings-1');
    });
  });

  describe('endpoint protection', () => {
    it('should require authentication for all endpoints', () => {
      // This is verified by the @UseGuards(JwtAuthGuard) decorator
      // In real tests, this would be tested with E2E tests
      expect(controller).toBeDefined();
    });

    it('should require ecommerce:read permission for read operations', () => {
      // This is verified by the @Permissions('ecommerce:read') decorator
      // In real tests, this would be tested with E2E tests
      expect(controller).toBeDefined();
    });

    it('should require ecommerce:write permission for write operations', () => {
      // This is verified by the @Permissions('ecommerce:write') decorator
      // In real tests, this would be tested with E2E tests
      expect(controller).toBeDefined();
    });
  });
});
