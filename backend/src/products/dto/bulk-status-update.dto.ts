import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class BulkStatusUpdateDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  productIds: string[];

  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status: ProductStatus;
}
