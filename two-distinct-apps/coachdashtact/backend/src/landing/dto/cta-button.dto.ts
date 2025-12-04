import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CtaButtonDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsEnum(['url', 'page'])
  @IsOptional()
  @Transform(({ value }) => value || 'url')
  linkType?: 'url' | 'page';
}
