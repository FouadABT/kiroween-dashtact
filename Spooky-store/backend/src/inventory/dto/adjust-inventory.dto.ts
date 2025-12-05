import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustInventoryDto {
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantityChange: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
