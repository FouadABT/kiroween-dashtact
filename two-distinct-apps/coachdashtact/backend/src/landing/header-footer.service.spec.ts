import { Test, TestingModule } from '@nestjs/testing';
import { HeaderFooterService } from './header-footer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HeaderFooterService', () => {
  let service: HeaderFooterService;
  let prisma: PrismaService;

  const mockPrismaService = {
    headerConfig: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    footerConfig: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    brandingSettings: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderFooterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HeaderFooterService>(HeaderFooterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHeaderConfig', () => {
    it('should return existing header config', async () => {
      const mockConfig = {
        id: 'header-1',
        logoLight: '/logo-light.png',
        logoDark: '/logo-dark.png',
        logoSize: 'md',
        logoLink: '/',
        navigation: [],
        ctas: [],
        style: {},
        mobileMenu: {},
      };

      mockPrismaService.headerConfig.findMany.mockResolvedValue([mockConfig]);

      const result = await service.getHeaderConfig();

      expect(result).toEqual(mockConfig);
      expect(mockPrismaService.headerConfig.findMany).toHaveBeenCalled();
    });

    it('should create default header config if none exists', async () => {
      mockPrismaService.headerConfig.findMany.mockResolvedValue([]);
      mockPrismaService.headerConfig.create.mockResolvedValue({
        id: 'header-1',
        logoSize: 'md',
        logoLink: '/',
        navigation: [],
        ctas: [],
        style: {},
        mobileMenu: {},
      });

      const result = await service.getHeaderConfig();

      expect(mockPrismaService.headerConfig.create).toHaveBeenCalled();
      expect(result.logoSize).toBe('md');
    });
  });

  describe('updateHeaderConfig', () => {
    it('should update header configuration', async () => {
      const existingConfig = {
        id: 'header-1',
        logoSize: 'md',
      };

      const updateDto = {
        logoLight: '/new-logo.png',
        logoSize: 'lg',
      };

      mockPrismaService.headerConfig.findMany.mockResolvedValue([
        existingConfig,
      ]);
      mockPrismaService.headerConfig.update.mockResolvedValue({
        ...existingConfig,
        ...updateDto,
      });

      const result = await service.updateHeaderConfig(updateDto);

      expect(mockPrismaService.headerConfig.update).toHaveBeenCalledWith({
        where: { id: existingConfig.id },
        data: updateDto,
      });
      expect(result.logoSize).toBe('lg');
    });
  });

  describe('getFooterConfig', () => {
    it('should return existing footer config', async () => {
      const mockConfig = {
        id: 'footer-1',
        layout: 'multi-column',
        columns: [],
        social: [],
        newsletter: {},
        copyright: '© 2024',
        legalLinks: [],
        style: {},
      };

      mockPrismaService.footerConfig.findMany.mockResolvedValue([mockConfig]);

      const result = await service.getFooterConfig();

      expect(result).toEqual(mockConfig);
    });

    it('should create default footer config if none exists', async () => {
      mockPrismaService.footerConfig.findMany.mockResolvedValue([]);
      mockPrismaService.footerConfig.create.mockResolvedValue({
        id: 'footer-1',
        layout: 'multi-column',
        columns: [],
        social: [],
        newsletter: {},
        copyright: '© 2024',
        legalLinks: [],
        style: {},
      });

      const result = await service.getFooterConfig();

      expect(mockPrismaService.footerConfig.create).toHaveBeenCalled();
    });
  });

  describe('updateFooterConfig', () => {
    it('should update footer configuration', async () => {
      const existingConfig = {
        id: 'footer-1',
        layout: 'multi-column',
      };

      const updateDto = {
        layout: 'centered',
        copyright: '© 2024 Company',
      };

      mockPrismaService.footerConfig.findMany.mockResolvedValue([
        existingConfig,
      ]);
      mockPrismaService.footerConfig.update.mockResolvedValue({
        ...existingConfig,
        ...updateDto,
      });

      const result = await service.updateFooterConfig(updateDto);

      expect(result.layout).toBe('centered');
    });
  });

  describe('syncWithBranding', () => {
    it('should sync header and footer with branding settings', async () => {
      const brandingSettings = {
        id: 'branding-1',
        brandName: 'Test Company',
        logoUrl: '/brand-logo.png',
        primaryColor: '#000000',
        socialLinks: {
          twitter: 'https://twitter.com/test',
          facebook: 'https://facebook.com/test',
        },
      };

      const headerConfig = {
        id: 'header-1',
        logoLight: '/old-logo.png',
      };

      const footerConfig = {
        id: 'footer-1',
        social: [],
      };

      mockPrismaService.brandingSettings.findFirst.mockResolvedValue(
        brandingSettings,
      );
      mockPrismaService.headerConfig.findMany.mockResolvedValue([headerConfig]);
      mockPrismaService.footerConfig.findMany.mockResolvedValue([footerConfig]);
      mockPrismaService.headerConfig.update.mockResolvedValue({
        ...headerConfig,
        logoLight: brandingSettings.logoUrl,
      });
      mockPrismaService.footerConfig.update.mockResolvedValue({
        ...footerConfig,
        social: [
          { platform: 'twitter', url: brandingSettings.socialLinks.twitter },
          { platform: 'facebook', url: brandingSettings.socialLinks.facebook },
        ],
      });

      await service.syncWithBranding();

      expect(mockPrismaService.headerConfig.update).toHaveBeenCalled();
      expect(mockPrismaService.footerConfig.update).toHaveBeenCalled();
    });
  });
});
