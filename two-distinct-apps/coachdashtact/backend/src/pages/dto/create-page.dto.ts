import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { PageStatus, PageVisibility } from '@prisma/client';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @IsEnum(PageVisibility)
  @IsOptional()
  visibility?: PageVisibility;

  @IsString()
  @IsOptional()
  parentPageId?: string;

  @IsBoolean()
  @IsOptional()
  showInNavigation?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'Custom CSS class must contain only letters, numbers, hyphens, and underscores',
  })
  customCssClass?: string;

  @IsString()
  @IsOptional()
  templateKey?: string;
}
