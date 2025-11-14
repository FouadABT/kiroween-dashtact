import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get cart (public - supports both guest and authenticated users)
   * GET /cart?sessionId=xxx or authenticated
   */
  @Public()
  @Get()
  async getCart(
    @Query('sessionId') sessionId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.cartService.getOrCreateCart(sessionId, user?.id);
  }

  /**
   * Add item to cart (public)
   * POST /cart/items
   */
  @Public()
  @Post('items')
  async addToCart(@Body() dto: AddToCartDto, @CurrentUser() user?: any) {
    // If user is authenticated, use userId instead of sessionId
    if (user) {
      dto.userId = user.id;
      dto.sessionId = undefined;
    }

    return this.cartService.addToCart(dto);
  }

  /**
   * Update cart item quantity (public)
   * PATCH /cart/items/:id
   */
  @Public()
  @Patch('items/:id')
  async updateCartItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(id, dto);
  }

  /**
   * Remove item from cart (public)
   * DELETE /cart/items/:id
   */
  @Public()
  @Delete('items/:id')
  async removeCartItem(@Param('id') id: string) {
    return this.cartService.removeCartItem(id);
  }

  /**
   * Clear cart (public)
   * DELETE /cart/:id
   */
  @Public()
  @Delete(':id')
  async clearCart(@Param('id') id: string) {
    return this.cartService.clearCart(id);
  }

  /**
   * Get cart totals (public)
   * GET /cart/totals?sessionId=xxx or authenticated
   */
  @Public()
  @Get('totals')
  async getCartTotals(
    @Query('sessionId') sessionId?: string,
    @CurrentUser() user?: any,
  ) {
    const cart = await this.cartService.getOrCreateCart(sessionId, user?.id);
    return {
      subtotal: cart.subtotal,
      itemCount: cart.itemCount,
      tax: '0.00', // Will be calculated during checkout
      shipping: '0.00', // Will be calculated during checkout
      total: cart.subtotal,
    };
  }

  /**
   * Validate cart inventory (public)
   * POST /cart/validate
   */
  @Public()
  @Post('validate')
  async validateCart(
    @Body('sessionId') sessionId?: string,
    @Body('userId') userId?: string,
    @CurrentUser() user?: any,
  ) {
    const effectiveUserId = user?.id || userId;
    return this.cartService.validateInventory(sessionId, effectiveUserId);
  }

  /**
   * Merge guest cart with user cart on login (authenticated)
   * POST /cart/merge
   */
  @UseGuards(JwtAuthGuard)
  @Post('merge')
  async mergeCart(
    @Body('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.cartService.mergeCart(sessionId, user.id);
  }
}
