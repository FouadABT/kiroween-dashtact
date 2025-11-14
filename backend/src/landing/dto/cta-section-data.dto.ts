import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CtaButtonDto } from './cta-button.dto';

export class CtaSectionDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;

  @IsString()
  backgroundColor: string;

  @IsString()
  textColor: string;

  @IsEnum(['left', 'center', 'right'])
  alignment: string;
}
