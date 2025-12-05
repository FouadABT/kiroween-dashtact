import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class CustomerOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Get all orders for a customer
   */
  async getCustomerOrders(customerId: string): Promise<any[]> {
    // Get customer account
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: customerId },
      include: { customer: true },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    // Get orders for this customer
    const orders = await this.prisma.order.findMany({
      where: {
        customerId: account.customerId,
      },
      orderBy: {
        createdAt: 'desc',
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
              },
            },
          },
        },
        shippingMethod: true,
      },
    });

    return orders.map((order) => ({
      ...order,
      subtotal: order.subtotal.toString(),
      tax: order.tax.toString(),
      shipping: order.shipping.toString(),
      discount: order.discount.toString(),
      total: order.total.toString(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
      })),
    }));
  }

  /**
   * Get order details for a customer
   */
  async getOrderDetails(customerId: string, orderId: string): Promise<any> {
    // Get customer account
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: customerId },
      include: { customer: true },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                featuredImage: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                attributes: true,
              },
            },
          },
        },
        shippingMethod: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify customer owns this order
    if (order.customerId !== account.customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return {
      ...order,
      subtotal: order.subtotal.toString(),
      tax: order.tax.toString(),
      shipping: order.shipping.toString(),
      discount: order.discount.toString(),
      total: order.total.toString(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
      })),
    };
  }

  /**
   * Cancel an order (only if status is PENDING)
   */
  async cancelOrder(customerId: string, orderId: string): Promise<any> {
    // Get customer account
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: customerId },
      include: { customer: true },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify customer owns this order
    if (order.customerId !== account.customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Check if order can be cancelled
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.CANCELLED,
        notes: 'Cancelled by customer',
      },
    });

    return {
      ...updatedOrder,
      subtotal: updatedOrder.subtotal.toString(),
      tax: updatedOrder.tax.toString(),
      shipping: updatedOrder.shipping.toString(),
      discount: updatedOrder.discount.toString(),
      total: updatedOrder.total.toString(),
    };
  }

  /**
   * Reorder items from a previous order
   */
  async reorderItems(customerId: string, orderId: string): Promise<any> {
    // Get customer account
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: customerId },
      include: { customer: true },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    // Get order with items
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify customer owns this order
    if (order.customerId !== account.customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Get or create cart for customer
    const cart = await this.cartService.getOrCreateCart(undefined, customerId);

    // Add all order items to cart
    for (const item of order.items) {
      await this.cartService.addToCart({
        userId: customerId,
        productId: item.productId,
        productVariantId: item.productVariantId ?? undefined,
        quantity: item.quantity,
      });
    }

    return cart;
  }
}
