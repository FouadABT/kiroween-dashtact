import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CtaButtonDto } from './cta-button.dto';

export class HeroSectionDataDto {
  @IsString()
  @IsNotEmpty()
  headline: string;

  @IsString()
  @IsNotEmpty()
  subheadline: string;

  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsEnum(['image', 'gradient', 'solid'])
  backgroundType: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsEnum(['left', 'center', 'right'])
  textAlignment: string;

  @IsEnum(['small', 'medium', 'large', 'full'])
  height: string;
}
