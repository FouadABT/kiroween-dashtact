import { IsOptional, IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWidgetDto {
  @ApiPropertyOptional({
    description: 'Widget position in the layout',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    description: 'Number of grid columns the widget spans (1-12)',
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  gridSpan?: number;

  @ApiPropertyOptional({
    description: 'Grid row number for explicit row placement',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gridRow?: number;

  @ApiPropertyOptional({
    description: 'Widget-specific configuration object',
    example: { refreshInterval: 30000 },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the widget is visible',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
