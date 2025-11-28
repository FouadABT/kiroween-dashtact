import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LegalPagesService } from './legal-pages.service';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPageResponseDto } from './dto/legal-page-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  /**
   * GET /legal-pages/:pageType
   * Get legal page content (public access)
   * @param pageType - Type of legal page (terms or privacy)
   * @returns Legal page content
   */
  @Public()
  @Get(':pageType')
  async getLegalPage(
    @Param('pageType') pageType: string,
  ): Promise<LegalPageResponseDto | null> {
    const validatedPageType = this.legalPagesService.validatePageType(pageType);
    const legalPage = await this.legalPagesService.getLegalPage(validatedPageType);

    if (!legalPage) {
      return null;
    }

    return {
      id: legalPage.id,
      pageType: legalPage.pageType,
      content: legalPage.content,
      createdAt: legalPage.createdAt,
      updatedAt: legalPage.updatedAt,
    };
  }

  /**
   * PUT /legal-pages/:pageType
   * Update legal page content (admin only)
   * @param pageType - Type of legal page (terms or privacy)
   * @param updateDto - Content to update
   * @returns Updated legal page
   */
  @Put(':pageType')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  async updateLegalPage(
    @Param('pageType') pageType: string,
    @Body() updateDto: UpdateLegalPageDto,
  ): Promise<LegalPageResponseDto> {
    const validatedPageType = this.legalPagesService.validatePageType(pageType);
    const legalPage = await this.legalPagesService.updateLegalPage(
      validatedPageType,
      updateDto.content,
    );

    return {
      id: legalPage.id,
      pageType: legalPage.pageType,
      content: legalPage.content,
      createdAt: legalPage.createdAt,
      updatedAt: legalPage.updatedAt,
    };
  }
}
