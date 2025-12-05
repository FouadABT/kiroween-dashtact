import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LegalPageType } from '@prisma/client';

@Injectable()
export class LegalPagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get legal page content by page type
   * @param pageType - Type of legal page (TERMS or PRIVACY)
   * @returns Legal page or null if not found
   */
  async getLegalPage(pageType: LegalPageType) {
    try {
      const legalPage = await this.prisma.legalPage.findUnique({
        where: { pageType },
      });

      return legalPage;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch legal page: ${error.message}`);
    }
  }

  /**
   * Update or create legal page content
   * @param pageType - Type of legal page (TERMS or PRIVACY)
   * @param content - HTML content of the page
   * @returns Updated or created legal page
   */
  async updateLegalPage(pageType: LegalPageType, content: string) {
    try {
      const legalPage = await this.prisma.legalPage.upsert({
        where: { pageType },
        update: {
          content,
          updatedAt: new Date(),
        },
        create: {
          pageType,
          content,
        },
      });

      return legalPage;
    } catch (error) {
      throw new BadRequestException(`Failed to update legal page: ${error.message}`);
    }
  }

  /**
   * Validate page type string and convert to enum
   * @param pageType - String to validate
   * @returns LegalPageType enum value
   * @throws BadRequestException if invalid
   */
  validatePageType(pageType: string): LegalPageType {
    const upperPageType = pageType.toUpperCase();
    
    if (upperPageType !== 'TERMS' && upperPageType !== 'PRIVACY') {
      throw new BadRequestException(
        `Invalid page type. Must be 'TERMS' or 'PRIVACY'`
      );
    }

    return upperPageType as LegalPageType;
  }
}
