import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageStatus, PageVisibility } from '@prisma/client';

export class PageQueryDto {
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsEnum(PageVisibility)
  visibility?: PageVisibility;

  @IsOptional()
  @IsString()
  parentPageId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showInNavigation?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['title', 'createdAt', 'updatedAt', 'displayOrder'])
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Cursor-based pagination for large datasets
  @IsOptional()
  @IsString()
  cursor?: string;
}
