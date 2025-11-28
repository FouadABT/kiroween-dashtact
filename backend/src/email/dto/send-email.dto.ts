import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { each: true })
  recipient: string | string[];

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsOptional()
  textBody?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  templateData?: Record<string, any>;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
