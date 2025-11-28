import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CtaButtonDto } from './cta-button.dto';

export class CtaSectionDataDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Ready to Get Started?')
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Join thousands of users already using our platform')
  description?: string;

  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'oklch(0.5 0.2 250)')
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'oklch(1 0 0)')
  textColor?: string;

  @IsEnum(['left', 'center', 'right'])
  @IsOptional()
  @Transform(({ value }) => value || 'center')
  alignment?: string;

  // Optional extended fields
  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  subheading?: string;

  @IsEnum(['solid', 'gradient', 'image'])
  @IsOptional()
  backgroundType?: string;
}
