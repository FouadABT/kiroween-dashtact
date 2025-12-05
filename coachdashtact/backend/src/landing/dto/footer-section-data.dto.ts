import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NavLinkDto } from './nav-link.dto';
import { SocialLinkDto } from './social-link.dto';

export class FooterSectionDataDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Dashboard Application')
  companyName?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || 'Professional dashboard application')
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  @Transform(({ value }) => value || [])
  navLinks?: NavLinkDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  @Transform(({ value }) => value || [])
  socialLinks?: SocialLinkDto[];

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || `© ${new Date().getFullYear()} Dashboard Application. All rights reserved.`)
  copyright?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value || false)
  showNewsletter?: boolean;

  @IsString()
  @IsOptional()
  newsletterTitle?: string;

  @IsString()
  @IsOptional()
  newsletterDescription?: string;
}
