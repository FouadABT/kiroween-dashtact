import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    settings: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSettings = {
    id: 'test-id-1',
    userId: null,
    scope: 'global',
    themeMode: 'system',
    activeTheme: 'default',
    lightPalette: {
      background: 'oklch(100% 0 0)',
      foreground: 'oklch(9.84% 0.002 285.82)',
      primary: 'oklch(45.62% 0.217 264.05)',
    },
    darkPalette: {
      background: 'oklch(9.84% 0.002 285.82)',
      foreground: 'oklch(100% 0 0)',
      primary: 'oklch(100% 0 0)',
    },
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
      fontSize: {
        base: '1rem',
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new settings successfully', async () => {
      const createDto: CreateSettingsDto = {
        scope: 'global',
        themeMode: 'system',
        activeTheme: 'default',
        lightPalette: mockSettings.lightPalette as any,
        darkPalette: mockSettings.darkPalette as any,
        typography: mockSettings.typography as any,
      };

      mockPrismaService.settings.findUnique.mockResolvedValue(null);
      mockPrismaService.settings.create.mockResolvedValue(mockSettings);

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: mockSettings.id,
        userId: mockSettings.userId,
        scope: mockSettings.scope,
        themeMode: mockSettings.themeMode,
        activeTheme: mockSettings.activeTheme,
        lightPalette: mockSettings.lightPalette,
        darkPalette: mockSettings.darkPalette,
        typography: mockSettings.typography,
        createdAt: mockSettings.createdAt.toISOString(),
        updatedAt: mockSettings.updatedAt.toISOString(),
      });
      expect(mockPrismaService.settings.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          scope: createDto.scope,
          themeMode: createDto.themeMode,
          activeTheme: createDto.activeTheme,
        }),
      });
    });

    it('should throw ConflictException if user settings already exist', async () => {
      const createDto: CreateSettingsDto = {
        userId: 'user-1',
        scope: 'user',
        themeMode: 'dark',
        activeTheme: 'custom',
        lightPalette: mockSettings.lightPalette as any,
        darkPalette: mockSettings.darkPalette as any,
        typography: mockSettings.typography as any,
      };

      mockPrismaService.settings.findUnique.mockResolvedValue(mockSettings);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.settings.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      const mockSettingsList = [mockSettings];
      mockPrismaService.settings.findMany.mockResolvedValue(mockSettingsList);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockSettings.id);
      expect(mockPrismaService.settings.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no settings exist', async () => {
      mockPrismaService.settings.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return settings by ID', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(mockSettings);

      const result = await service.findOne('test-id-1');

      expect(result.id).toBe(mockSettings.id);
      expect(mockPrismaService.settings.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return settings by user ID', async () => {
      const userSettings = { ...mockSettings, userId: 'user-1', scope: 'user' };
      mockPrismaService.settings.findUnique.mockResolvedValue(userSettings);

      const result = await service.findByUserId('user-1');

      expect(result.userId).toBe('user-1');
      expect(mockPrismaService.settings.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should throw NotFoundException if user settings not found', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findGlobal', () => {
    it('should return global settings', async () => {
      mockPrismaService.settings.findFirst.mockResolvedValue(mockSettings);

      const result = await service.findGlobal();

      expect(result.scope).toBe('global');
      expect(mockPrismaService.settings.findFirst).toHaveBeenCalledWith({
        where: { scope: 'global', userId: null },
      });
    });

    it('should throw NotFoundException if global settings not found', async () => {
      mockPrismaService.settings.findFirst.mockResolvedValue(null);

      await expect(service.findGlobal()).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update settings successfully', async () => {
      const updateDto: UpdateSettingsDto = {
        themeMode: 'dark',
        activeTheme: 'custom',
      };

      const updatedSettings = {
        ...mockSettings,
        themeMode: 'dark',
        activeTheme: 'custom',
      };

      mockPrismaService.settings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.settings.update.mockResolvedValue(updatedSettings);

      const result = await service.update('test-id-1', updateDto);

      expect(result.themeMode).toBe('dark');
      expect(result.activeTheme).toBe('custom');
      expect(mockPrismaService.settings.update).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: expect.objectContaining({
          themeMode: 'dark',
          activeTheme: 'custom',
        }),
      });
    });

    it('should merge partial palette updates', async () => {
      const updateDto: UpdateSettingsDto = {
        lightPalette: {
          primary: 'oklch(50% 0.2 270)',
        },
      };

      mockPrismaService.settings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.settings.update.mockResolvedValue({
        ...mockSettings,
        lightPalette: {
          ...mockSettings.lightPalette,
          primary: 'oklch(50% 0.2 270)',
        },
      });

      const result = await service.update('test-id-1', updateDto);

      expect(mockPrismaService.settings.update).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: expect.objectContaining({
          lightPalette: expect.objectContaining({
            primary: 'oklch(50% 0.2 270)',
          }),
        }),
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.settings.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete settings successfully', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.settings.delete.mockResolvedValue(mockSettings);

      await service.remove('test-id-1');

      expect(mockPrismaService.settings.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockPrismaService.settings.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.settings.delete).not.toHaveBeenCalled();
    });
  });
});
