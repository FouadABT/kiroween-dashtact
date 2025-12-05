import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { DNDSettingsDto } from './dto/dnd-settings.dto';

describe('NotificationPreferencesController - Update Operations', () => {
  let controller: NotificationPreferencesController;
  let service: NotificationPreferencesService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    roleId: 'role-123',
    roleName: 'User',
    permissions: ['notifications:read', 'notifications:write'],
  };

  const mockCategory = 'SYSTEM';

  const mockPreference = {
    id: 'pref-123',
    userId: mockUser.id,
    category: mockCategory,
    enabled: true,
    dndEnabled: false,
    dndStartTime: null,
    dndEndTime: null,
    dndDays: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    getPreferences: jest.fn(),
    getPreference: jest.fn(),
    updatePreference: jest.fn(),
    setDND: jest.fn(),
    resetToDefaults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferencesController],
      providers: [
        {
          provide: NotificationPreferencesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationPreferencesController>(
      NotificationPreferencesController,
    );
    service = module.get<NotificationPreferencesService>(
      NotificationPreferencesService,
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('updatePreference', () => {
    it('should update preference for specific category', async () => {
      const updateDto: UpdatePreferenceDto = {
        enabled: false,
      };

      mockService.updatePreference.mockResolvedValue({
        ...mockPreference,
        enabled: false,
      });

      const result = await controller.updatePreference(
        mockUser,
        mockCategory,
        updateDto,
      );

      expect(result.enabled).toBe(false);
      expect(service.updatePreference).toHaveBeenCalledWith(
        mockUser.id,
        mockCategory,
        updateDto,
      );
    });

    it('should update DND settings via preference endpoint', async () => {
      const updateDto: UpdatePreferenceDto = {
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [0, 6],
      };

      mockService.updatePreference.mockResolvedValue({
        ...mockPreference,
        ...updateDto,
      });

      const result = await controller.updatePreference(
        mockUser,
        mockCategory,
        updateDto,
      );

      expect(result.dndEnabled).toBe(true);
      expect(result.dndStartTime).toBe('22:00');
      expect(result.dndEndTime).toBe('08:00');
      expect(result.dndDays).toEqual([0, 6]);
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdatePreferenceDto = {
        dndStartTime: '23:00',
      };

      mockService.updatePreference.mockResolvedValue({
        ...mockPreference,
        dndStartTime: '23:00',
      });

      await controller.updatePreference(mockUser, mockCategory, updateDto);

      expect(service.updatePreference).toHaveBeenCalledWith(
        mockUser.id,
        mockCategory,
        updateDto,
      );
    });

    it('should handle service errors', async () => {
      const updateDto: UpdatePreferenceDto = {
        enabled: false,
      };

      mockService.updatePreference.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.updatePreference(mockUser, mockCategory, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('setDND', () => {
    it('should set DND settings for all categories', async () => {
      const dndSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6],
      };

      mockService.setDND.mockResolvedValue(undefined);

      const result = await controller.setDND(mockUser, dndSettings);

      expect(result).toEqual({
        message: 'Do Not Disturb settings updated successfully',
      });
      expect(service.setDND).toHaveBeenCalledWith(mockUser.id, dndSettings);
    });

    it('should handle weekend-only DND', async () => {
      const dndSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '00:00',
        endTime: '23:59',
        days: [0, 6], // Sunday and Saturday
      };

      mockService.setDND.mockResolvedValue(undefined);

      await controller.setDND(mockUser, dndSettings);

      expect(service.setDND).toHaveBeenCalledWith(mockUser.id, dndSettings);
    });

    it('should handle overnight DND periods', async () => {
      const dndSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6],
      };

      mockService.setDND.mockResolvedValue(undefined);

      await controller.setDND(mockUser, dndSettings);

      expect(service.setDND).toHaveBeenCalledWith(mockUser.id, dndSettings);
    });

    it('should handle service errors', async () => {
      const dndSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 6],
      };

      mockService.setDND.mockRejectedValue(new Error('Validation error'));

      await expect(controller.setDND(mockUser, dndSettings)).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('getPreference', () => {
    it('should get preference for specific category', async () => {
      mockService.getPreference.mockResolvedValue(mockPreference);

      const result = await controller.getPreference(mockUser, mockCategory);

      expect(result).toEqual(mockPreference);
      expect(service.getPreference).toHaveBeenCalledWith(
        mockUser.id,
        mockCategory,
      );
    });
  });

  describe('getPreferences', () => {
    it('should get all preferences for user', async () => {
      const allPreferences = [
        mockPreference,
        { ...mockPreference, id: 'pref-124', category: 'SECURITY' },
      ];

      mockService.getPreferences.mockResolvedValue(allPreferences);

      const result = await controller.getPreferences(mockUser);

      expect(result).toEqual(allPreferences);
      expect(service.getPreferences).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all preferences to defaults', async () => {
      const defaultPreferences = [
        mockPreference,
        { ...mockPreference, id: 'pref-124', category: 'SECURITY' },
      ];

      mockService.resetToDefaults.mockResolvedValue(defaultPreferences);

      const result = await controller.resetToDefaults(mockUser);

      expect(result).toEqual(defaultPreferences);
      expect(service.resetToDefaults).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
