import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEcommerceSettingsDto {
  @ApiProperty({
    description: 'Scope of settings (global or user)',
    enum: ['global', 'user'],
    default: 'global',
  })
  @IsString()
  @IsIn(['global', 'user'])
  scope: string = 'global';

  @ApiPropertyOptional({
    description: 'User ID for user-scoped settings',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Store name',
    default: 'My Store',
  })
  @IsString()
  @MaxLength(200)
  storeName: string = 'My Store';

  @ApiPropertyOptional({
    description: 'Store description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  storeDescription?: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    default: 'USD',
  })
  @IsString()
  @MaxLength(3)
  currency: string = 'USD';

  @ApiProperty({
    description: 'Currency symbol',
    default: '$',
  })
  @IsString()
  @MaxLength(5)
  currencySymbol: string = '$';

  @ApiProperty({
    description: 'Tax rate (percentage)',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number = 0;

  @ApiProperty({
    description: 'Tax label',
    default: 'Tax',
  })
  @IsString()
  @MaxLength(50)
  taxLabel: string = 'Tax';

  @ApiProperty({
    description: 'Enable shipping',
    default: true,
  })
  @IsBoolean()
  shippingEnabled: boolean = true;

  @ApiProperty({
    description: 'Enable customer portal',
    default: true,
  })
  @IsBoolean()
  portalEnabled: boolean = true;

  @ApiProperty({
    description: 'Allow guest checkout',
    default: false,
  })
  @IsBoolean()
  allowGuestCheckout: boolean = false;

  @ApiProperty({
    description: 'Track inventory',
    default: true,
  })
  @IsBoolean()
  trackInventory: boolean = true;

  @ApiProperty({
    description: 'Low stock threshold',
    default: 10,
  })
  @IsNumber()
  @Min(0)
  lowStockThreshold: number = 10;

  @ApiProperty({
    description: 'Auto-generate order numbers',
    default: true,
  })
  @IsBoolean()
  autoGenerateOrderNumbers: boolean = true;

  @ApiProperty({
    description: 'Order number prefix',
    default: 'ORD',
  })
  @IsString()
  @MaxLength(10)
  orderNumberPrefix: string = 'ORD';
}
