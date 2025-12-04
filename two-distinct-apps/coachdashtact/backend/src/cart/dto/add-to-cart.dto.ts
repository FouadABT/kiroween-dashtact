import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  productVariantId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
