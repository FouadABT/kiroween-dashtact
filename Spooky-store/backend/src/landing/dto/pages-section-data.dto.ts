import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PagesSectionDataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsIn(['grid', 'cards', 'list'])
  @IsOptional()
  @Transform(({ value }) => value || 'grid')
  layout?: 'grid' | 'cards' | 'list';

  @IsNumber()
  @IsIn([2, 3, 4])
  @IsOptional()
  @Transform(({ value }) => value || 3)
  columns?: 2 | 3 | 4;

  @IsNumber()
  @IsIn([3, 6, 9, 12])
  @IsOptional()
  @Transform(({ value }) => value || 6)
  pageCount?: 3 | 6 | 9 | 12;

  @IsOptional()
  @IsString()
  filterByParent?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showExcerpt?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showImage?: boolean;

  @IsString()
  @IsOptional()
  ctaText?: string;
}
