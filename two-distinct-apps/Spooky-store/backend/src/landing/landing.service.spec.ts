import { Test, TestingModule } from '@nestjs/testing';
import { LandingService } from './landing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateLandingContentDto } from './dto/update-landing-content.dto';

describe('LandingService', () => {
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
    id: 'landing-id-1',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Welcome',
          subheadline: 'Test subtitle',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          textAlignment: 'center',
          height: 'large',
        },
      },
      {
        id: 'features-1',
        type: 'features',
        enabled: true,
        order: 2,
        data: {
          title: 'Features',
          layout: 'grid',
          columns: 3,
          features: [
            {
              id: 'feature-1',
              icon: 'zap',
              title: 'Fast',
              description: 'Lightning fast',
              order: 1,
            },
          ],
        },
      },
    ],
    settings: {
      theme: {
        primaryColor: 'oklch(0.5 0.2 250)',
      },
      layout: {
        maxWidth: 'container',
        spacing: 'normal',
      },
      seo: {
        title: 'Test Site',
        description: 'Test description',
      },
    },
    version: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: new Date('2024-01-01'),
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

    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear cache before each test
    service['contentCache'] = null;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContent', () => {
    it('should return landing page content from database', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      const result = await service.getContent();

      expect(result).toEqual(mockLandingContent);
      expect(mockPrismaService.landingPageContent.findFirst).toHaveBeenCalledWith(
        {
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
        },
      );
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(null);

      await expect(service.getContent()).rejects.toThrow(NotFoundException);
      await expect(service.getContent()).rejects.toThrow(
        'Landing page content not found',
      );
    });

    it('should cache content after first fetch', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      // First call - should fetch from database
      const result1 = await service.getContent();
      expect(mockPrismaService.landingPageContent.findFirst).toHaveBeenCalledTimes(
        1,
      );

      // Second call - should use cache
      const result2 = await service.getContent();
      expect(mockPrismaService.landingPageContent.findFirst).toHaveBeenCalledTimes(
        1,
      );

      expect(result1).toEqual(result2);
    });

    it('should refresh cache after TTL expires', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      // First call
      await service.getContent();
      expect(mockPrismaService.landingPageContent.findFirst).toHaveBeenCalledTimes(
        1,
      );

      // Manually expire cache by setting old timestamp
      service['contentCache'] = {
        data: mockLandingContent,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (past TTL)
      };

      // Second call - should fetch from database again
      await service.getContent();
      expect(mockPrismaService.landingPageContent.findFirst).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  describe('updateContent', () => {
    it('should update landing page content successfully', async () => {
      const updateDto: UpdateLandingContentDto = {
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            data: {
              headline: 'Updated Headline',
              subheadline: 'Updated subtitle',
              primaryCta: {
                text: 'Start Now',
                link: '/start',
                linkType: 'url',
              },
              backgroundType: 'solid',
              textAlignment: 'left',
              height: 'medium',
            },
          },
        ],
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        sections: updateDto.sections,
      });

      const result = await service.updateContent(updateDto);

      expect(result.sections).toEqual(updateDto.sections);
      expect(mockPrismaService.landingPageContent.update).toHaveBeenCalledWith({
        where: { id: mockLandingContent.id },
        data: expect.objectContaining({
          sections: updateDto.sections,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should invalidate cache after update', async () => {
      const updateDto: UpdateLandingContentDto = {
        settings: {
          theme: {
            primaryColor: 'oklch(0.6 0.2 200)',
          },
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: updateDto.settings,
      });

      // Set cache
      service['contentCache'] = {
        data: mockLandingContent,
        timestamp: Date.now(),
      };

      await service.updateContent(updateDto);

      // Cache should be invalidated
      expect(service['contentCache']).toBeNull();
    });

    it('should validate sections before updating', async () => {
      const updateDto: UpdateLandingContentDto = {
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            data: {
              headline: 'Test',
              subheadline: 'Test',
              primaryCta: {
                text: 'Click',
                link: '/test',
                linkType: 'url',
              },
              backgroundType: 'gradient',
              textAlignment: 'center',
              height: 'large',
            },
          },
        ],
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        sections: updateDto.sections,
      });

      const validateSectionSpy = jest.spyOn(service, 'validateSection');

      await service.updateContent(updateDto);

      expect(validateSectionSpy).toHaveBeenCalledWith(updateDto.sections[0]);
    });

    it('should throw BadRequestException for invalid section data', async () => {
      const updateDto: UpdateLandingContentDto = {
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            data: {
              // Missing required fields
              headline: '',
            },
          },
        ],
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      await expect(service.updateContent(updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should preserve existing data when partial update', async () => {
      const updateDto: UpdateLandingContentDto = {
        settings: {
          theme: {
            primaryColor: 'oklch(0.7 0.15 180)',
          },
        },
      };

      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        settings: updateDto.settings,
      });

      await service.updateContent(updateDto);

      expect(mockPrismaService.landingPageContent.update).toHaveBeenCalledWith({
        where: { id: mockLandingContent.id },
        data: expect.objectContaining({
          sections: mockLandingContent.sections,
          settings: updateDto.settings,
        }),
      });
    });
  });

  describe('resetToDefaults', () => {
    it('should reset landing page to default content', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        ...mockLandingContent,
        sections: expect.any(Array),
        settings: expect.any(Object),
      });

      const result = await service.resetToDefaults();

      expect(mockPrismaService.landingPageContent.update).toHaveBeenCalledWith({
        where: { id: mockLandingContent.id },
        data: expect.objectContaining({
          sections: expect.any(Array),
          settings: expect.any(Object),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should include default hero section', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      let capturedSections: any;
      mockPrismaService.landingPageContent.update.mockImplementation(
        ({ data }) => {
          capturedSections = data.sections;
          return Promise.resolve({
            ...mockLandingContent,
            sections: data.sections,
            settings: data.settings,
          });
        },
      );

      await service.resetToDefaults();

      const heroSection = capturedSections.find((s: any) => s.type === 'hero');
      expect(heroSection).toBeDefined();
      expect(heroSection.data.headline).toBe('Welcome to Our Platform');
      expect(heroSection.data.primaryCta).toBeDefined();
    });

    it('should include default features section', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      let capturedSections: any;
      mockPrismaService.landingPageContent.update.mockImplementation(
        ({ data }) => {
          capturedSections = data.sections;
          return Promise.resolve({
            ...mockLandingContent,
            sections: data.sections,
          });
        },
      );

      await service.resetToDefaults();

      const featuresSection = capturedSections.find(
        (s: any) => s.type === 'features',
      );
      expect(featuresSection).toBeDefined();
      expect(featuresSection.data.features).toHaveLength(3);
    });

    it('should include default CTA section', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      let capturedSections: any;
      mockPrismaService.landingPageContent.update.mockImplementation(
        ({ data }) => {
          capturedSections = data.sections;
          return Promise.resolve({
            ...mockLandingContent,
            sections: data.sections,
          });
        },
      );

      await service.resetToDefaults();

      const ctaSection = capturedSections.find((s: any) => s.type === 'cta');
      expect(ctaSection).toBeDefined();
      expect(ctaSection.data.title).toBe('Ready to Get Started?');
    });

    it('should include default footer section', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      let capturedSections: any;
      mockPrismaService.landingPageContent.update.mockImplementation(
        ({ data }) => {
          capturedSections = data.sections;
          return Promise.resolve({
            ...mockLandingContent,
            sections: data.sections,
          });
        },
      );

      await service.resetToDefaults();

      const footerSection = capturedSections.find(
        (s: any) => s.type === 'footer',
      );
      expect(footerSection).toBeDefined();
      expect(footerSection.data.companyName).toBe('Dashboard Application');
    });

    it('should include default settings', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );

      let capturedSettings: any;
      mockPrismaService.landingPageContent.update.mockImplementation(
        ({ data }) => {
          capturedSettings = data.settings;
          return Promise.resolve({
            ...mockLandingContent,
            settings: data.settings,
          });
        },
      );

      await service.resetToDefaults();

      expect(capturedSettings).toHaveProperty('theme');
      expect(capturedSettings).toHaveProperty('layout');
      expect(capturedSettings).toHaveProperty('seo');
      expect(capturedSettings.seo.title).toBe('Dashboard Application');
    });

    it('should invalidate cache after reset', async () => {
      mockPrismaService.landingPageContent.findFirst.mockResolvedValue(
        mockLandingContent,
      );
      mockPrismaService.landingPageContent.update.mockResolvedValue(
        mockLandingContent,
      );

      // Set cache
      service['contentCache'] = {
        data: mockLandingContent,
        timestamp: Date.now(),
      };

      await service.resetToDefaults();

      // Cache should be invalidated
      expect(service['contentCache']).toBeNull();
    });
  });

  describe('validateSection', () => {
    it('should validate hero section successfully', async () => {
      const heroSection = {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Test Headline',
          subheadline: 'Test Subheadline',
          primaryCta: {
            text: 'Click Me',
            link: '/test',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          textAlignment: 'center',
          height: 'large',
        },
      };

      const result = await service.validateSection(heroSection);

      expect(result).toBe(true);
    });

    it('should validate features section successfully', async () => {
      const featuresSection = {
        id: 'features-1',
        type: 'features',
        enabled: true,
        order: 2,
        data: {
          title: 'Features',
          layout: 'grid',
          columns: 3,
          features: [
            {
              id: 'f1',
              icon: 'zap',
              title: 'Fast',
              description: 'Very fast',
              order: 1,
            },
          ],
        },
      };

      const result = await service.validateSection(featuresSection);

      expect(result).toBe(true);
    });

    it('should validate CTA section successfully', async () => {
      const ctaSection = {
        id: 'cta-1',
        type: 'cta',
        enabled: true,
        order: 3,
        data: {
          title: 'Call to Action',
          description: 'Take action now',
          primaryCta: {
            text: 'Sign Up',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: 'oklch(0.5 0.2 250)',
          textColor: 'oklch(1 0 0)',
          alignment: 'center',
        },
      };

      const result = await service.validateSection(ctaSection);

      expect(result).toBe(true);
    });

    it('should throw BadRequestException for unknown section type', async () => {
      const invalidSection = {
        id: 'invalid-1',
        type: 'unknown',
        enabled: true,
        order: 1,
        data: {},
      };

      await expect(service.validateSection(invalidSection)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateSection(invalidSection)).rejects.toThrow(
        'Unknown section type: unknown',
      );
    });

    it('should throw BadRequestException for invalid section data', async () => {
      const invalidSection = {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          // Missing required fields
          headline: '',
        },
      };

      await expect(service.validateSection(invalidSection)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate CTA links in section data', async () => {
      const sectionWithCta = {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Test',
          subheadline: 'Test',
          primaryCta: {
            text: 'Click',
            link: '/test',
            linkType: 'url',
          },
          secondaryCta: {
            text: 'Learn',
            link: '/learn',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          textAlignment: 'center',
          height: 'large',
        },
      };

      const validateCtaLinkSpy = jest.spyOn(service, 'validateCtaLink');

      await service.validateSection(sectionWithCta);

      expect(validateCtaLinkSpy).toHaveBeenCalledWith('/test', 'url');
      expect(validateCtaLinkSpy).toHaveBeenCalledWith('/learn', 'url');
    });
  });

  describe('validateCtaLink', () => {
    it('should validate absolute URL successfully', async () => {
      const result = await service.validateCtaLink(
        'https://example.com',
        'url',
      );

      expect(result).toBe(true);
    });

    it('should validate relative URL successfully', async () => {
      const result = await service.validateCtaLink('/about', 'url');

      expect(result).toBe(true);
    });

    it('should throw BadRequestException for invalid URL', async () => {
      await expect(
        service.validateCtaLink('not-a-valid-url', 'url'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.validateCtaLink('not-a-valid-url', 'url'),
      ).rejects.toThrow('Invalid URL format');
    });

    it('should validate page link when page exists', async () => {
      const pageId = 'page-123';
      mockPrismaService.customPage.findUnique.mockResolvedValue({
        id: pageId,
        status: 'PUBLISHED',
      });

      const result = await service.validateCtaLink(pageId, 'page');

      expect(result).toBe(true);
      expect(mockPrismaService.customPage.findUnique).toHaveBeenCalledWith({
        where: { id: pageId },
        select: { id: true, status: true },
      });
    });

    it('should throw BadRequestException when page not found', async () => {
      const pageId = 'non-existent-page';
      mockPrismaService.customPage.findUnique.mockResolvedValue(null);

      await expect(service.validateCtaLink(pageId, 'page')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateCtaLink(pageId, 'page')).rejects.toThrow(
        'Page not found with ID',
      );
    });

    it('should throw BadRequestException for invalid link type', async () => {
      await expect(
        service.validateCtaLink('/test', 'invalid-type'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.validateCtaLink('/test', 'invalid-type'),
      ).rejects.toThrow('Invalid link type');
    });

    it('should validate external URLs with different protocols', async () => {
      await expect(
        service.validateCtaLink('https://example.com', 'url'),
      ).resolves.toBe(true);
      await expect(
        service.validateCtaLink('http://example.com', 'url'),
      ).resolves.toBe(true);
      await expect(
        service.validateCtaLink('mailto:test@example.com', 'url'),
      ).resolves.toBe(true);
    });
  });
});
