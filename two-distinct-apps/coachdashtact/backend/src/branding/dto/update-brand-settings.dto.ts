import {
  IsString,
  IsOptional,
  Length,
  MaxLength,
  IsEmail,
  IsUrl,
  IsObject,
} from 'class-validator';

export class UpdateBrandSettingsDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Brand name must be between 1 and 100 characters' })
  brandName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tagline must not exceed 200 characters' })
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  websiteUrl?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Support email must be a valid email address' })
  supportEmail?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}
