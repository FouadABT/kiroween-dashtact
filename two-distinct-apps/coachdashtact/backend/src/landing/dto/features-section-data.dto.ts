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
import { Type, Transform } from 'class-transformer';
import { FeatureCardDto } from './feature-card.dto';

export class FeaturesSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsOptional()
  @IsEnum(['grid', 'list', 'carousel'])
  @Transform(({ value }) => value || 'grid')
  layout?: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(4)
  @Transform(({ value }) => value || 3)
  columns?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureCardDto)
  @Transform(({ value }) => value || [])
  features?: FeatureCardDto[];

  // Optional extended fields
  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  subheading?: string;

  @IsString()
  @IsOptional()
  backgroundType?: string;
}
