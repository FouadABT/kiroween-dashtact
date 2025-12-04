import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CustomerOrdersService } from './customer-orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customer/orders')
@UseGuards(JwtAuthGuard) // All endpoints require customer authentication
export class CustomerOrdersController {
  constructor(
    private readonly customerOrdersService: CustomerOrdersService,
  ) {}

  /**
   * Get all orders for authenticated customer
   * GET /customer/orders
   */
  @Get()
  async getOrders(@CurrentUser() user: any) {
    return this.customerOrdersService.getCustomerOrders(user.id);
  }

  /**
   * Get order details
   * GET /customer/orders/:id
   */
  @Get(':id')
  async getOrderDetails(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerOrdersService.getOrderDetails(user.id, id);
  }

  /**
   * Cancel order
   * POST /customer/orders/:id/cancel
   */
  @Post(':id/cancel')
  async cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerOrdersService.cancelOrder(user.id, id);
  }

  /**
   * Reorder items from previous order
   * POST /customer/orders/:id/reorder
   */
  @Post(':id/reorder')
  async reorderItems(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerOrdersService.reorderItems(user.id, id);
  }
}
