import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  isActive: boolean;
}
