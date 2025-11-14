import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureCardDto } from './feature-card.dto';

export class FeaturesSectionDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsEnum(['grid', 'list', 'carousel'])
  layout: string;

  @IsNumber()
  @Min(2)
  @Max(4)
  columns: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureCardDto)
  features: FeatureCardDto[];
}
