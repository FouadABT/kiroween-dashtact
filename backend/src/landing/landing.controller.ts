import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LandingService } from './landing.service';
import { UpdateLandingContentDto } from './dto/update-landing-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UploadsService } from '../uploads/uploads.service';

@Controller('landing')
export class LandingController {
  constructor(
    private readonly landingService: LandingService,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Get landing page content (public)
   * GET /landing
   * Cached for 5 minutes via HTTP headers
   */
  @Public()
  @Header('Cache-Control', 'public, max-age=300, s-maxage=300')
  @Get()
  async getContent() {
    return this.landingService.getContent();
  }

  /**
   * Get landing page content (admin)
   * GET /landing/admin
   * Requires: landing:read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @Get('admin')
  async getContentAdmin() {
    return this.landingService.getContent();
  }

  /**
   * Update landing page content
   * PATCH /landing
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Patch()
  async updateContent(
    @Body() updateLandingContentDto: UpdateLandingContentDto,
  ) {
    return this.landingService.updateContent(updateLandingContentDto);
  }

  /**
   * Reset landing page to defaults
   * POST /landing/reset
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('reset')
  async resetToDefaults() {
    return this.landingService.resetToDefaults();
  }

  /**
   * Upload section image
   * POST /landing/section-image
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('section-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSectionImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file using uploads service
    const uploadResult = await this.uploadsService.uploadFile(file, {
      type: 'image',
    });

    return {
      url: uploadResult.url,
      filename: uploadResult.filename,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
    };
  }
}
