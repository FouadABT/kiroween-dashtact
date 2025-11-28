import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandingService } from './branding.service';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { BrandSettingsResponseDto } from './dto/brand-settings-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  /**
   * GET /api/branding - Get current brand settings (public endpoint)
   */
  @Get()
  async getBrandSettings(): Promise<BrandSettingsResponseDto> {
    return this.brandingService.getBrandSettings();
  }

  /**
   * PUT /api/branding - Update brand settings (admin only)
   */
  @Put()
  @UseGuards(JwtAuthGuard)
  @Permissions('branding:manage')
  async updateBrandSettings(
    @Body() dto: UpdateBrandSettingsDto,
  ): Promise<BrandSettingsResponseDto> {
    return this.brandingService.updateBrandSettings(dto);
  }

  /**
   * POST /api/branding/logo - Upload logo (admin only)
   */
  @Post('logo')
  @UseGuards(JwtAuthGuard)
  @Permissions('branding:manage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    return this.brandingService.uploadLogo(file, false);
  }

  /**
   * POST /api/branding/logo-dark - Upload dark mode logo (admin only)
   */
  @Post('logo-dark')
  @UseGuards(JwtAuthGuard)
  @Permissions('branding:manage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogoDark(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    return this.brandingService.uploadLogo(file, true);
  }

  /**
   * POST /api/branding/favicon - Upload favicon (admin only)
   */
  @Post('favicon')
  @UseGuards(JwtAuthGuard)
  @Permissions('branding:manage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFavicon(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    return this.brandingService.uploadFavicon(file);
  }

  /**
   * POST /api/branding/reset - Reset to defaults (admin only)
   */
  @Post('reset')
  @UseGuards(JwtAuthGuard)
  @Permissions('branding:manage')
  async resetBranding(): Promise<BrandSettingsResponseDto> {
    return this.brandingService.resetToDefault();
  }
}
