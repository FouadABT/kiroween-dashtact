import {
  IsArray,
  IsString,
  ArrayMinSize,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class BulkVisibilityUpdateDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  ids: string[];

  @IsEnum(Visibility)
  visibility: Visibility;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedRoles?: string[];
}
