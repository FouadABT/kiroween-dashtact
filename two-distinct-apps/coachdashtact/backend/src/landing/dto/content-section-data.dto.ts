import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ContentSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || '<p>Add your content here...</p>')
  content?: string;

  @IsOptional()
  @IsEnum(['single', 'two-column'])
  @Transform(({ value }) => value || 'single')
  layout?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(['left', 'right', 'top', 'bottom'])
  @IsOptional()
  @Transform(({ value }) => value || 'right')
  imagePosition?: string;

  @IsEnum(['full', 'wide', 'standard', 'narrow'])
  @IsOptional()
  @Transform(({ value }) => value || 'standard')
  contentWidth?: string;

  // Optional extended fields
  @IsString()
  @IsOptional()
  heading?: string;

  @IsEnum(['solid', 'gradient', 'image'])
  @IsOptional()
  backgroundType?: string;

  // Custom CSS and HTML mode
  @IsString()
  @IsOptional()
  customCSS?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true)
  htmlMode?: boolean;
}
