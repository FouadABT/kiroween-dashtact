import {
  ColorPaletteDto,
  TypographyConfigDto,
  ThemeMode,
  SettingsScope,
} from './create-settings.dto';

/**
 * DTO for settings API responses
 * Includes all fields from the database entity
 */
export class SettingsResponseDto {
  id: string;
  userId?: string | null;
  scope: SettingsScope;
  themeMode: ThemeMode;
  activeTheme: string;
  lightPalette: ColorPaletteDto;
  darkPalette: ColorPaletteDto;
  typography: TypographyConfigDto;
  createdAt: Date;
  updatedAt: Date;
}
