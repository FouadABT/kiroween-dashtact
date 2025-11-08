import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  const mockSettingsResponse: SettingsResponseDto = {
    id: 'test-id-1',
    userId: null,
    scope: 'global',
    themeMode: 'system',
    activeTheme: 'default',
    lightPalette: {
      background: 'oklch(100% 0 0)',
      foreground: 'oklch(9.84% 0.002 285.82)',
      primary: 'oklch(45.62% 0.217 264.05)',
    } as any,
    darkPalette: {
      background: 'oklch(9.84% 0.002 285.82)',
      foreground: 'oklch(100% 0 0)',
      primary: 'oklch(100% 0 0)',
    } as any,
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
    } as any,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockSettingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findGlobal: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create new settings', async () => {
      const createDto: CreateSettingsDto = {
        scope: 'global',
        themeMode: 'system',
        activeTheme: 'default',
        lightPalette: mockSettingsResponse.lightPalette,
        darkPalette: mockSettingsResponse.darkPalette,
        typography: mockSettingsResponse.typography,
      };

      mockSettingsService.create.mockResolvedValue(mockSettingsResponse);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockSettingsResponse);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      const mockList = [mockSettingsResponse];
      mockSettingsService.findAll.mockResolvedValue(mockList);

      const result = await controller.findAll();

      expect(result).toEqual(mockList);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findGlobal', () => {
    it('should return global settings', async () => {
      mockSettingsService.findGlobal.mockResolvedValue(mockSettingsResponse);

      const result = await controller.findGlobal();

      expect(result).toEqual(mockSettingsResponse);
      expect(service.findGlobal).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return settings by user ID', async () => {
      const userSettings = { ...mockSettingsResponse, userId: 'user-1' };
      mockSettingsService.findByUserId.mockResolvedValue(userSettings);

      const result = await controller.findByUserId('user-1');

      expect(result).toEqual(userSettings);
      expect(service.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should return settings by ID', async () => {
      mockSettingsService.findOne.mockResolvedValue(mockSettingsResponse);

      const result = await controller.findOne('test-id-1');

      expect(result).toEqual(mockSettingsResponse);
      expect(service.findOne).toHaveBeenCalledWith('test-id-1');
    });
  });

  describe('update', () => {
    it('should update settings', async () => {
      const updateDto: UpdateSettingsDto = {
        themeMode: 'dark',
        activeTheme: 'custom',
      };

      const updatedSettings = {
        ...mockSettingsResponse,
        themeMode: 'dark' as const,
        activeTheme: 'custom',
      };

      mockSettingsService.update.mockResolvedValue(updatedSettings);

      const result = await controller.update('test-id-1', updateDto);

      expect(result).toEqual(updatedSettings);
      expect(service.update).toHaveBeenCalledWith('test-id-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete settings', async () => {
      mockSettingsService.remove.mockResolvedValue(undefined);

      await controller.remove('test-id-1');

      expect(service.remove).toHaveBeenCalledWith('test-id-1');
    });
  });
});
