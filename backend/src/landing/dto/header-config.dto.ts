import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';

export class NavigationItemDto {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsIn(['internal', 'external', 'dropdown', 'mega-menu'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  @IsOptional()
  children?: NavigationItemDto[];
}

export class CTAButtonDto {
  @IsString()
  text: string;

  @IsString()
  link: string;

  @IsString()
  @IsIn(['primary', 'secondary', 'outline'])
  style: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class HeaderStyleDto {
  @IsString()
  @IsOptional()
  background?: string;

  @IsBoolean()
  sticky: boolean;

  @IsString()
  @IsIn(['always', 'hide-on-scroll', 'show-on-scroll-up'])
  stickyBehavior: string;

  @IsBoolean()
  transparent: boolean;

  @IsBoolean()
  shadow: boolean;
}

export class MobileMenuConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsIn(['hamburger', 'dots', 'menu'])
  iconStyle: string;

  @IsString()
  @IsIn(['slide', 'fade', 'scale'])
  animation: string;
}

export class HeaderConfigDto {
  @IsString()
  @IsOptional()
  logoLight?: string;

  @IsString()
  @IsOptional()
  logoDark?: string;

  @IsString()
  @IsIn(['sm', 'md', 'lg'])
  logoSize: string;

  @IsString()
  logoLink: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  navigation: NavigationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CTAButtonDto)
  ctas: CTAButtonDto[];

  @ValidateNested()
  @Type(() => HeaderStyleDto)
  style: HeaderStyleDto;

  @ValidateNested()
  @Type(() => MobileMenuConfigDto)
  mobileMenu: MobileMenuConfigDto;
}

export class UpdateHeaderConfigDto {
  @IsString()
  @IsOptional()
  logoLight?: string;

  @IsString()
  @IsOptional()
  logoDark?: string;

  @IsString()
  @IsIn(['sm', 'md', 'lg'])
  @IsOptional()
  logoSize?: string;

  @IsString()
  @IsOptional()
  logoLink?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  @IsOptional()
  navigation?: NavigationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CTAButtonDto)
  @IsOptional()
  ctas?: CTAButtonDto[];

  @ValidateNested()
  @Type(() => HeaderStyleDto)
  @IsOptional()
  style?: HeaderStyleDto;

  @ValidateNested()
  @Type(() => MobileMenuConfigDto)
  @IsOptional()
  mobileMenu?: MobileMenuConfigDto;
}
