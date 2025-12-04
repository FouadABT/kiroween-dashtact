import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  subject: string;

  @IsString()
  htmlBody: string;

  @IsString()
  @IsOptional()
  textBody?: string;

  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsOptional()
  textBody?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}
