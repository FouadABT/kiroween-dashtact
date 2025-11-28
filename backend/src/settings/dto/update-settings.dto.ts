import { ThemeMode } from './create-settings.dto';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

/**
 * DTO for updating existing settings
 * All fields are optional to support partial updates
 * Accepts partial color palettes and typography for flexible updates
 */
export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(ThemeMode)
  themeMode?: ThemeMode;

  @IsOptional()
  @IsString()
  activeTheme?: string;

  @IsOptional()
  @IsObject()
  lightPalette?: Record<string, any>;

  @IsOptional()
  @IsObject()
  darkPalette?: Record<string, any>;

  @IsOptional()
  @IsObject()
  typography?: Record<string, any>;
}
