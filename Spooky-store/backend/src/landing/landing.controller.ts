import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LandingService } from './landing.service';
import { HeaderFooterService } from './header-footer.service';
import { TemplateService } from './template.service';
import { UpdateLandingContentDto } from './dto/update-landing-content.dto';
import { UpdateHeaderConfigDto } from './dto/header-config.dto';
import { UpdateFooterConfigDto } from './dto/footer-config.dto';
import {
  CreateSectionTemplateDto,
  UpdateSectionTemplateDto,
} from './dto/section-template.dto';
import { UpdateThemeConfigDto } from './dto/theme-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadsService } from '../uploads/uploads.service';

@Controller('landing')
export class LandingController {
  constructor(
    private readonly landingService: LandingService,
    private readonly headerFooterService: HeaderFooterService,
    private readonly templateService: TemplateService,
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
  async uploadSectionImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    
    // Create upload record using new system
    const upload = await this.uploadsService.create(
      {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${baseUrl}/files/${file.filename}`,
        path: file.path,
        type: 'IMAGE',
      },
      user.id,
    );

    return {
      url: upload.url,
      filename: upload.filename,
      size: upload.size,
      mimetype: upload.mimeType,
    };
  }

  // Header Configuration Endpoints

  /**
   * Get header configuration
   * GET /landing/header
   */
  @Public()
  @Get('header')
  async getHeaderConfig() {
    return this.headerFooterService.getHeaderConfig();
  }

  /**
   * Update header configuration
   * PUT /landing/header
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Put('header')
  async updateHeaderConfig(@Body() dto: UpdateHeaderConfigDto) {
    return this.headerFooterService.updateHeaderConfig(dto);
  }

  // Footer Configuration Endpoints

  /**
   * Get footer configuration
   * GET /landing/footer
   */
  @Public()
  @Get('footer')
  async getFooterConfig() {
    return this.headerFooterService.getFooterConfig();
  }

  /**
   * Update footer configuration
   * PUT /landing/footer
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Put('footer')
  async updateFooterConfig(@Body() dto: UpdateFooterConfigDto) {
    try {
      console.log('[Footer Update] Received data:', JSON.stringify(dto, null, 2));
      return await this.headerFooterService.updateFooterConfig(dto);
    } catch (error) {
      console.error('[Footer Update] Error:', error);
      throw error;
    }
  }

  // Template Endpoints

  /**
   * Get section templates
   * GET /landing/templates
   * Query params: category (optional)
   */
  @Public()
  @Get('templates')
  async getTemplates(
    @Query('category') category?: string,
    @CurrentUser() user?: any,
  ) {
    return this.templateService.getTemplates(category, user?.id);
  }

  /**
   * Get template by ID
   * GET /landing/templates/:id
   */
  @Public()
  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.templateService.getTemplateById(id, user?.id);
  }

  /**
   * Create custom template
   * POST /landing/templates
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('templates')
  async createTemplate(
    @Body() dto: CreateSectionTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.templateService.createCustomTemplate(dto, user.id);
  }

  /**
   * Update custom template
   * PUT /landing/templates/:id
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateSectionTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.templateService.updateCustomTemplate(id, dto, user.id);
  }

  /**
   * Delete custom template
   * DELETE /landing/templates/:id
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    await this.templateService.deleteCustomTemplate(id, user.id);
    return { message: 'Template deleted successfully' };
  }

  /**
   * Export template
   * GET /landing/templates/:id/export
   */
  @Public()
  @Get('templates/:id/export')
  async exportTemplate(@Param('id') id: string, @CurrentUser() user?: any) {
    const data = await this.templateService.exportTemplate(id, user?.id);
    return { data };
  }

  /**
   * Import template
   * POST /landing/templates/import
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('templates/import')
  async importTemplate(@Body('data') data: string, @CurrentUser() user: any) {
    return this.templateService.importTemplate(data, user.id);
  }

  // Theme Configuration Endpoints

  /**
   * Get theme configuration
   * GET /landing/theme
   */
  @Public()
  @Get('theme')
  async getThemeConfig() {
    return this.landingService.getThemeConfig();
  }

  /**
   * Update theme configuration
   * PUT /landing/theme
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Put('theme')
  async updateThemeConfig(@Body() dto: UpdateThemeConfigDto) {
    // Convert DTO to service format
    const themeDto = {
      themeMode: dto.mode,
      colors: {
        primary: dto.primary,
        secondary: dto.secondary,
        accent: dto.accent,
      },
    };
    return this.landingService.updateThemeConfig(themeDto);
  }

  // Branding Sync Endpoint

  /**
   * Sync branding settings
   * POST /landing/sync-branding
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('sync-branding')
  async syncBranding(@Body() brandSettings: any) {
    await this.landingService.syncBranding(brandSettings);
    await this.headerFooterService.syncWithBranding(brandSettings);
    return { message: 'Branding synced successfully' };
  }

  // Settings Endpoints

  /**
   * Get landing page settings (public)
   * GET /landing/settings
   * Public endpoint - settings are applied to landing page
   */
  @Public()
  @Get('settings')
  async getSettings() {
    return this.landingService.getSettings();
  }

  /**
   * Update landing page settings
   * PATCH /landing/settings
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Patch('settings')
  async updateSettings(@Body() settingsDto: any) {
    return this.landingService.updateSettings(settingsDto);
  }



  // Bulk Branding Update Endpoint

  /**
   * Apply branding to all landing pages
   * POST /landing/apply-branding-all
   * Requires: landing:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:write')
  @Post('apply-branding-all')
  async applyBrandingToAll(@Body() brandSettings: any) {
    return this.landingService.applyBrandingToAll(brandSettings);
  }
}
