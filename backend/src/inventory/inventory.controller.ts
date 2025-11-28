import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  AdjustInventoryDto,
  InventoryQueryDto,
  ReserveStockDto,
  ReleaseStockDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard, FeatureGuard)
@FeatureEnabled('ecommerce')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Get all inventory records with filtering and pagination
   * Requires: inventory:read permission
   */
  @Get()
  @Permissions('inventory:read')
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  /**
   * Get inventory for a specific product variant
   * Requires: inventory:read permission
   */
  @Get('variant/:id')
  @Permissions('inventory:read')
  async findByVariant(@Param('id') variantId: string) {
    return this.inventoryService.findByVariant(variantId);
  }

  /**
   * Get items with low stock
   * Requires: inventory:read permission
   */
  @Get('low-stock')
  @Permissions('inventory:read')
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  /**
   * Get adjustment history for an inventory record
   * Requires: inventory:read permission
   */
  @Get(':id/history')
  @Permissions('inventory:read')
  async getAdjustmentHistory(@Param('id') inventoryId: string) {
    return this.inventoryService.getAdjustmentHistory(inventoryId);
  }

  /**
   * Adjust inventory quantity
   * Requires: inventory:write permission
   */
  @Post('adjust')
  @Permissions('inventory:write')
  async adjustQuantity(
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() user: any,
  ) {
    // Add user ID to the DTO
    dto.userId = user.id;
    return this.inventoryService.adjustQuantity(dto);
  }

  /**
   * Reserve stock for an order
   * Requires: inventory:write permission
   */
  @Post('reserve')
  @Permissions('inventory:write')
  async reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  /**
   * Release reserved stock (e.g., order cancellation)
   * Requires: inventory:write permission
   */
  @Post('release')
  @Permissions('inventory:write')
  async releaseStock(@Body() dto: ReleaseStockDto) {
    return this.inventoryService.releaseStock(dto);
  }

  /**
   * Check stock availability for a variant
   * Requires: inventory:read permission
   */
  @Get('check/:variantId/:quantity')
  @Permissions('inventory:read')
  async checkAvailability(
    @Param('variantId') variantId: string,
    @Param('quantity') quantity: string,
  ) {
    return this.inventoryService.checkAvailability(
      variantId,
      parseInt(quantity, 10),
    );
  }
}
