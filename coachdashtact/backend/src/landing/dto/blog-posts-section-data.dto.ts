import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Blog Posts Section Data DTO
 * Validates blog posts section configuration
 */
export class BlogPostsSectionDataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsIn(['grid', 'list', 'carousel'])
  @IsOptional()
  @Transform(({ value }) => value || 'grid')
  layout?: 'grid' | 'list' | 'carousel';

  @IsIn([2, 3, 4])
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || 3)
  columns?: 2 | 3 | 4;

  @IsIn([3, 6, 9, 12])
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || 6)
  postCount?: 3 | 6 | 9 | 12;

  @IsOptional()
  @IsString()
  filterByCategory?: string;

  @IsOptional()
  @IsString()
  filterByTag?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showAuthor?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showDate?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showCategories?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showExcerpt?: boolean;

  @IsString()
  @IsOptional()
  ctaText?: string;

  @IsString()
  @IsOptional()
  ctaLink?: string;
}
