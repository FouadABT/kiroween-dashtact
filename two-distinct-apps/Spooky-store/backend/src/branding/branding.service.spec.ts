import { Test, TestingModule } from '@nestjs/testing';
import { BrandingService } from './branding.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BrandingService', () => {
  let service: BrandingService;
  let prismaService: PrismaService;

  const mockBrandSettings = {
    id: 'brand-1',
    brandName: 'Test Dashboard',
    tagline: 'Test Tagline',
    description: 'Test Description',
    logoUrl: '/uploads/logo.png',
    logoDarkUrl: '/uploads/logo-dark.png',
    faviconUrl: '/uploads/favicon.ico',
    websiteUrl: 'https://example.com',
    supportEmail: 'support@example.com',
    socialLinks: {
      twitter: 'https://twitter.com/test',
      linkedin: 'https://linkedin.com/company/test',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    brandSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BrandingService>(BrandingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBrandSettings', () => {
    it('should return existing brand settings', async () => {
      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);

      const result = await service.getBrandSettings();

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBrandSettings.id);
      expect(result.brandName).toBe(mockBrandSettings.brandName);
      expect(mockPrismaService.brandSettings.findFirst).toHaveBeenCalled();
    });

    it('should create default settings if none exist', async () => {
      mockPrismaService.brandSettings.findFirst.mockResolvedValue(null);
      mockPrismaService.brandSettings.create.mockResolvedValue({
        ...mockBrandSettings,
        brandName: 'Dashboard',
        tagline: null,
        description: null,
      });

      const result = await service.getBrandSettings();

      expect(result).toBeDefined();
      expect(mockPrismaService.brandSettings.create).toHaveBeenCalledWith({
        data: {
          brandName: 'Dashboard',
        },
      });
    });

    it('should handle social links as JSON', async () => {
      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);

      const result = await service.getBrandSettings();

      expect(result.socialLinks).toBeDefined();
      expect(typeof result.socialLinks).toBe('object');
    });
  });

  describe('updateBrandSettings', () => {
    it('should update brand settings', async () => {
      const updateDto = {
        brandName: 'Updated Dashboard',
        tagline: 'New Tagline',
      };

      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);
      mockPrismaService.brandSettings.update.mockResolvedValue({
        ...mockBrandSettings,
        ...updateDto,
      });

      const result = await service.updateBrandSettings(updateDto);

      expect(result.brandName).toBe(updateDto.brandName);
      expect(result.tagline).toBe(updateDto.tagline);
      expect(mockPrismaService.brandSettings.update).toHaveBeenCalledWith({
        where: { id: mockBrandSettings.id },
        data: expect.objectContaining({
          brandName: updateDto.brandName,
          tagline: updateDto.tagline,
        }),
      });
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        brandName: 'Updated Dashboard',
      };

      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);
      mockPrismaService.brandSettings.update.mockResolvedValue({
        ...mockBrandSettings,
        ...updateDto,
      });

      await service.updateBrandSettings(updateDto);

      expect(mockPrismaService.brandSettings.update).toHaveBeenCalledWith({
        where: { id: mockBrandSettings.id },
        data: expect.objectContaining({
          brandName: updateDto.brandName,
        }),
      });
    });

    it('should update social links', async () => {
      const updateDto = {
        socialLinks: {
          twitter: 'https://twitter.com/updated',
          facebook: 'https://facebook.com/updated',
        },
      };

      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);
      mockPrismaService.brandSettings.update.mockResolvedValue({
        ...mockBrandSettings,
        socialLinks: updateDto.socialLinks,
      });

      const result = await service.updateBrandSettings(updateDto);

      expect(result.socialLinks).toEqual(updateDto.socialLinks);
    });
  });

  describe('resetToDefault', () => {
    it('should reset all settings to defaults', async () => {
      const defaultSettings = {
        ...mockBrandSettings,
        brandName: 'Dashboard',
        tagline: null,
        description: null,
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        websiteUrl: null,
        supportEmail: null,
        socialLinks: null,
      };

      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);
      mockPrismaService.brandSettings.update.mockResolvedValue(defaultSettings);

      const result = await service.resetToDefault();

      expect(result.brandName).toBe('Dashboard');
      expect(result.tagline).toBeNull();
      expect(result.logoUrl).toBeNull();
      expect(mockPrismaService.brandSettings.update).toHaveBeenCalledWith({
        where: { id: mockBrandSettings.id },
        data: expect.objectContaining({
          brandName: 'Dashboard',
          tagline: undefined,
          logoUrl: undefined,
        }),
      });
    });
  });

  describe('Type Safety', () => {
    it('should handle all required fields', async () => {
      mockPrismaService.brandSettings.findFirst.mockResolvedValue(mockBrandSettings);

      const result = await service.getBrandSettings();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('brandName');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle optional fields', async () => {
      const minimalSettings = {
        id: 'brand-1',
        brandName: 'Dashboard',
        tagline: null,
        description: null,
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        websiteUrl: null,
        supportEmail: null,
        socialLinks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.brandSettings.findFirst.mockResolvedValue(minimalSettings);

      const result = await service.getBrandSettings();

      expect(result.tagline).toBeNull();
      expect(result.description).toBeNull();
      expect(result.logoUrl).toBeNull();
    });
  });
});
