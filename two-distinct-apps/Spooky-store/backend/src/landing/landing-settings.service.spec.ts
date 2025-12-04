import { Test, TestingModule } from '@nestjs/testing';
import { LandingService } from './landing.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('LandingService - Settings', () => {
  let service: LandingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    landingPageContent: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    customPage: {
      findUnique: jest.fn(),
    },
  };

  const mockLandingContent = {
    id: 'test-id',
    sections: [],
    settings: {
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
    },
    version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LandingService>(LandingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return landing page settings', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      const result = await service.getSettings();

      expect(result).toEqual(mockLandingContent.settings);
      expect(prisma.landingPageContent.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should return empty object if no settings exist', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue({
        ...mockLandingContent,
        settings: null,
      });

      const result = await service.getSettings();

      expect(result).toEqual({});
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(null);

      await expect(service.getSettings()).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettings', () => {
    it('should update general settings', async () => {
      const updateDto = {
        general: {
          title: 'Updated Title',
          description: 'Updated Description',
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.general.title).toBe('Updated Title');
      expect(prisma.landingPageContent.update).toHaveBeenCalledWith({
        where: { id: mockLandingContent.id },
        data: {
          settings: expect.objectContaining(updateDto),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update SEO settings', async () => {
      const updateDto = {
        seo: {
          ogTitle: 'New OG Title',
          structuredData: false,
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.seo.ogTitle).toBe('New OG Title');
      expect(result.settings.seo.structuredData).toBe(false);
    });

    it('should update theme settings', async () => {
      const updateDto = {
        theme: {
          mode: 'dark',
          colors: {
            primary: { light: '#ff0000', dark: '#00ff00' },
          },
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.theme.mode).toBe('dark');
    });

    it('should update layout settings', async () => {
      const updateDto = {
        layout: {
          containerWidth: 'wide',
          sectionSpacing: 'relaxed',
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.layout.containerWidth).toBe('wide');
      expect(result.settings.layout.sectionSpacing).toBe('relaxed');
    });

    it('should update performance settings', async () => {
      const updateDto = {
        performance: {
          imageOptimization: false,
          cacheStrategy: 'aggressive',
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.performance.imageOptimization).toBe(false);
      expect(result.settings.performance.cacheStrategy).toBe('aggressive');
    });

    it('should update advanced settings', async () => {
      const updateDto = {
        advanced: {
          customCSS: '.custom { color: red; }',
          analyticsId: 'GA-123456',
          gtmId: 'GTM-123456',
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          ...updateDto,
        },
      });

      const result = await service.updateSettings(updateDto);

      expect(result.settings.advanced.customCSS).toBe('.custom { color: red; }');
      expect(result.settings.advanced.analyticsId).toBe('GA-123456');
    });

    it('should merge settings with existing values', async () => {
      const updateDto = {
        general: {
          title: 'New Title',
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          general: {
            ...mockLandingContent.settings.general,
            title: 'New Title',
          },
        },
      });

      const result = await service.updateSettings(updateDto);

      // Should keep existing values
      expect(result.settings.general.description).toBe('Test Description');
      expect(result.settings.general.favicon).toBe('/favicon.ico');
      // Should update new value
      expect(result.settings.general.title).toBe('New Title');
    });

    it('should invalidate cache after update', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue(
        mockLandingContent,
      );

      await service.updateSettings({ general: { title: 'New' } });

      // Cache should be invalidated - next call should hit database
      await service.getSettings();

      expect(prisma.landingPageContent.findFirst).toHaveBeenCalledTimes(2);
    });
  });
});
