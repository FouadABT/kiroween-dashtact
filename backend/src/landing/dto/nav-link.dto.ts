import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class NavLinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(['url', 'page'])
  @IsOptional()
  @Transform(({ value }) => value || 'url')
  linkType?: 'url' | 'page';

  @IsNumber()
  @IsOptional()
  order?: number;
}
