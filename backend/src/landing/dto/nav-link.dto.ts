import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class NavLinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(['url', 'page'])
  linkType: 'url' | 'page';

  @IsNumber()
  order: number;
}
