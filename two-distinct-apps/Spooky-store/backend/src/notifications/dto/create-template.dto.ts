import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-_]+$/, {
    message: 'Key must contain only lowercase letters, numbers, hyphens, and underscores',
  })
  @MaxLength(100)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  defaultChannels?: NotificationChannel[];

  @IsEnum(NotificationPriority)
  @IsOptional()
  defaultPriority?: NotificationPriority;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
