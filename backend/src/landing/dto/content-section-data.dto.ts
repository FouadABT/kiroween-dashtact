import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class ContentSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['single', 'two-column'])
  layout: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(['left', 'right', 'top', 'bottom'])
  @IsOptional()
  imagePosition?: string;
}
