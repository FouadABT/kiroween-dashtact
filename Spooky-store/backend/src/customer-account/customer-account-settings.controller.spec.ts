import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAccountController } from './customer-account.controller';
import { CustomerAccountService } from './customer-account.service';
import { AccountSettingsDto, PrivacyLevel } from './dto';

describe('CustomerAccountController - Settings', () => {
  let controller: CustomerAccountController;
  let service: CustomerAccountService;

  const mockService = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  };

  const mockUser = {
    customerId: 'customer-123',
    email: 'customer@example.com',
  };

  const mockSettings = {
    id: 'settings-123',
    customerId: mockUser.customerId,
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
      controllers: [CustomerAccountController],
      providers: [
        {
          provide: CustomerAccountService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CustomerAccountController>(
      CustomerAccountController,
    );
    service = module.get<CustomerAccountService>(CustomerAccountService);

    jest.clearAllMocks();
  });

  describe('GET /customer-account/settings', () => {
    it('should return account settings', async () => {
      mockService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getSettings(mockUser);

      expect(result).toEqual(mockSettings);
      expect(service.getSettings).toHaveBeenCalledWith(mockUser.customerId);
    });

    it('should pass customerId from current user', async () => {
      mockService.getSettings.mockResolvedValue(mockSettings);

      await controller.getSettings(mockUser);

      expect(service.getSettings).toHaveBeenCalledWith(mockUser.customerId);
    });
  });

  describe('PATCH /customer-account/settings', () => {
    it('should update account settings', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
        marketingEmails: true,
      };

      const updatedSettings = {
        ...mockSettings,
        emailNotifications: false,
        marketingEmails: true,
      };

      mockService.updateSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettings(mockUser, updateDto);

      expect(result).toEqual(updatedSettings);
      expect(service.updateSettings).toHaveBeenCalledWith(
        mockUser.customerId,
        updateDto,
      );
    });

    it('should handle privacy level update', async () => {
      const updateDto: AccountSettingsDto = {
        privacyLevel: PrivacyLevel.PUBLIC,
      };

      const updatedSettings = {
        ...mockSettings,
        privacyLevel: 'public',
      };

      mockService.updateSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettings(mockUser, updateDto);

      expect(result.privacyLevel).toBe('public');
    });

    it('should handle notification settings update', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
        smsNotifications: true,
        marketingEmails: true,
        orderUpdates: false,
      };

      const updatedSettings = {
        ...mockSettings,
        ...updateDto,
      };

      mockService.updateSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettings(mockUser, updateDto);

      expect(result.emailNotifications).toBe(false);
      expect(result.smsNotifications).toBe(true);
      expect(result.marketingEmails).toBe(true);
      expect(result.orderUpdates).toBe(false);
    });

    it('should pass customerId from current user', async () => {
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
      };

      mockService.updateSettings.mockResolvedValue(mockSettings);

      await controller.updateSettings(mockUser, updateDto);

      expect(service.updateSettings).toHaveBeenCalledWith(
        mockUser.customerId,
        updateDto,
      );
    });

    it('should handle partial updates', async () => {
      const updateDto: AccountSettingsDto = {
        smsNotifications: true,
      };

      mockService.updateSettings.mockResolvedValue({
        ...mockSettings,
        smsNotifications: true,
      });

      await controller.updateSettings(mockUser, updateDto);

      expect(service.updateSettings).toHaveBeenCalledWith(
        mockUser.customerId,
        updateDto,
      );
    });
  });

  describe('Settings Endpoint Integration', () => {
    it('should handle get and update in sequence', async () => {
      // Get settings
      mockService.getSettings.mockResolvedValue(mockSettings);
      const getResult = await controller.getSettings(mockUser);
      expect(getResult).toEqual(mockSettings);

      // Update settings
      const updateDto: AccountSettingsDto = {
        emailNotifications: false,
      };
      const updatedSettings = {
        ...mockSettings,
        emailNotifications: false,
      };
      mockService.updateSettings.mockResolvedValue(updatedSettings);
      const updateResult = await controller.updateSettings(mockUser, updateDto);
      expect(updateResult.emailNotifications).toBe(false);
    });

    it('should maintain customerId consistency', async () => {
      mockService.getSettings.mockResolvedValue(mockSettings);
      mockService.updateSettings.mockResolvedValue(mockSettings);

      await controller.getSettings(mockUser);
      await controller.updateSettings(mockUser, {});

      expect(service.getSettings).toHaveBeenCalledWith(mockUser.customerId);
      expect(service.updateSettings).toHaveBeenCalledWith(
        mockUser.customerId,
        expect.any(Object),
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      mockService.getSettings.mockRejectedValue(error);

      await expect(controller.getSettings(mockUser)).rejects.toThrow(error);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockService.updateSettings.mockRejectedValue(error);

      await expect(
        controller.updateSettings(mockUser, {}),
      ).rejects.toThrow(error);
    });
  });
});
