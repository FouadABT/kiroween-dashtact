import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsInt,
  IsObject,
  Matches,
} from 'class-validator';
import { EventVisibility } from '@prisma/client';

export class RecurrenceRuleDto {
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @IsInt()
  @IsOptional()
  interval?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  byDay?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  byMonthDay?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  byMonth?: number[];

  @IsInt()
  @IsOptional()
  count?: number;

  @IsDateString()
  @IsOptional()
  until?: string;

  @IsArray()
  @IsOptional()
  exceptions?: string[];
}

export class EventEntityLinkDto {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  color?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendeeIds?: string[];

  @IsObject()
  @IsOptional()
  recurrenceRule?: RecurrenceRuleDto;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  reminders?: number[]; // Minutes before

  @IsArray()
  @IsOptional()
  linkedEntities?: EventEntityLinkDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
