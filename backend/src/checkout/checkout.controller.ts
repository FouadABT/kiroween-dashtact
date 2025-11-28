import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto, AddressDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('checkout')
@Public() // All checkout endpoints are public
@UseGuards(FeatureGuard)
@FeatureEnabled('ecommerce')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Validate checkout data
   * POST /checkout/validate
   */
  @Post('validate')
  async validateCheckout(@Body() dto: CheckoutDto) {
    return this.checkoutService.validateCheckout(dto);
  }

  /**
   * Calculate shipping cost
   * POST /checkout/calculate-shipping
   */
  @Post('calculate-shipping')
  async calculateShipping(
    @Body('cartId') cartId: string,
    @Body('shippingMethodId') shippingMethodId: string,
  ) {
    return this.checkoutService.calculateShipping(cartId, shippingMethodId);
  }

  /**
   * Calculate tax
   * POST /checkout/calculate-tax
   */
  @Post('calculate-tax')
  async calculateTax(
    @Body('cartId') cartId: string,
    @Body('shippingAddress') shippingAddress: AddressDto,
  ) {
    return this.checkoutService.calculateTax(cartId, shippingAddress);
  }

  /**
   * Create order from cart
   * POST /checkout/create-order
   */
  @Post('create-order')
  async createOrder(@Body() dto: CheckoutDto) {
    return this.checkoutService.createOrderFromCart(dto);
  }

  /**
   * Get available payment methods
   * GET /checkout/payment-methods
   */
  @Get('payment-methods')
  async getPaymentMethods() {
    return this.checkoutService.getPaymentMethods();
  }

  /**
   * Get available shipping methods
   * GET /checkout/shipping-methods
   */
  @Get('shipping-methods')
  async getShippingMethods() {
    return this.checkoutService.getShippingMethods();
  }
}
