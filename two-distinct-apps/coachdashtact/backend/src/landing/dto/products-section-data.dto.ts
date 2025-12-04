import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductsSectionDataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsIn(['grid', 'carousel', 'featured'])
  @Transform(({ value }) => value || 'grid')
  layout?: 'grid' | 'carousel' | 'featured';

  @IsOptional()
  @IsNumber()
  @IsIn([2, 3, 4])
  @Transform(({ value }) => value || 3)
  columns?: 2 | 3 | 4;

  @IsOptional()
  @IsNumber()
  @IsIn([3, 6, 9, 12])
  @Transform(({ value }) => value || 6)
  productCount?: 3 | 6 | 9 | 12;

  @IsOptional()
  @IsString()
  filterByCategory?: string;

  @IsOptional()
  @IsString()
  filterByTag?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== false)
  showPrice?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== false)
  showRating?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== false)
  showStock?: boolean;

  @IsOptional()
  @IsString()
  ctaText?: string;
}
