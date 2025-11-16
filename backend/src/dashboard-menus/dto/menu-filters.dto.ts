import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MenuFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by parent ID',
    example: 'clx1234567890',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by page type',
    example: 'WIDGET_BASED',
  })
  @IsString()
  @IsOptional()
  pageType?: string;

  @ApiPropertyOptional({
    description: 'Filter by feature flag',
    example: 'ecommerce_enabled',
  })
  @IsString()
  @IsOptional()
  featureFlag?: string;
}
