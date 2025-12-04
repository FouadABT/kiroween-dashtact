import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesService } from './notification-preferences.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { DNDSettingsDto } from './dto/dnd-settings.dto';

describe('NotificationPreferencesService - Update Operations', () => {
  let service: NotificationPreferencesService;
  let prisma: PrismaService;

  const mockUserId = 'user-123';
  const mockCategory = 'SYSTEM';

  const mockPreference = {
    id: 'pref-123',
    userId: mockUserId,
    category: mockCategory,
    enabled: true,
    dndEnabled: false,
    dndStartTime: null,
    dndEndTime: null,
    dndDays: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    notificationPreference: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationPreferencesService>(
      NotificationPreferencesService,
    );
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('updatePreference', () => {
    it('should update existing preference with enabled flag', async () => {
      const updateDto: UpdatePreferenceDto = {
        enabled: false,
      };

      mockPrismaService.notificationPreference.findUnique.mockResolvedValue(
        mockPreference,
      );
      mockPrismaService.notificationPreference.update.mockResolvedValue({
        ...mockPreference,
        enabled: false,
      });

      const result = await service.updatePreference(
        mockUserId,
        mockCategory,
        updateDto,
      );

      expect(result.enabled).toBe(false);
      expect(prisma.notificationPreference.update).toHaveBeenCalledWith({
        where: {
          userId_category: {
            userId: mockUserId,
            category: mockCategory,
          },
        },
        data: {
          enabled: false,
        },
      });
    });

    it('should update DND settings', async () => {
      const updateDto: UpdatePreferenceDto = {
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [0, 6], // Sunday and Saturday
      };

      mockPrismaService.notificationPreference.findUnique.mockResolvedValue(
        mockPreference,
      );
      mockPrismaService.notificationPreference.update.mockResolvedValue({
        ...mockPreference,
        ...updateDto,
      });

      const result = await service.updatePreference(
        mockUserId,
        mockCategory,
        updateDto,
      );

      expect(result.dndEnabled).toBe(true);
      expect(result.dndStartTime).toBe('22:00');
      expect(result.dndEndTime).toBe('08:00');
      expect(result.dndDays).toEqual([0, 6]);
    });

    it('should create new preference if not exists', async () => {
      const updateDto: UpdatePreferenceDto = {
        enabled: true,
        dndEnabled: false,
      };

      mockPrismaService.notificationPreference.findUnique.mockResolvedValue(
        null,
      );
      mockPrismaService.notificationPreference.create.mockResolvedValue({
        ...mockPreference,
        ...updateDto,
      });

      const result = await service.updatePreference(
        mockUserId,
        mockCategory,
        updateDto,
      );

      expect(prisma.notificationPreference.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          category: mockCategory,
          enabled: true,
          dndEnabled: false,
          dndStartTime: undefined,
          dndEndTime: undefined,
          dndDays: [],
        },
      });
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdatePreferenceDto = {
        dndStartTime: '23:00',
      };

      mockPrismaService.notificationPreference.findUnique.mockResolvedValue(
        mockPreference,
      );
      mockPrismaService.notificationPreference.update.mockResolvedValue({
        ...mockPreference,
        dndStartTime: '23:00',
      });

      await service.updatePreference(mockUserId, mockCategory, updateDto);

      expect(prisma.notificationPreference.update).toHaveBeenCalledWith({
        where: {
          userId_category: {
            userId: mockUserId,
            category: mockCategory,
          },
        },
        data: {
          dndStartTime: '23:00',
        },
      });
    });

    it('should handle errors gracefully', async () => {
      const updateDto: UpdatePreferenceDto = {
        enabled: false,
      };

      mockPrismaService.notificationPreference.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.updatePreference(mockUserId, mockCategory, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('setDND', () => {
    it('should set DND settings for all user preferences', async () => {
      const dndSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6],
      };

      mockPrismaService.notificationPreference.updateMany.mockResolvedValue({
        count: 8,
      });

      await service.setDND(mockUserId, dndSettings);

      expect(prisma.notificationPreference.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          dndEnabled: true,
          dndStartTime: '22:00',
          dndEndTime: '08:00',
          dndDays: [0, 1, 2, 3, 4, 5, 6],
        },
      });
    });

    it('should validate time format', async () => {
      const invalidSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '25:00', // Invalid hour
        endTime: '08:00',
        days: [0, 6],
      };

      await expect(service.setDND(mockUserId, invalidSettings)).rejects.toThrow(
        'Invalid start time format',
      );
    });

    it('should validate day values', async () => {
      const invalidSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [0, 7], // 7 is invalid (should be 0-6)
      };

      await expect(service.setDND(mockUserId, invalidSettings)).rejects.toThrow(
        'Invalid day value',
      );
    });

    it('should handle negative day values', async () => {
      const invalidSettings: DNDSettingsDto = {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        days: [-1, 0],
      };

      await expect(service.setDND(mockUserId, invalidSettings)).rejects.toThrow(
        'Invalid day value',
      );
    });
  });

  describe('isInDNDPeriod', () => {
    beforeEach(() => {
      // Mock current time to 23:30 on Saturday (day 6)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-06T23:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true when in DND period', async () => {
      mockPrismaService.notificationPreference.findFirst.mockResolvedValue({
        ...mockPreference,
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [6], // Saturday
      });

      const result = await service.isInDNDPeriod(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false when not in DND period', async () => {
      mockPrismaService.notificationPreference.findFirst.mockResolvedValue({
        ...mockPreference,
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [0], // Sunday only
      });

      const result = await service.isInDNDPeriod(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false when DND is disabled', async () => {
      mockPrismaService.notificationPreference.findFirst.mockResolvedValue({
        ...mockPreference,
        dndEnabled: false,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [6],
      });

      const result = await service.isInDNDPeriod(mockUserId);

      expect(result).toBe(false);
    });

    it('should handle overnight DND periods', async () => {
      // Current time: 23:30 Saturday
      mockPrismaService.notificationPreference.findFirst.mockResolvedValue({
        ...mockPreference,
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [6],
      });

      const result = await service.isInDNDPeriod(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockPrismaService.notificationPreference.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.isInDNDPeriod(mockUserId);

      expect(result).toBe(false);
    });
  });
});
