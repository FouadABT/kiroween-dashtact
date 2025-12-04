import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class LayoutFiltersDto {
  @IsString()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(['global', 'user'])
  @IsOptional()
  scope?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isDefault?: boolean;
}
