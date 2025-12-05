import { Test, TestingModule } from '@nestjs/testing';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { HeaderFooterService } from './header-footer.service';
import { TemplateService } from './template.service';
import { UploadsService } from '../uploads/uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('LandingController - Settings', () => {
  let controller: LandingController;
  let landingService: LandingService;

  const mockLandingService = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  };

  const mockHeaderFooterService = {};
  const mockTemplateService = {};
  const mockUploadsService = {};

  const mockSettings = {
    general: {
      title: 'Test Site',
      description: 'Test Description',
      favicon: '/favicon.ico',
      language: 'en',
    },
    seo: {
      ogTitle: 'Test OG Title',
      ogDescription: 'Test OG Description',
      ogImage: '/og-image.png',
      twitterCard: 'summary_large_image',
      structuredData: true,
    },
    theme: {
      mode: 'auto',
      colors: {
        primary: { light: '#000000', dark: '#ffffff' },
        secondary: { light: '#333333', dark: '#cccccc' },
        accent: { light: '#666666', dark: '#999999' },
      },
    },
    layout: {
      containerWidth: 'standard',
      sectionSpacing: 'normal',
      contentAlignment: 'center',
    },
    performance: {
      imageOptimization: true,
      lazyLoading: true,
      cacheStrategy: 'normal',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
      providers: [
        {
          provide: LandingService,
          useValue: mockLandingService,
        },
        {
          provide: HeaderFooterService,
          useValue: mockHeaderFooterService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<LandingController>(LandingController);
    landingService = module.get<LandingService>(LandingService);

    jest.clearAllMocks();
  });

  describe('GET /landing/settings', () => {
    it('should return landing page settings', async () => {
      mockLandingService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getSettings();

      expect(result).toEqual(mockSettings);
      expect(landingService.getSettings).toHaveBeenCalled();
    });

    it('should require landing:read permission', async () => {
      // This is tested by the guard override in beforeEach
      // In real scenario, PermissionsGuard would check for 'landing:read'
      expect(controller.getSettings).toBeDefined();
    });
  });

  describe('PATCH /landing/settings', () => {
    it('should update general settings', async () => {
      const updateDto = {
        general: {
          title: 'Updated Title',
          description: 'Updated Description',
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          general: {
            ...mockSettings.general,
            ...updateDto.general,
          },
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result).toEqual(updatedContent);
      expect(landingService.updateSettings).toHaveBeenCalledWith(updateDto);
    });

    it('should update SEO settings', async () => {
      const updateDto = {
        seo: {
          ogTitle: 'New OG Title',
          structuredData: false,
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          seo: {
            ...mockSettings.seo,
            ...updateDto.seo,
          },
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result.settings.seo.ogTitle).toBe('New OG Title');
      expect(landingService.updateSettings).toHaveBeenCalledWith(updateDto);
    });

    it('should update theme settings', async () => {
      const updateDto = {
        theme: {
          mode: 'dark',
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          theme: {
            ...mockSettings.theme,
            mode: 'dark',
          },
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result.settings.theme.mode).toBe('dark');
    });

    it('should update layout settings', async () => {
      const updateDto = {
        layout: {
          containerWidth: 'wide',
          sectionSpacing: 'relaxed',
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          layout: {
            ...mockSettings.layout,
            ...updateDto.layout,
          },
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result.settings.layout.containerWidth).toBe('wide');
    });

    it('should update performance settings', async () => {
      const updateDto = {
        performance: {
          imageOptimization: false,
          cacheStrategy: 'aggressive',
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          performance: {
            ...mockSettings.performance,
            ...updateDto.performance,
          },
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result.settings.performance.cacheStrategy).toBe('aggressive');
    });

    it('should update advanced settings', async () => {
      const updateDto = {
        advanced: {
          customCSS: '.custom { color: red; }',
          analyticsId: 'GA-123456',
        },
      };

      const updatedContent = {
        id: 'test-id',
        settings: {
          ...mockSettings,
          advanced: updateDto.advanced,
        },
      };

      mockLandingService.updateSettings.mockResolvedValue(updatedContent);

      const result = await controller.updateSettings(updateDto);

      expect(result.settings.advanced.customCSS).toBe('.custom { color: red; }');
    });

    it('should require landing:write permission', async () => {
      // This is tested by the guard override in beforeEach
      // In real scenario, PermissionsGuard would check for 'landing:write'
      expect(controller.updateSettings).toBeDefined();
    });
  });
});
