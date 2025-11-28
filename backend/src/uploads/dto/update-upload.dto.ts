import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateUploadDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedRoles?: string[];
}
