import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class UpdateCalendarSettingsDto {
  @IsEnum(['month', 'week', 'day', 'agenda'])
  @IsOptional()
  defaultView?: 'month' | 'week' | 'day' | 'agenda';

  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  weekStartsOn?: number;

  @IsString()
  @IsOptional()
  workingHoursStart?: string;

  @IsString()
  @IsOptional()
  workingHoursEnd?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  workingDays?: number[];

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  defaultReminders?: number[];

  @IsBoolean()
  @IsOptional()
  showWeekNumbers?: boolean;
}
