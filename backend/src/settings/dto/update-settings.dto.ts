import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSettingsDto, ThemeMode } from './create-settings.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating existing settings
 * All fields are optional to support partial updates
 * Omits userId and scope as they cannot be changed after creation
 */
export class UpdateSettingsDto extends PartialType(
  OmitType(CreateSettingsDto, ['userId', 'scope'] as const),
) {
  @IsOptional()
  @IsEnum(ThemeMode)
  themeMode?: ThemeMode;

  @IsOptional()
  @IsString()
  activeTheme?: string;

  // lightPalette, darkPalette, and typography are inherited as optional
  // from PartialType(CreateSettingsDto)
}
