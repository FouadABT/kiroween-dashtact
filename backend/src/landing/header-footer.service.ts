import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HeaderConfigDto,
  UpdateHeaderConfigDto,
} from './dto/header-config.dto';
import {
  FooterConfigDto,
  UpdateFooterConfigDto,
} from './dto/footer-config.dto';

@Injectable()
export class HeaderFooterService {
  constructor(private prisma: PrismaService) {}

  // Header Configuration Methods
  async getHeaderConfig(): Promise<any> {
    const configs = await this.prisma.headerConfig.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (configs.length === 0) {
      // Return default header config
      return this.createDefaultHeaderConfig();
    }

    return configs[0];
  }

  async updateHeaderConfig(dto: UpdateHeaderConfigDto): Promise<any> {
    const existing = await this.getHeaderConfig();

    if (existing.id) {
      // Only update fields that are provided
      const updateData: any = {};
      
      if (dto.logoLight !== undefined) updateData.logoLight = dto.logoLight;
      if (dto.logoDark !== undefined) updateData.logoDark = dto.logoDark;
      if (dto.logoSize !== undefined) updateData.logoSize = dto.logoSize;
      if (dto.logoLink !== undefined) updateData.logoLink = dto.logoLink;
      if (dto.navigation !== undefined) updateData.navigation = dto.navigation;
      if (dto.ctas !== undefined) updateData.ctas = dto.ctas;
      if (dto.style !== undefined) updateData.style = dto.style;
      if (dto.mobileMenu !== undefined) updateData.mobileMenu = dto.mobileMenu;

      return this.prisma.headerConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    return this.createHeaderConfig(dto as HeaderConfigDto);
  }

  async createHeaderConfig(dto: HeaderConfigDto): Promise<any> {
    return this.prisma.headerConfig.create({
      data: {
        logoLight: dto.logoLight,
        logoDark: dto.logoDark,
        logoSize: dto.logoSize,
        logoLink: dto.logoLink,
        navigation: dto.navigation as any,
        ctas: dto.ctas as any,
        style: dto.style as any,
        mobileMenu: dto.mobileMenu as any,
      },
    });
  }

  private async createDefaultHeaderConfig(): Promise<any> {
    const defaultConfig: HeaderConfigDto = {
      logoSize: 'md',
      logoLink: '/',
      navigation: [],
      ctas: [],
      style: {
        // No background color - uses theme colors
        sticky: true,
        stickyBehavior: 'always',
        transparent: false,
        shadow: true,
      },
      mobileMenu: {
        enabled: true,
        iconStyle: 'hamburger',
        animation: 'slide',
      },
    };

    return this.createHeaderConfig(defaultConfig);
  }

  // Footer Configuration Methods
  async getFooterConfig(): Promise<any> {
    const configs = await this.prisma.footerConfig.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (configs.length === 0) {
      // Return default footer config
      return this.createDefaultFooterConfig();
    }

    return configs[0];
  }

  async updateFooterConfig(dto: UpdateFooterConfigDto): Promise<any> {
    const existing = await this.getFooterConfig();

    if (existing.id) {
      // Only update fields that are provided
      const updateData: any = {};
      
      if (dto.layout !== undefined) updateData.layout = dto.layout;
      if (dto.columns !== undefined) updateData.columns = dto.columns;
      if (dto.social !== undefined) updateData.social = dto.social;
      if (dto.newsletter !== undefined) updateData.newsletter = dto.newsletter;
      if (dto.copyright !== undefined) updateData.copyright = dto.copyright;
      if (dto.legalLinks !== undefined) updateData.legalLinks = dto.legalLinks;
      if (dto.style !== undefined) updateData.style = dto.style;

      return this.prisma.footerConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    return this.createFooterConfig(dto as FooterConfigDto);
  }

  async createFooterConfig(dto: FooterConfigDto): Promise<any> {
    return this.prisma.footerConfig.create({
      data: {
        layout: dto.layout,
        columns: dto.columns as any,
        social: dto.social as any,
        newsletter: dto.newsletter as any,
        copyright: dto.copyright,
        legalLinks: dto.legalLinks as any,
        style: dto.style as any,
      },
    });
  }

  private async createDefaultFooterConfig(): Promise<any> {
    const currentYear = new Date().getFullYear();
    const defaultConfig: FooterConfigDto = {
      layout: 'multi-column',
      columns: [],
      social: [],
      newsletter: {
        enabled: false,
        title: 'Subscribe to our newsletter',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
      },
      copyright: `© ${currentYear} {brand}. All rights reserved.`,
      legalLinks: [],
      style: {
        // No background/text colors - uses theme colors
        borderTop: true,
      },
    };

    return this.createFooterConfig(defaultConfig);
  }

  // Branding Sync Methods
  async syncWithBranding(brandSettings: any): Promise<void> {
    const headerConfig = await this.getHeaderConfig();
    const footerConfig = await this.getFooterConfig();

    // Update header with branding
    if (brandSettings.logoUrl) {
      await this.updateHeaderConfig({
        logoLight: brandSettings.logoUrl,
        logoDark: brandSettings.logoDarkUrl || brandSettings.logoUrl,
      });
    }

    // Update footer with branding
    if (brandSettings.brandName) {
      const currentYear = new Date().getFullYear();
      await this.updateFooterConfig({
        copyright: `© ${currentYear} ${brandSettings.brandName}. All rights reserved.`,
      });
    }

    // Update social links if available
    if (brandSettings.socialLinks) {
      const socialLinks = Object.entries(brandSettings.socialLinks)
        .filter(([_, url]) => url)
        .map(([platform, url]) => ({
          platform,
          url: url as string,
          icon: platform,
        }));

      if (socialLinks.length > 0) {
        await this.updateFooterConfig({
          social: socialLinks,
        });
      }
    }
  }
}
