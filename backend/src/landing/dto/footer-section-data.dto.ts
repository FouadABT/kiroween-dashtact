import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NavLinkDto } from './nav-link.dto';
import { SocialLinkDto } from './social-link.dto';

export class FooterSectionDataDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavLinkDto)
  navLinks: NavLinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks: SocialLinkDto[];

  @IsString()
  @IsNotEmpty()
  copyright: string;

  @IsBoolean()
  showNewsletter: boolean;

  @IsString()
  @IsOptional()
  newsletterTitle?: string;

  @IsString()
  @IsOptional()
  newsletterDescription?: string;
}
