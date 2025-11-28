import { IsObject, IsOptional, ValidateNested, IsString, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class ColorPairDto {
  @IsOptional()
  @IsString()
  light?: string;

  @IsOptional()
  @IsString()
  dark?: string;
}

class ThemeColorsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorPairDto)
  primary?: ColorPairDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorPairDto)
  secondary?: ColorPairDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorPairDto)
  accent?: ColorPairDto;
}

class ThemeSettingsDto {
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsEnum(['light', 'dark', 'auto', 'toggle'])
  mode?: 'light' | 'dark' | 'auto' | 'toggle';

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;
}

class LayoutSettingsDto {
  @IsOptional()
  @IsEnum(['full', 'container', 'narrow'])
  maxWidth?: 'full' | 'container' | 'narrow';

  @IsOptional()
  @IsEnum(['compact', 'normal', 'relaxed'])
  spacing?: 'compact' | 'normal' | 'relaxed';

  @IsOptional()
  @IsEnum(['full', 'wide', 'standard', 'narrow'])
  containerWidth?: 'full' | 'wide' | 'standard' | 'narrow';

  @IsOptional()
  @IsEnum(['compact', 'normal', 'relaxed'])
  sectionSpacing?: 'compact' | 'normal' | 'relaxed';

  @IsOptional()
  @IsEnum(['left', 'center', 'right'])
  contentAlignment?: 'left' | 'center' | 'right';
}

class SeoSettingsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(k => k.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsEnum(['summary', 'summary_large_image'])
  twitterCard?: 'summary' | 'summary_large_image';

  @IsOptional()
  @IsBoolean()
  structuredData?: boolean;
}

class GeneralSettingsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

class PerformanceSettingsDto {
  @IsOptional()
  @IsBoolean()
  imageOptimization?: boolean;

  @IsOptional()
  @IsBoolean()
  lazyLoading?: boolean;

  @IsOptional()
  @IsEnum(['aggressive', 'normal', 'minimal'])
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
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
  @IsArray()
  @IsString({ each: true })
  thirdPartyScripts?: string[];
}

export class GlobalSettingsDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme?: ThemeSettingsDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutSettingsDto)
  layout?: LayoutSettingsDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoSettingsDto)
  seo?: SeoSettingsDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performance?: PerformanceSettingsDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedSettingsDto)
  advanced?: AdvancedSettingsDto;
}
