import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { DNDSettingsDto } from './dto/dnd-settings.dto';
import { NotificationPreference, NotificationCategory } from '@prisma/client';

@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(
    private readonly preferencesService: NotificationPreferencesService,
  ) {}

  /**
   * Get all preferences for current user
   * GET /notifications/preferences
   */
  @Get()
  async getPreferences(
    @CurrentUser() user: any,
  ): Promise<NotificationPreference[]> {
    return this.preferencesService.getPreferences(user.id);
  }

  /**
   * Get preference for specific category
   * GET /notifications/preferences/:category
   */
  @Get(':category')
  async getPreference(
    @CurrentUser() user: any,
    @Param('category') category: NotificationCategory,
  ): Promise<NotificationPreference> {
    return this.preferencesService.getPreference(user.id, category);
  }

  /**
   * Update preference for specific category
   * PATCH /notifications/preferences/:category
   */
  @Patch(':category')
  async updatePreference(
    @CurrentUser() user: any,
    @Param('category') category: NotificationCategory,
    @Body() data: UpdatePreferenceDto,
  ): Promise<NotificationPreference> {
    return this.preferencesService.updatePreference(user.id, category, data);
  }

  /**
   * Set Do Not Disturb settings
   * PATCH /notifications/preferences/dnd
   */
  @Patch('dnd/settings')
  @HttpCode(HttpStatus.OK)
  async setDND(
    @CurrentUser() user: any,
    @Body() settings: DNDSettingsDto,
  ): Promise<{ message: string }> {
    await this.preferencesService.setDND(user.id, settings);
    return { message: 'Do Not Disturb settings updated successfully' };
  }

  /**
   * Reset preferences to defaults
   * POST /notifications/preferences/reset
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetToDefaults(
    @CurrentUser() user: any,
  ): Promise<NotificationPreference[]> {
    return this.preferencesService.resetToDefaults(user.id);
  }
}
