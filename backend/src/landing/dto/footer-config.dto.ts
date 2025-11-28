import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FooterLinkDto {
  @IsString()
  label: string;

  @IsString()
  link: string;
}

export class FooterColumnDto {
  @IsString()
  heading: string;

  @IsString()
  @IsIn(['links', 'text', 'social', 'newsletter', 'contact'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  @IsOptional()
  links?: FooterLinkDto[];

  @IsString()
  @IsOptional()
  text?: string;
}

export class SocialLinkDto {
  @IsString()
  platform: string;

  @IsString()
  url: string;

  @IsString()
  icon: string;
}

export class NewsletterConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  title: string;

  @IsString()
  placeholder: string;

  @IsString()
  buttonText: string;
}

export class LegalLinkDto {
  @IsString()
  label: string;

  @IsString()
  link: string;
}

export class FooterStyleDto {
  @IsString()
  @IsOptional()
  background?: string;

  @IsString()
  @IsOptional()
  textColor?: string;

  @IsBoolean()
  borderTop: boolean;
}

export class FooterConfigDto {
  @IsString()
  @IsIn(['single', 'multi-column', 'centered', 'split'])
  layout: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  columns: FooterColumnDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  social: SocialLinkDto[];

  @ValidateNested()
  @Type(() => NewsletterConfigDto)
  newsletter: NewsletterConfigDto;

  @IsString()
  copyright: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegalLinkDto)
  legalLinks: LegalLinkDto[];

  @ValidateNested()
  @Type(() => FooterStyleDto)
  style: FooterStyleDto;
}

export class UpdateFooterConfigDto {
  @IsString()
  @IsIn(['single', 'multi-column', 'centered', 'split'])
  @IsOptional()
  layout?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  @IsOptional()
  columns?: FooterColumnDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  @IsOptional()
  social?: SocialLinkDto[];

  @ValidateNested()
  @Type(() => NewsletterConfigDto)
  @IsOptional()
  newsletter?: NewsletterConfigDto;

  @IsString()
  @IsOptional()
  copyright?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegalLinkDto)
  @IsOptional()
  legalLinks?: LegalLinkDto[];

  @ValidateNested()
  @Type(() => FooterStyleDto)
  @IsOptional()
  style?: FooterStyleDto;
}
