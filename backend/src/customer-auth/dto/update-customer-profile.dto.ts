import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  shippingAddress?: any;

  @IsOptional()
  billingAddress?: any;
}
