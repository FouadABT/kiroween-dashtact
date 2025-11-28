import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('shipping-methods')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * Get all active shipping methods (public)
   * No authentication required - for checkout page
   */
  @Public()
  @Get('active')
  async getActiveMethods() {
    return this.shippingService.getActiveShippingMethods();
  }

  /**
   * Get all shipping methods (public for dashboard display)
   * No authentication required - for dashboard display
   */
  @Public()
  @Get()
  async findAll() {
    return this.shippingService.findAll();
  }

  /**
   * Get a single shipping method
   * Requires: shipping:read permission
   */
  @Get(':id')
  @Permissions('shipping:read')
  async findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  /**
   * Create a new shipping method
   * Requires: shipping:write permission
   */
  @Post()
  @Permissions('shipping:write')
  async create(@Body() dto: CreateShippingMethodDto) {
    return this.shippingService.create(dto);
  }

  /**
   * Update a shipping method
   * Requires: shipping:write permission
   */
  @Patch(':id')
  @Permissions('shipping:write')
  async update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.shippingService.update(id, dto);
  }

  /**
   * Delete a shipping method
   * Requires: shipping:delete permission
   */
  @Delete(':id')
  @Permissions('shipping:delete')
  async delete(@Param('id') id: string) {
    await this.shippingService.delete(id);
    return { message: 'Shipping method deleted successfully' };
  }
}
