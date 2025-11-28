import {
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
}

export class AccountSettingsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @IsBoolean()
  @IsOptional()
  orderUpdates?: boolean;

  @IsEnum(PrivacyLevel)
  @IsOptional()
  privacyLevel?: PrivacyLevel;
}

export class AccountSettingsResponseDto {
  id: string;
  customerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  twoFactorEnabled: boolean;
  privacyLevel: PrivacyLevel;
  createdAt: Date;
  updatedAt: Date;
}
