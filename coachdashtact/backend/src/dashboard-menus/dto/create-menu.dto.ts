import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PageType {
  WIDGET_BASED = 'WIDGET_BASED',
  HARDCODED = 'HARDCODED',
  CUSTOM = 'CUSTOM',
  EXTERNAL = 'EXTERNAL',
}

export class CreateMenuDto {
  @ApiProperty({
    description: 'Unique key for the menu item',
    example: 'main-dashboard',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @ApiProperty({
    description: 'Display label for the menu item',
    example: 'Dashboard',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label: string;

  @ApiProperty({
    description: 'Lucide icon name',
    example: 'LayoutDashboard',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  icon: string;

  @ApiProperty({
    description: 'Route path for the menu item',
    example: '/dashboard',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  route: string;

  @ApiProperty({
    description: 'Display order (lower numbers appear first)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    description: 'Parent menu ID for nested items',
    example: 'clx1234567890',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Page rendering type',
    enum: PageType,
    example: PageType.WIDGET_BASED,
  })
  @IsEnum(PageType)
  pageType: PageType;

  @ApiPropertyOptional({
    description: 'Page identifier for WIDGET_BASED pages',
    example: 'main-dashboard',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pageIdentifier?: string;

  @ApiPropertyOptional({
    description: 'Component path for HARDCODED pages',
    example: '/dashboard/ecommerce/products',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  componentPath?: string;

  @ApiPropertyOptional({
    description: 'Whether the menu item is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Required permissions to view this menu',
    example: ['products:read', 'products:write'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredPermissions?: string[];

  @ApiPropertyOptional({
    description: 'Required roles to view this menu',
    example: ['Super Admin', 'Admin'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredRoles?: string[];

  @ApiPropertyOptional({
    description: 'Feature flag key to check',
    example: 'ecommerce_enabled',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  featureFlag?: string;

  @ApiPropertyOptional({
    description: 'Description or tooltip text',
    example: 'Manage your products and inventory',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Badge text or count',
    example: 'New',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  badge?: string;

  @ApiPropertyOptional({
    description: 'Available widget keys for WIDGET_BASED pages (empty array = all widgets)',
    example: ['stats-card', 'activity-feed', 'recent-orders'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableWidgets?: string[];
}
