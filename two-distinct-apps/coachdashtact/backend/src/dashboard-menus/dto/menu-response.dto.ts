import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageType } from './create-menu.dto';

export class MenuResponseDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Unique key for the menu item',
    example: 'main-dashboard',
  })
  key: string;

  @ApiProperty({
    description: 'Display label for the menu item',
    example: 'Dashboard',
  })
  label: string;

  @ApiProperty({
    description: 'Lucide icon name',
    example: 'LayoutDashboard',
  })
  icon: string;

  @ApiProperty({
    description: 'Route path for the menu item',
    example: '/dashboard',
  })
  route: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  order: number;

  @ApiPropertyOptional({
    description: 'Parent menu ID',
    example: 'clx0987654321',
  })
  parentId?: string;

  @ApiProperty({
    description: 'Page rendering type',
    enum: PageType,
    example: PageType.WIDGET_BASED,
  })
  pageType: PageType;

  @ApiPropertyOptional({
    description: 'Page identifier for WIDGET_BASED pages',
    example: 'main-dashboard',
  })
  pageIdentifier?: string;

  @ApiPropertyOptional({
    description: 'Component path for HARDCODED pages',
    example: '/dashboard/ecommerce/products',
  })
  componentPath?: string;

  @ApiProperty({
    description: 'Whether the menu item is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Required permissions to view this menu',
    example: ['products:read'],
    type: [String],
  })
  requiredPermissions: string[];

  @ApiProperty({
    description: 'Required roles to view this menu',
    example: ['Admin'],
    type: [String],
  })
  requiredRoles: string[];

  @ApiPropertyOptional({
    description: 'Feature flag key',
    example: 'ecommerce_enabled',
  })
  featureFlag?: string;

  @ApiPropertyOptional({
    description: 'Description or tooltip text',
    example: 'Manage your products',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Badge text or count',
    example: 'New',
  })
  badge?: string;

  @ApiPropertyOptional({
    description: 'Available widget keys for WIDGET_BASED pages',
    example: ['stats-card', 'activity-feed'],
    type: [String],
  })
  availableWidgets?: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-11-16T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-16T12:00:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Child menu items',
    type: [MenuResponseDto],
  })
  children?: MenuResponseDto[];
}
