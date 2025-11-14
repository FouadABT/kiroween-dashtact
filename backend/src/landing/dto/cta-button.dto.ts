import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CtaButtonDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsEnum(['url', 'page'])
  linkType: 'url' | 'page';
}
