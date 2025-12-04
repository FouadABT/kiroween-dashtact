import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLayoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pageId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(['global', 'user'])
  @IsOptional()
  scope?: string = 'global';

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
