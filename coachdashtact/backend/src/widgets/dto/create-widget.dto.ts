import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsArray,
  IsObject,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWidgetDto {
  @ApiProperty({
    description: 'Unique key identifier for the widget',
    example: 'revenue-chart',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @ApiProperty({
    description: 'Display name of the widget',
    example: 'Revenue Chart',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Description of what the widget does',
    example: 'Displays revenue trends over time',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Component file name',
    example: 'ChartWidget',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  component: string;

  @ApiProperty({
    description: 'Widget category',
    example: 'analytics',
    enum: ['analytics', 'ecommerce', 'users', 'content', 'system', 'core', 'data-display', 'layout'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiProperty({
    description: 'Lucide icon name',
    example: 'LineChart',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;

  @ApiPropertyOptional({
    description: 'Default grid span (1-12)',
    example: 6,
    default: 6,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  defaultGridSpan?: number;

  @ApiPropertyOptional({
    description: 'Minimum grid span (1-12)',
    example: 3,
    default: 3,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  minGridSpan?: number;

  @ApiPropertyOptional({
    description: 'Maximum grid span (1-12)',
    example: 12,
    default: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  maxGridSpan?: number;

  @ApiProperty({
    description: 'JSON Schema for widget configuration',
    example: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        chartType: { type: 'string', enum: ['line', 'bar', 'area'] },
      },
    },
  })
  @IsObject()
  configSchema: Record<string, any>;

  @ApiProperty({
    description: 'Data requirements including endpoints and permissions',
    example: {
      endpoint: '/api/analytics/revenue',
      permissions: ['analytics:read'],
      refreshInterval: 300000,
    },
  })
  @IsObject()
  dataRequirements: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Use cases for the widget',
    example: ['Show revenue trends', 'Track sales performance'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  useCases?: string[];

  @ApiPropertyOptional({
    description: 'Example configurations',
    example: [
      {
        name: 'Monthly Revenue',
        config: { title: 'Monthly Revenue', chartType: 'line' },
      },
    ],
  })
  @IsArray()
  @IsOptional()
  examples?: Record<string, any>[];

  @ApiPropertyOptional({
    description: 'Searchable tags',
    example: ['chart', 'revenue', 'analytics'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the widget is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a system widget',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystemWidget?: boolean;
}
