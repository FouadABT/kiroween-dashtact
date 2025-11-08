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
 * Color palette DTO with OKLCH format validation
 * All colors must be in OKLCH format: oklch(L C H) or oklch(L C H / A)
 */
export class ColorPaletteDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, {
    message: 'Color must be in OKLCH format: oklch(L C H) or oklch(L C H / A)',
  })
  background: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  foreground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  card: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  cardForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  popover: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  popoverForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  primary: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  primaryForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  secondary: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  secondaryForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  muted: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  mutedForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  accent: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  accentForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  destructive: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  destructiveForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  border: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  input: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  ring: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  chart1: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  chart2: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  chart3: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  chart4: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  chart5: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebar: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarPrimary: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarPrimaryForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarAccent: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarAccentForeground: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
  sidebarBorder: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^oklch\([^)]+\)$/, { message: 'Color must be in OKLCH format' })
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
