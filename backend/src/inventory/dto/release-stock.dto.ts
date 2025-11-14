import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReleaseStockDto {
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
