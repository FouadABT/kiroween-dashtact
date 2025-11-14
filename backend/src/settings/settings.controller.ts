import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto, SettingsScope } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Create new settings
   * POST /settings
   * Requires: settings:admin permission (for creating settings)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('settings:admin')
  async create(
    @Body() createSettingsDto: CreateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.create(createSettingsDto);
  }

  /**
   * Get all settings
   * GET /settings
   * Requires: settings:admin permission (for viewing all settings)
   */
  @Get()
  @Permissions('settings:admin')
  async findAll(): Promise<SettingsResponseDto[]> {
    return this.settingsService.findAll();
  }

  /**
   * Get global settings
   * GET /settings/global
   * Public endpoint - no authentication required
   * This allows unauthenticated users to get the default theme
   */
  @Get('global')
  @Public()
  async findGlobal(): Promise<SettingsResponseDto> {
    return this.settingsService.findGlobal();
  }

  /**
   * Get settings by user ID
   * GET /settings/user/:userId
   * Users can access their own settings, admins can access any user's settings
   */
  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<SettingsResponseDto> {
    // Check if user is accessing their own settings or has admin permission
    const isOwnSettings = currentUser.id === userId;
    const hasAdminPermission =
      currentUser.permissions.includes('settings:admin');

    if (!isOwnSettings && !hasAdminPermission) {
      throw new ForbiddenException('You can only access your own settings');
    }

    return this.settingsService.findByUserId(userId);
  }

  /**
   * Get settings by ID
   * GET /settings/:id
   * Requires: settings:read permission
   */
  @Get(':id')
  @Permissions('settings:read')
  async findOne(@Param('id') id: string): Promise<SettingsResponseDto> {
    return this.settingsService.findOne(id);
  }

  /**
   * Update settings
   * PATCH /settings/:id
   * Users can update their own settings, admins can update any settings
   * Special case: If updating global settings, create user-specific settings instead
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<SettingsResponseDto> {
    // First, get the settings to check ownership
    const settings = await this.settingsService.findOne(id);

    // Check if user is updating their own settings or has admin permission
    const isOwnSettings = settings.userId === currentUser.id;
    const hasAdminPermission =
      currentUser.permissions.includes('settings:admin');

    // Special case: If user is trying to update global settings (userId is null),
    // create user-specific settings instead
    if (settings.userId === null && !hasAdminPermission) {
      // Check if user already has their own settings
      try {
        const userSettings = await this.settingsService.findByUserId(
          currentUser.id,
        );
        // User has their own settings, update those instead
        return this.settingsService.update(userSettings.id, updateSettingsDto);
      } catch {
        // User doesn't have their own settings, create them based on global settings
        const newUserSettings = await this.settingsService.create({
          userId: currentUser.id,
          scope: SettingsScope.USER,
          themeMode: updateSettingsDto.themeMode ?? settings.themeMode,
          activeTheme: updateSettingsDto.activeTheme ?? settings.activeTheme,
          lightPalette: updateSettingsDto.lightPalette ?? settings.lightPalette,
          darkPalette: updateSettingsDto.darkPalette ?? settings.darkPalette,
          typography: updateSettingsDto.typography ?? settings.typography,
        } as CreateSettingsDto);
        return newUserSettings;
      }
    }

    if (!isOwnSettings && !hasAdminPermission) {
      throw new ForbiddenException('You can only update your own settings');
    }

    return this.settingsService.update(id, updateSettingsDto);
  }

  /**
   * Delete settings
   * DELETE /settings/:id
   * Requires: settings:admin permission (only admins can delete settings)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('settings:admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.settingsService.remove(id);
  }
}
