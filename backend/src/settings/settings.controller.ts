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
  Query,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Create new settings
   * POST /settings
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSettingsDto: CreateSettingsDto): Promise<SettingsResponseDto> {
    return this.settingsService.create(createSettingsDto);
  }

  /**
   * Get all settings
   * GET /settings
   */
  @Get()
  async findAll(): Promise<SettingsResponseDto[]> {
    return this.settingsService.findAll();
  }

  /**
   * Get global settings
   * GET /settings/global
   */
  @Get('global')
  async findGlobal(): Promise<SettingsResponseDto> {
    return this.settingsService.findGlobal();
  }

  /**
   * Get settings by user ID
   * GET /settings/user/:userId
   */
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<SettingsResponseDto> {
    return this.settingsService.findByUserId(userId);
  }

  /**
   * Get settings by ID
   * GET /settings/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SettingsResponseDto> {
    return this.settingsService.findOne(id);
  }

  /**
   * Update settings
   * PATCH /settings/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.update(id, updateSettingsDto);
  }

  /**
   * Delete settings
   * DELETE /settings/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.settingsService.remove(id);
  }
}
