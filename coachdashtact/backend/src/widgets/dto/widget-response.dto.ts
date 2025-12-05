import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WidgetResponseDto {
  @ApiProperty({
    description: 'Widget ID',
    example: 'clxyz123',
  })
  id: string;

  @ApiProperty({
    description: 'Unique key identifier',
    example: 'revenue-chart',
  })
  key: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Revenue Chart',
  })
  name: string;

  @ApiProperty({
    description: 'Widget description',
    example: 'Displays revenue trends over time',
  })
  description: string;

  @ApiProperty({
    description: 'Component file name',
    example: 'ChartWidget',
  })
  component: string;

  @ApiProperty({
    description: 'Widget category',
    example: 'analytics',
  })
  category: string;

  @ApiProperty({
    description: 'Icon name',
    example: 'LineChart',
  })
  icon: string;

  @ApiProperty({
    description: 'Default grid span',
    example: 6,
  })
  defaultGridSpan: number;

  @ApiProperty({
    description: 'Minimum grid span',
    example: 3,
  })
  minGridSpan: number;

  @ApiProperty({
    description: 'Maximum grid span',
    example: 12,
  })
  maxGridSpan: number;

  @ApiProperty({
    description: 'Configuration schema',
    example: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
    },
  })
  configSchema: Record<string, any>;

  @ApiProperty({
    description: 'Data requirements',
    example: {
      endpoint: '/api/analytics/revenue',
      permissions: ['analytics:read'],
    },
  })
  dataRequirements: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Use cases',
    example: ['Show revenue trends'],
  })
  useCases?: string[];

  @ApiPropertyOptional({
    description: 'Example configurations',
  })
  examples?: Record<string, any>[];

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['chart', 'analytics'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'System widget flag',
    example: false,
  })
  isSystemWidget: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
