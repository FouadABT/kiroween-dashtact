import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageStatus, PageVisibility } from './create-custom-page.dto';

export class CustomPageQueryDto {
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
  @IsBoolean()
  @Type(() => Boolean)
  showInNavigation?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder' | 'title';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
