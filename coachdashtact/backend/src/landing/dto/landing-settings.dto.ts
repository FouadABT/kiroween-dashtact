import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeneralSettingsDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  favicon: string;

  @IsString()
  language: string;
}

class SeoSettingsDto {
  @IsString()
  ogTitle: string;

  @IsString()
  ogDescription: string;

  @IsString()
  ogImage: string;

  @IsEnum(['summary', 'summary_large_image'])
  twitterCard: 'summary' | 'summary_large_image';

  @IsBoolean()
  structuredData: boolean;
}

class ColorPairDto {
  @IsString()
  light: string;

  @IsString()
  dark: string;
}

class ThemeColorsDto {
  @ValidateNested()
  @Type(() => ColorPairDto)
  primary: ColorPairDto;

  @ValidateNested()
  @Type(() => ColorPairDto)
  secondary: ColorPairDto;

  @ValidateNested()
  @Type(() => ColorPairDto)
  accent: ColorPairDto;
}

class ThemeSettingsDto {
  @IsEnum(['light', 'dark', 'auto', 'toggle'])
  mode: 'light' | 'dark' | 'auto' | 'toggle';

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors: ThemeColorsDto;
}

class LayoutSettingsDto {
  @IsEnum(['full', 'wide', 'standard', 'narrow'])
  containerWidth: 'full' | 'wide' | 'standard' | 'narrow';

  @IsEnum(['compact', 'normal', 'relaxed'])
  sectionSpacing: 'compact' | 'normal' | 'relaxed';

  @IsEnum(['left', 'center', 'right'])
  contentAlignment: 'left' | 'center' | 'right';
}

class PerformanceSettingsDto {
  @IsBoolean()
  imageOptimization: boolean;

  @IsBoolean()
  lazyLoading: boolean;

  @IsEnum(['aggressive', 'normal', 'minimal'])
  cacheStrategy: 'aggressive' | 'normal' | 'minimal';
}

class AdvancedSettingsDto {
  @IsOptional()
  @IsString()
  customCSS?: string;

  @IsOptional()
  @IsString()
  customJS?: string;

  @IsOptional()
  @IsString()
  analyticsId?: string;

  @IsOptional()
  @IsString()
  gtmId?: string;

  @IsOptional()
  @IsString({ each: true })
  thirdPartyScripts?: string[];
}

export class LandingSettingsDto {
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general: GeneralSettingsDto;

  @ValidateNested()
  @Type(() => SeoSettingsDto)
  seo: SeoSettingsDto;

  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme: ThemeSettingsDto;

  @ValidateNested()
  @Type(() => LayoutSettingsDto)
  layout: LayoutSettingsDto;

  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performance: PerformanceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedSettingsDto)
  advanced?: AdvancedSettingsDto;
}

export class UpdateLandingSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: Partial<GeneralSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoSettingsDto)
  seo?: Partial<SeoSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme?: Partial<ThemeSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutSettingsDto)
  layout?: Partial<LayoutSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performance?: Partial<PerformanceSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedSettingsDto)
  advanced?: Partial<AdvancedSettingsDto>;
}
