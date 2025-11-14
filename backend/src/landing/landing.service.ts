import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLandingContentDto } from './dto/update-landing-content.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HeroSectionDataDto } from './dto/hero-section-data.dto';
import { FeaturesSectionDataDto } from './dto/features-section-data.dto';
import { FooterSectionDataDto } from './dto/footer-section-data.dto';
import { CtaSectionDataDto } from './dto/cta-section-data.dto';
import { TestimonialsSectionDataDto } from './dto/testimonials-section-data.dto';
import { StatsSectionDataDto } from './dto/stats-section-data.dto';
import { ContentSectionDataDto } from './dto/content-section-data.dto';

@Injectable()
export class LandingService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private contentCache: {
    data: any;
    timestamp: number;
  } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active landing page content with caching
   */
  async getContent() {
    // Check cache first
    if (
      this.contentCache &&
      Date.now() - this.contentCache.timestamp < this.CACHE_TTL
    ) {
      return this.contentCache.data;
    }

    // Fetch from database
    const content = await this.prisma.landingPageContent.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!content) {
      throw new NotFoundException('Landing page content not found');
    }

    // Update cache
    this.contentCache = {
      data: content,
      timestamp: Date.now(),
    };

    return content;
  }

  /**
   * Update landing page content
   */
  async updateContent(dto: UpdateLandingContentDto) {
    // Get current content
    const currentContent = await this.getContent();

    // Validate sections if provided
    if (dto.sections) {
      for (const section of dto.sections) {
        const isValid = await this.validateSection(section);
        if (!isValid) {
          throw new BadRequestException(
            `Invalid section data for section type: ${section.type}`,
          );
        }
      }
    }

    // Update content
    const updatedContent = await this.prisma.landingPageContent.update({
      where: { id: currentContent.id },
      data: {
        sections: dto.sections || currentContent.sections,
        settings: dto.settings || currentContent.settings,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache
    this.invalidateCache();

    return updatedContent;
  }

  /**
   * Reset landing page to defaults
   */
  async resetToDefaults() {
    // Get current content
    const currentContent = await this.getContent();

    // Default sections
    const defaultSections = [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Welcome to Our Platform',
          subheadline: 'Build amazing things with our powerful tools',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          secondaryCta: {
            text: 'Learn More',
            link: '/about',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          backgroundColor: 'oklch(0.5 0.2 250)',
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
          title: 'Our Features',
          subtitle: 'Everything you need to succeed',
          layout: 'grid',
          columns: 3,
          features: [
            {
              id: 'feature-1',
              icon: 'zap',
              title: 'Fast Performance',
              description: 'Lightning-fast load times and smooth interactions',
              order: 1,
            },
            {
              id: 'feature-2',
              icon: 'shield',
              title: 'Secure by Default',
              description: 'Enterprise-grade security built into every feature',
              order: 2,
            },
            {
              id: 'feature-3',
              icon: 'users',
              title: 'Team Collaboration',
              description: 'Work together seamlessly with your team',
              order: 3,
            },
          ],
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        enabled: true,
        order: 3,
        data: {
          title: 'Ready to Get Started?',
          description: 'Join thousands of users already using our platform',
          primaryCta: {
            text: 'Sign Up Now',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: 'oklch(0.5 0.2 250)',
          textColor: 'oklch(1 0 0)',
          alignment: 'center',
        },
      },
      {
        id: 'footer-1',
        type: 'footer',
        enabled: true,
        order: 99,
        data: {
          companyName: 'Dashboard Application',
          description: 'Professional dashboard application',
          navLinks: [
            {
              label: 'About',
              url: '/about',
              linkType: 'url',
              order: 1,
            },
            {
              label: 'Contact',
              url: '/contact',
              linkType: 'url',
              order: 2,
            },
          ],
          socialLinks: [
            {
              platform: 'twitter',
              url: 'https://twitter.com',
              icon: 'twitter',
            },
            {
              platform: 'github',
              url: 'https://github.com',
              icon: 'github',
            },
          ],
          copyright: '© 2024 Dashboard Application. All rights reserved.',
          showNewsletter: false,
        },
      },
    ];

    // Default settings
    const defaultSettings = {
      theme: {
        primaryColor: 'oklch(0.5 0.2 250)',
        secondaryColor: 'oklch(0.6 0.15 200)',
      },
      layout: {
        maxWidth: 'container',
        spacing: 'normal',
      },
      seo: {
        title: 'Dashboard Application',
        description: 'Professional dashboard application',
        keywords: 'dashboard, admin, management',
      },
    };

    // Update content
    const updatedContent = await this.prisma.landingPageContent.update({
      where: { id: currentContent.id },
      data: {
        sections: defaultSections,
        settings: defaultSettings,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache
    this.invalidateCache();

    return updatedContent;
  }

  /**
   * Validate section data based on type
   */
  async validateSection(section: any): Promise<boolean> {
    const { type, data } = section;

    // Map section types to their DTOs
    const dtoMap: Record<string, any> = {
      hero: HeroSectionDataDto,
      features: FeaturesSectionDataDto,
      footer: FooterSectionDataDto,
      cta: CtaSectionDataDto,
      testimonials: TestimonialsSectionDataDto,
      stats: StatsSectionDataDto,
      content: ContentSectionDataDto,
    };

    const DtoClass = dtoMap[type];
    if (!DtoClass) {
      throw new BadRequestException(`Unknown section type: ${type}`);
    }

    // Transform and validate
    const dto = plainToClass(DtoClass, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new BadRequestException(
        `Validation failed for ${type} section: ${errorMessages}`,
      );
    }

    // Validate CTA links if present
    if (data.primaryCta) {
      await this.validateCtaLink(
        data.primaryCta.link,
        data.primaryCta.linkType,
      );
    }
    if (data.secondaryCta) {
      await this.validateCtaLink(
        data.secondaryCta.link,
        data.secondaryCta.linkType,
      );
    }

    return true;
  }

  /**
   * Validate CTA button links
   */
  async validateCtaLink(link: string, linkType: string): Promise<boolean> {
    if (linkType === 'url') {
      // For external URLs, just check if it's a valid URL format
      try {
        new URL(link);
        return true;
      } catch {
        // If not a full URL, check if it's a valid relative path or anchor link
        if (link.startsWith('/') || link.startsWith('#')) {
          return true;
        }
        throw new BadRequestException(`Invalid URL format: ${link}`);
      }
    } else if (linkType === 'page') {
      // For page links, validate that the page exists
      const page = await this.prisma.customPage.findUnique({
        where: { id: link },
        select: { id: true, status: true },
      });

      if (!page) {
        throw new BadRequestException(`Page not found with ID: ${link}`);
      }

      return true;
    }

    throw new BadRequestException(`Invalid link type: ${linkType}`);
  }

  /**
   * Invalidate content cache
   */
  private invalidateCache() {
    this.contentCache = null;
  }
}
