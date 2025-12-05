import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
  AddOrderNoteDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderItemResponseDto,
  OrderStatusHistoryDto,
} from './dto';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Generate a unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(2).toString('hex').toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Ensure uniqueness
    const existing = await this.prisma.order.findUnique({
      where: { orderNumber },
    });

    if (existing) {
      // Recursively try again if collision (very unlikely)
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  /**
   * Calculate order totals
   */
  calculateTotals(
    items: Array<{ unitPrice: number; quantity: number }>,
    tax: number = 0,
    shipping: number = 0,
    discount: number = 0,
  ): { subtotal: number; total: number } {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const total = subtotal + tax + shipping - discount;

    return {
      subtotal: Math.max(0, subtotal),
      total: Math.max(0, total),
    };
  }

  /**
   * Find all orders with filtering and pagination
   */
  async findAll(query: OrderQueryDto): Promise<OrderListResponseDto> {
    const {
      status,
      customerId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await this.prisma.order.count({ where });

    // Get orders
    const orders = await this.prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                featuredImage: true,
              },
            },
          },
        },
      },
    });

    return {
      orders: orders.map(this.mapToResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one order by ID with items and history
   */
  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                featuredImage: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                featuredImage: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with number ${orderNumber} not found`,
      );
    }

    return this.mapToResponseDto(order);
  }

  /**
   * Create a new order with inventory reservation and total calculation
   */
  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Verify customer exists
    await this.customersService.findOne(dto.customerId);

    // Validate and prepare order items
    const orderItems = await Promise.all(
      dto.items.map(async (item) => {
        // Get product
        const product = await this.productsService.findOne(item.productId);

        // Determine price and variant info
        let unitPrice: number;
        let variantName: string | undefined;
        let sku: string | undefined;
        let variantId = item.productVariantId;

        if (item.productVariantId) {
          // Find variant
          const variant = product.variants?.find(
            (v) => v.id === item.productVariantId,
          );

          if (!variant) {
            throw new NotFoundException(
              `Variant ${item.productVariantId} not found for product ${product.name}`,
            );
          }

          unitPrice = variant.price || product.basePrice;
          variantName = variant.name;
          sku = variant.sku;

          // Check inventory availability
          const availability = await this.inventoryService.checkAvailability(
            item.productVariantId,
            item.quantity,
          );

          if (!availability.available) {
            throw new ConflictException(
              `Insufficient inventory for ${product.name} - ${variant.name}. Available: ${availability.currentStock}, Requested: ${item.quantity}`,
            );
          }
        } else {
          unitPrice = product.basePrice;
          sku = product.sku;
        }

        return {
          productId: item.productId,
          productVariantId: variantId,
          productName: product.name,
          variantName,
          sku,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        };
      }),
    );

    // Calculate totals
    const { subtotal, total } = this.calculateTotals(
      orderItems,
      dto.tax || 0,
      dto.shipping || 0,
      dto.discount || 0,
    );

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order and reserve inventory in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          subtotal,
          tax: dto.tax || 0,
          shipping: dto.shipping || 0,
          discount: dto.discount || 0,
          total,
          shippingAddress: dto.shippingAddress as any,
          billingAddress: dto.billingAddress as any,
          shippingMethodId: dto.shippingMethodId,
          customerEmail: dto.customerEmail,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerNotes: dto.customerNotes,
          internalNotes: dto.internalNotes,
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.id,
          ...item,
        })),
      });

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          toStatus: OrderStatus.PENDING,
          notes: 'Order created',
        },
      });

      // Reserve inventory for variants
      for (const item of orderItems) {
        if (item.productVariantId) {
          await this.inventoryService.reserveStock({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          });
        }
      }

      return newOrder;
    });

    // Update customer's lastOrderAt
    await this.prisma.customer.update({
      where: { id: dto.customerId },
      data: { lastOrderAt: new Date() },
    });

    // Fetch complete order with items
    const completeOrder = await this.findOne(order.id);

    // Send "New Order" notification to admins with orders:read permission
    await this.sendNewOrderNotification(completeOrder);

    return completeOrder;
  }

  /**
   * Send "New Order" notification to admins with orders:read permission
   */
  private async sendNewOrderNotification(
    order: OrderResponseDto,
  ): Promise<void> {
    try {
      // Get all users with orders:read permission
      const usersWithPermission = await this.getUsersWithPermission(
        'orders:read',
      );

      // Send notification to each user
      for (const user of usersWithPermission) {
        await this.notificationsService.create({
          userId: user.id,
          title: 'New Order Received',
          message: `Order #${order.orderNumber} from ${order.customerName} has been placed. Total: $${order.total.toFixed(2)}`,
          category: 'WORKFLOW',
          priority: 'HIGH',
          actionUrl: `/dashboard/ecommerce/orders/${order.id}`,
          actionLabel: 'View Order',
          requiredPermission: 'orders:read',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
          },
        });
      }
    } catch (error) {
      // Log error but don't fail the order creation
      console.error('Failed to send new order notification:', error);
    }
  }

  /**
   * Get all users with a specific permission
   */
  private async getUsersWithPermission(
    permissionName: string,
  ): Promise<Array<{ id: string; email: string }>> {
    // Get all active users with their roles and permissions
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Filter users who have the required permission
    const usersWithPermission = users.filter((user) => {
      const permissions = user.role.rolePermissions.map(
        (rp) => rp.permission.name,
      );

      // Check for super admin permission (*:*)
      if (permissions.includes('*:*')) {
        return true;
      }

      // Check for exact permission match
      if (permissions.includes(permissionName)) {
        return true;
      }

      // Check for wildcard resource permission (e.g., orders:* matches orders:read)
      const [resource, action] = permissionName.split(':');
      const wildcardResourcePermission = `${resource}:*`;
      if (permissions.includes(wildcardResourcePermission)) {
        return true;
      }

      // Check for wildcard action permission (e.g., *:read matches orders:read)
      const wildcardActionPermission = `*:${action}`;
      if (permissions.includes(wildcardActionPermission)) {
        return true;
      }

      return false;
    });

    return usersWithPermission.map((user) => ({
      id: user.id,
      email: user.email,
    }));
  }

  /**
   * Map Prisma order to response DTO
   */
  private mapToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingMethodId: order.shippingMethodId || undefined,
      trackingNumber: order.trackingNumber || undefined,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone || undefined,
      customerNotes: order.customerNotes || undefined,
      internalNotes: order.internalNotes || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt || undefined,
      shippedAt: order.shippedAt || undefined,
      deliveredAt: order.deliveredAt || undefined,
      cancelledAt: order.cancelledAt || undefined,
      items: order.items?.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productVariantId: item.productVariantId || undefined,
        productName: item.productName,
        variantName: item.variantName || undefined,
        sku: item.sku || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        createdAt: item.createdAt,
      })),
      statusHistory: order.statusHistory?.map((history: any) => ({
        id: history.id,
        orderId: history.orderId,
        fromStatus: history.fromStatus || undefined,
        toStatus: history.toStatus,
        userId: history.userId || undefined,
        notes: history.notes || undefined,
        createdAt: history.createdAt,
      })),
    };
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    // Define valid transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PROCESSING]: [
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.SHIPPED]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [
        OrderStatus.REFUNDED,
      ],
      [OrderStatus.CANCELLED]: [], // Cannot transition from cancelled
      [OrderStatus.REFUNDED]: [], // Cannot transition from refunded
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Update order status with validation and history tracking
   */
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    userId?: string,
  ): Promise<OrderResponseDto> {
    // Get current order
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, dto.status);

    // Prepare update data
    const updateData: any = {
      status: dto.status,
    };

    // Set timestamps based on new status
    if (dto.status === OrderStatus.SHIPPED && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (dto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    if (dto.status === OrderStatus.CANCELLED && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    // Update order and create history in a transaction
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.order.update({
        where: { id },
        data: updateData,
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.status,
          userId,
          notes: dto.notes,
        },
      });

      // Release inventory if cancelled
      if (dto.status === OrderStatus.CANCELLED) {
        const items = await tx.orderItem.findMany({
          where: { orderId: id },
        });

        for (const item of items) {
          if (item.productVariantId) {
            await this.inventoryService.releaseStock({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
            });
          }
        }
      }

      return updated;
    });

    // Fetch complete order with items and history
    const updatedOrderData = await this.findOne(id);

    // Send order status change notification
    await this.sendOrderStatusChangeNotification(
      updatedOrderData,
      order.status,
      dto.status,
    );

    return updatedOrderData;
  }

  /**
   * Send notification when order status changes
   */
  private async sendOrderStatusChangeNotification(
    order: OrderResponseDto,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
  ): Promise<void> {
    try {
      // Get all users with orders:read permission
      const usersWithPermission = await this.getUsersWithPermission(
        'orders:read',
      );

      // Send notification to each user
      for (const user of usersWithPermission) {
        await this.notificationsService.create({
          userId: user.id,
          title: 'Order Status Updated',
          message: `Order #${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`,
          category: 'WORKFLOW',
          priority: 'NORMAL',
          actionUrl: `/dashboard/ecommerce/orders/${order.id}`,
          actionLabel: 'View Order',
          requiredPermission: 'orders:read',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            oldStatus,
            newStatus,
            customerName: order.customerName,
          },
        });
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send order status change notification:', error);
    }
  }

  /**
   * Cancel an order with inventory release
   */
  async cancel(
    id: string,
    reason: string,
    userId?: string,
  ): Promise<OrderResponseDto> {
    return this.updateStatus(
      id,
      {
        status: OrderStatus.CANCELLED,
        notes: reason,
      },
      userId,
    );
  }

  /**
   * Add a note to an order
   */
  async addNote(
    id: string,
    dto: AddOrderNoteDto,
    userId?: string,
  ): Promise<OrderResponseDto> {
    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Append note to internal notes
    const currentNotes = order.internalNotes || '';
    const timestamp = new Date().toISOString();
    const userInfo = userId ? `User ${userId}` : 'System';
    const newNote = `[${timestamp}] ${userInfo}: ${dto.note}`;
    const updatedNotes = currentNotes
      ? `${currentNotes}\n${newNote}`
      : newNote;

    await this.prisma.order.update({
      where: { id },
      data: {
        internalNotes: updatedNotes,
      },
    });

    return this.findOne(id);
  }

  /**
   * Get status history for an order
   */
  async getStatusHistory(id: string): Promise<OrderStatusHistoryDto[]> {
    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const history = await this.prisma.orderStatusHistory.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
    });

    return history.map((h) => ({
      id: h.id,
      orderId: h.orderId,
      fromStatus: h.fromStatus || undefined,
      toStatus: h.toStatus,
      userId: h.userId || undefined,
      notes: h.notes || undefined,
      createdAt: h.createdAt,
    }));
  }
}
