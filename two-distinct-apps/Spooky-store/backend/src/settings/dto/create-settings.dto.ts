import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Theme mode enumeration
 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * Settings scope enumeration
 */
export enum SettingsScope {
  GLOBAL = 'global',
  USER = 'user',
}

/**
 * Color palette DTO with HSL format validation
 * All colors must be in HSL format: "H S% L%" (e.g., "240 5.9% 10%")
 */
export class ColorPaletteDto {
  @IsString()
  @IsNotEmpty()
  background: string;

  @IsString()
  @IsNotEmpty()
  foreground: string;

  @IsString()
  @IsNotEmpty()
  card: string;

  @IsString()
  @IsNotEmpty()
  cardForeground: string;

  @IsString()
  @IsNotEmpty()
  popover: string;

  @IsString()
  @IsNotEmpty()
  popoverForeground: string;

  @IsString()
  @IsNotEmpty()
  primary: string;

  @IsString()
  @IsNotEmpty()
  primaryForeground: string;

  @IsString()
  @IsNotEmpty()
  secondary: string;

  @IsString()
  @IsNotEmpty()
  secondaryForeground: string;

  @IsString()
  @IsNotEmpty()
  muted: string;

  @IsString()
  @IsNotEmpty()
  mutedForeground: string;

  @IsString()
  @IsNotEmpty()
  accent: string;

  @IsString()
  @IsNotEmpty()
  accentForeground: string;

  @IsString()
  @IsNotEmpty()
  destructive: string;

  @IsString()
  @IsNotEmpty()
  destructiveForeground: string;

  @IsString()
  @IsNotEmpty()
  border: string;

  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsNotEmpty()
  ring: string;

  @IsString()
  @IsNotEmpty()
  chart1: string;

  @IsString()
  @IsNotEmpty()
  chart2: string;

  @IsString()
  @IsNotEmpty()
  chart3: string;

  @IsString()
  @IsNotEmpty()
  chart4: string;

  @IsString()
  @IsNotEmpty()
  chart5: string;

  @IsString()
  @IsNotEmpty()
  sidebar: string;

  @IsString()
  @IsNotEmpty()
  sidebarForeground: string;

  @IsString()
  @IsNotEmpty()
  sidebarPrimary: string;

  @IsString()
  @IsNotEmpty()
  sidebarPrimaryForeground: string;

  @IsString()
  @IsNotEmpty()
  sidebarAccent: string;

  @IsString()
  @IsNotEmpty()
  sidebarAccentForeground: string;

  @IsString()
  @IsNotEmpty()
  sidebarBorder: string;

  @IsString()
  @IsNotEmpty()
  sidebarRing: string;

  @IsString()
  @IsNotEmpty()
  radius: string;
}

/**
 * Typography configuration DTO with accessibility validation
 */
export class TypographyConfigDto {
  @IsObject()
  @IsNotEmpty()
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };

  @IsObject()
  @IsNotEmpty()
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };

  @IsObject()
  @IsNotEmpty()
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };

  @IsObject()
  @IsNotEmpty()
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };

  @IsObject()
  @IsNotEmpty()
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

/**
 * DTO for creating new settings
 * Includes comprehensive validation for OKLCH colors and typography
 */
export class CreateSettingsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(SettingsScope)
  @IsNotEmpty()
  scope: SettingsScope;

  @IsEnum(ThemeMode)
  @IsNotEmpty()
  themeMode: ThemeMode;

  @IsString()
  @IsNotEmpty()
  activeTheme: string;

  @ValidateNested()
  @Type(() => ColorPaletteDto)
  @IsNotEmpty()
  lightPalette: ColorPaletteDto;

  @ValidateNested()
  @Type(() => ColorPaletteDto)
  @IsNotEmpty()
  darkPalette: ColorPaletteDto;

  @ValidateNested()
  @Type(() => TypographyConfigDto)
  @IsNotEmpty()
  typography: TypographyConfigDto;
}
