import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new settings
   */
  async create(createSettingsDto: CreateSettingsDto): Promise<SettingsResponseDto> {
    // Check if settings already exist for this scope/user combination
    if (createSettingsDto.userId) {
      const existing = await this.prisma.settings.findUnique({
        where: { userId: createSettingsDto.userId },
      });
      if (existing) {
        throw new ConflictException('Settings already exist for this user');
      }
    }

    const settings = await this.prisma.settings.create({
      data: {
        userId: createSettingsDto.userId,
        scope: createSettingsDto.scope,
        themeMode: createSettingsDto.themeMode,
        activeTheme: createSettingsDto.activeTheme,
        lightPalette: createSettingsDto.lightPalette as any,
        darkPalette: createSettingsDto.darkPalette as any,
        typography: createSettingsDto.typography as any,
      },
    });

    return this.mapToResponseDto(settings);
  }

  /**
   * Get all settings
   */
  async findAll(): Promise<SettingsResponseDto[]> {
    const settings = await this.prisma.settings.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return settings.map(s => this.mapToResponseDto(s));
  }

  /**
   * Get settings by ID
   */
  async findOne(id: string): Promise<SettingsResponseDto> {
    const settings = await this.prisma.settings.findUnique({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Get settings by user ID
   */
  async findByUserId(userId: string): Promise<SettingsResponseDto> {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException(`Settings for user ${userId} not found`);
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Get global settings
   */
  async findGlobal(): Promise<SettingsResponseDto> {
    const settings = await this.prisma.settings.findFirst({
      where: { scope: 'global', userId: null },
    });

    if (!settings) {
      throw new NotFoundException('Global settings not found');
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Update settings
   */
  async update(id: string, updateSettingsDto: UpdateSettingsDto): Promise<SettingsResponseDto> {
    // Check if settings exist
    const existing = await this.prisma.settings.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    // Merge partial updates with existing data
    const updateData: any = {};

    if (updateSettingsDto.themeMode !== undefined) {
      updateData.themeMode = updateSettingsDto.themeMode;
    }

    if (updateSettingsDto.activeTheme !== undefined) {
      updateData.activeTheme = updateSettingsDto.activeTheme;
    }

    if (updateSettingsDto.lightPalette !== undefined) {
      updateData.lightPalette = {
        ...(existing.lightPalette as any),
        ...updateSettingsDto.lightPalette,
      };
    }

    if (updateSettingsDto.darkPalette !== undefined) {
      updateData.darkPalette = {
        ...(existing.darkPalette as any),
        ...updateSettingsDto.darkPalette,
      };
    }

    if (updateSettingsDto.typography !== undefined) {
      updateData.typography = {
        ...(existing.typography as any),
        ...updateSettingsDto.typography,
      };
    }

    const settings = await this.prisma.settings.update({
      where: { id },
      data: updateData,
    });

    return this.mapToResponseDto(settings);
  }

  /**
   * Delete settings
   */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.settings.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    await this.prisma.settings.delete({
      where: { id },
    });
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToResponseDto(settings: any): SettingsResponseDto {
    return {
      id: settings.id,
      userId: settings.userId,
      scope: settings.scope,
      themeMode: settings.themeMode,
      activeTheme: settings.activeTheme,
      lightPalette: settings.lightPalette,
      darkPalette: settings.darkPalette,
      typography: settings.typography,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
