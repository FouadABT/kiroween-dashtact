import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CtaButtonDto } from './cta-button.dto';

export class HeroSectionDataDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Welcome to Our Platform')
  headline?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Build amazing things with our powerful tools')
  subheadline?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CtaButtonDto)
  primaryCta?: CtaButtonDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  backgroundVideo?: string;

  @IsEnum(['image', 'gradient', 'solid', 'video'])
  @IsOptional()
  @Transform(({ value }) => value || 'gradient')
  backgroundType?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  gradientStart?: string;

  @IsString()
  @IsOptional()
  gradientEnd?: string;

  @IsString()
  @IsOptional()
  gradientAngle?: string;

  @IsEnum(['left', 'center', 'right'])
  @IsOptional()
  @Transform(({ value }) => value || 'center')
  textAlignment?: string;

  @IsEnum(['small', 'medium', 'large', 'extra-large', 'full'])
  @IsOptional()
  @Transform(({ value }) => value || 'large')
  height?: string;

  // Optional extended fields for enhanced hero sections
  @IsArray()
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsOptional()
  trustBadges?: string[];

  @IsBoolean()
  @IsOptional()
  showTrustBadges?: boolean;
}
