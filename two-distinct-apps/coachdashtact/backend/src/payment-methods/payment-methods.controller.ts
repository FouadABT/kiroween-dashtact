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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  /**
   * Get all active payment methods (public)
   * No authentication required - for checkout page
   */
  @Public()
  @Get('active')
  async getActiveMethods() {
    return this.paymentMethodsService.getActivePaymentMethods();
  }

  /**
   * Get all payment methods (public for dashboard display)
   * No authentication required - for dashboard display
   */
  @Public()
  @Get()
  async findAll() {
    return this.paymentMethodsService.findAll();
  }

  /**
   * Get a single payment method
   * Requires: payments:read permission
   */
  @Get(':id')
  @Permissions('payments:read')
  async findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  /**
   * Create a new payment method
   * Requires: payments:write permission
   */
  @Post()
  @Permissions('payments:write')
  async create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(dto);
  }

  /**
   * Update a payment method
   * Requires: payments:write permission
   */
  @Patch(':id')
  @Permissions('payments:write')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.update(id, dto);
  }

  /**
   * Delete a payment method
   * Requires: payments:delete permission
   */
  @Delete(':id')
  @Permissions('payments:delete')
  async delete(@Param('id') id: string) {
    await this.paymentMethodsService.delete(id);
    return { message: 'Payment method deleted successfully' };
  }
}
