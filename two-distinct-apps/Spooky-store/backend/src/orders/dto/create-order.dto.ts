import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsString()
  @IsOptional()
  productVariantId?: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Apartment, suite, etc.' })
  @IsString()
  @IsOptional()
  apartment?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Shipping address', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ description: 'Billing address', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ApiPropertyOptional({ description: 'Shipping method ID' })
  @IsString()
  @IsOptional()
  shippingMethodId?: string;

  @ApiPropertyOptional({ description: 'Tax amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Shipping cost', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping?: number;

  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Customer notes' })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;
}
