import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { NotificationCategory } from '@prisma/client';
import { Transform } from 'class-transformer';

export class TemplateFiltersDto {
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
