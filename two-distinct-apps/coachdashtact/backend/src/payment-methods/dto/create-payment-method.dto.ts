import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
