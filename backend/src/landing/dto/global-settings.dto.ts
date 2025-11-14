import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ThemeSettingsDto {
  @IsOptional()
  primaryColor?: string;

  @IsOptional()
  secondaryColor?: string;

  @IsOptional()
  fontFamily?: string;
}

class LayoutSettingsDto {
  @IsOptional()
  maxWidth?: 'full' | 'container' | 'narrow';

  @IsOptional()
  spacing?: 'compact' | 'normal' | 'relaxed';
}

class SeoSettingsDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  keywords?: string;

  @IsOptional()
  ogImage?: string;
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
}
