import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateSectionTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsObject()
  section: any; // LandingPageSection JSON

  @IsBoolean()
  @IsOptional()
  isCustom?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSectionTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsObject()
  @IsOptional()
  section?: any;

  @IsBoolean()
  @IsOptional()
  isCustom?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
