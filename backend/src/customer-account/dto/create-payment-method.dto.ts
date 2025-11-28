import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';

export enum PaymentMethodType {
  CARD = 'card',
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
}

export class CreatePaymentMethodDto {
  @IsEnum(PaymentMethodType)
  @IsNotEmpty()
  type: PaymentMethodType;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  cardLast4?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  cardExpiry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  cardBrand?: string;

  @IsString()
  @IsOptional()
  billingAddressId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  encryptedData?: string;
}
