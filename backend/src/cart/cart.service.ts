import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create cart for session or user
   */
  async getOrCreateCart(
    sessionId?: string,
    userId?: string,
  ): Promise<CartResponseDto> {
    if (!sessionId && !userId) {
      throw new BadRequestException('Either sessionId or userId is required');
    }

    // Try to find existing cart
    let cart = await this.prisma.cart.findFirst({
      where: {
        OR: [
          sessionId ? { sessionId } : {},
          userId ? { userId } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                featuredImage: true,
                basePrice: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Create new cart if not found
    if (!cart) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

      cart = await this.prisma.cart.create({
        data: {
          sessionId,
          userId,
          expiresAt,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  featuredImage: true,
                  basePrice: true,
                },
              },
              productVariant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Add item to cart
   */
  async addToCart(dto: AddToCartDto): Promise<CartResponseDto> {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        variants: dto.productVariantId
          ? { where: { id: dto.productVariantId } }
          : false,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify variant if specified
    if (dto.productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.productVariantId },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(dto.sessionId, dto.userId);

    // Determine price snapshot
    let priceSnapshot: Decimal;
    if (dto.productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.productVariantId },
      });
      priceSnapshot = variant?.price || product.basePrice;
    } else {
      priceSnapshot = product.basePrice;
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        productVariantId: dto.productVariantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
        },
      });
    } else {
      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          productVariantId: dto.productVariantId,
          quantity: dto.quantity,
          priceSnapshot,
        },
      });
    }

    // Return updated cart
    return this.getOrCreateCart(dto.sessionId, dto.userId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    // Return updated cart
    return this.getOrCreateCart(item.cart.sessionId ?? undefined, item.cart.userId ?? undefined);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: string): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Return updated cart
    return this.getOrCreateCart(item.cart.sessionId ?? undefined, item.cart.userId ?? undefined);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });

    return this.getOrCreateCart(cart.sessionId ?? undefined, cart.userId ?? undefined);
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeCart(sessionId: string, userId: string): Promise<CartResponseDto> {
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(undefined, userId);
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(undefined, userId);

    // Merge items
    for (const item of guestCart.items) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
        },
      });

      if (existingItem) {
        // Update quantity
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + item.quantity,
          },
        });
      } else {
        // Create new item in user cart
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
          },
        });
      }
    }

    // Delete guest cart
    await this.prisma.cart.delete({
      where: { id: guestCart.id },
    });

    return this.getOrCreateCart(undefined, userId);
  }

  /**
   * Validate inventory for cart items
   */
  async validateInventory(
    sessionId?: string,
    userId?: string,
  ): Promise<{ valid: boolean; errors: any[] }> {
    const cart = await this.getOrCreateCart(sessionId, userId);
    const errors: any[] = [];

    for (const item of cart.items) {
      // Get inventory for the product variant or product
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          productVariantId: item.productVariantId || undefined,
        },
      });

      if (!inventory) {
        errors.push({
          itemId: item.id,
          productId: item.productId,
          productName: item.product?.name,
          error: 'Inventory not found',
        });
        continue;
      }

      if (inventory.available < item.quantity) {
        errors.push({
          itemId: item.id,
          productId: item.productId,
          productName: item.product?.name,
          requested: item.quantity,
          available: inventory.available,
          error: 'Insufficient inventory',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean up expired carts (should be run as a cron job)
   */
  async cleanupExpiredCarts(): Promise<number> {
    const result = await this.prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Format cart response with calculated totals
   */
  private formatCartResponse(cart: any): CartResponseDto {
    const items: CartItemResponseDto[] = cart.items.map((item: any) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot.toString(),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            featuredImage: item.product.featuredImage,
            basePrice: item.product.basePrice.toString(),
          }
        : undefined,
      productVariant: item.productVariant
        ? {
            id: item.productVariant.id,
            name: item.productVariant.name,
            price: item.productVariant.price?.toString() || null,
            image: item.productVariant.image,
          }
        : null,
    }));

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.priceSnapshot);
      return sum + price * item.quantity;
    }, 0);

    // Calculate total item count
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items,
      subtotal: subtotal.toFixed(2),
      itemCount,
    };
  }
}
