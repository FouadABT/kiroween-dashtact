import { Test, TestingModule } from '@nestjs/testing';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { BrandSettingsResponseDto } from './dto/brand-settings-response.dto';

describe('BrandingController', () => {
  let controller: BrandingController;
  let service: BrandingService;

  const mockBrandSettings: BrandSettingsResponseDto = {
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
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBrandingService = {
    getBrandSettings: jest.fn(),
    updateBrandSettings: jest.fn(),
    uploadLogo: jest.fn(),
    uploadFavicon: jest.fn(),
    resetToDefault: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandingController],
      providers: [
        {
          provide: BrandingService,
          useValue: mockBrandingService,
        },
      ],
    }).compile();

    controller = module.get<BrandingController>(BrandingController);
    service = module.get<BrandingService>(BrandingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /branding', () => {
    it('should return brand settings', async () => {
      mockBrandingService.getBrandSettings.mockResolvedValue(mockBrandSettings);

      const result = await controller.getBrandSettings();

      expect(result).toEqual(mockBrandSettings);
      expect(mockBrandingService.getBrandSettings).toHaveBeenCalled();
    });

    it('should be publicly accessible', async () => {
      mockBrandingService.getBrandSettings.mockResolvedValue(mockBrandSettings);

      const result = await controller.getBrandSettings();

      expect(result).toBeDefined();
    });
  });

  describe('PUT /branding', () => {
    it('should update brand settings', async () => {
      const updateDto = {
        brandName: 'Updated Dashboard',
        tagline: 'New Tagline',
      };

      const updatedSettings = {
        ...mockBrandSettings,
        ...updateDto,
      };

      mockBrandingService.updateBrandSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateBrandSettings(updateDto);

      expect(result.brandName).toBe(updateDto.brandName);
      expect(result.tagline).toBe(updateDto.tagline);
      expect(mockBrandingService.updateBrandSettings).toHaveBeenCalledWith(updateDto);
    });

    it('should validate DTO fields', async () => {
      const updateDto = {
        brandName: 'Updated Dashboard',
        websiteUrl: 'https://example.com',
        supportEmail: 'support@example.com',
      };

      mockBrandingService.updateBrandSettings.mockResolvedValue({
        ...mockBrandSettings,
        ...updateDto,
      });

      const result = await controller.updateBrandSettings(updateDto);

      expect(result.websiteUrl).toBe(updateDto.websiteUrl);
      expect(result.supportEmail).toBe(updateDto.supportEmail);
    });
  });

  describe('POST /branding/logo', () => {
    it('should upload logo', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'logo.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const uploadResponse = { url: '/uploads/logo.png' };
      mockBrandingService.uploadLogo.mockResolvedValue(uploadResponse);

      const result = await controller.uploadLogo(mockFile);

      expect(result).toEqual(uploadResponse);
      expect(mockBrandingService.uploadLogo).toHaveBeenCalledWith(mockFile, false);
    });
  });

  describe('POST /branding/logo-dark', () => {
    it('should upload dark mode logo', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'logo-dark.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const uploadResponse = { url: '/uploads/logo-dark.png' };
      mockBrandingService.uploadLogo.mockResolvedValue(uploadResponse);

      const result = await controller.uploadLogoDark(mockFile);

      expect(result).toEqual(uploadResponse);
      expect(mockBrandingService.uploadLogo).toHaveBeenCalledWith(mockFile, true);
    });
  });

  describe('POST /branding/favicon', () => {
    it('should upload favicon', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'favicon.ico',
        encoding: '7bit',
        mimetype: 'image/x-icon',
        buffer: Buffer.from('test'),
        size: 512,
      } as Express.Multer.File;

      const uploadResponse = { url: '/uploads/favicon.ico' };
      mockBrandingService.uploadFavicon.mockResolvedValue(uploadResponse);

      const result = await controller.uploadFavicon(mockFile);

      expect(result).toEqual(uploadResponse);
      expect(mockBrandingService.uploadFavicon).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('POST /branding/reset', () => {
    it('should reset to default branding', async () => {
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

      mockBrandingService.resetToDefault.mockResolvedValue(defaultSettings);

      const result = await controller.resetBranding();

      expect(result.brandName).toBe('Dashboard');
      expect(result.tagline).toBeNull();
      expect(mockBrandingService.resetToDefault).toHaveBeenCalled();
    });
  });

  describe('Response Structure', () => {
    it('should return properly structured response', async () => {
      mockBrandingService.getBrandSettings.mockResolvedValue(mockBrandSettings);

      const result = await controller.getBrandSettings();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('brandName');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle null optional fields', async () => {
      const minimalSettings = {
        ...mockBrandSettings,
        tagline: null,
        description: null,
        logoUrl: null,
      };

      mockBrandingService.getBrandSettings.mockResolvedValue(minimalSettings);

      const result = await controller.getBrandSettings();

      expect(result.tagline).toBeNull();
      expect(result.description).toBeNull();
      expect(result.logoUrl).toBeNull();
    });
  });
});
