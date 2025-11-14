import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AdjustInventoryDto,
  InventoryQueryDto,
  ReserveStockDto,
  ReleaseStockDto,
  InventoryResponseDto,
  InventoryAdjustmentResponseDto,
  PaginatedInventoryResponseDto,
} from './dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Find all inventory records with filtering and pagination
   */
  async findAll(
    query: InventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    const {
      search,
      lowStockOnly,
      outOfStockOnly,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.productVariant = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          {
            product: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      };
    }

    // Note: lowStockOnly filtering is done post-query since we need to compare
    // available with lowStockThreshold which are both columns

    if (outOfStockOnly) {
      where.available = { lte: 0 };
    }

    // Get paginated data
    let inventory = await this.prisma.inventory.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Apply low stock filtering post-query
    if (lowStockOnly) {
      inventory = inventory.filter(
        (inv) => inv.available > 0 && inv.available <= inv.lowStockThreshold,
      );
    }

    // Get total after filtering
    const total = inventory.length;

    // Apply pagination after filtering
    const paginatedInventory = inventory.slice(skip, skip + limit);

    return {
      data: paginatedInventory.map(this.mapToResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find inventory by product variant ID
   */
  async findByVariant(variantId: string): Promise<InventoryResponseDto> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productVariantId: variantId },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found for variant ${variantId}`,
      );
    }

    return this.mapToResponseDto(inventory);
  }

  /**
   * Adjust inventory quantity with reason tracking
   */
  async adjustQuantity(dto: AdjustInventoryDto): Promise<InventoryResponseDto> {
    const { productVariantId, quantityChange, reason, notes, userId } = dto;

    // Find or create inventory record
    let inventory = await this.prisma.inventory.findUnique({
      where: { productVariantId },
    });

    if (!inventory) {
      // Create inventory record if it doesn't exist
      inventory = await this.prisma.inventory.create({
        data: {
          productVariantId,
          quantity: 0,
          reserved: 0,
          available: 0,
        },
      });
    }

    // Calculate new quantities
    const newQuantity = inventory.quantity + quantityChange;
    const newAvailable = newQuantity - inventory.reserved;

    if (newQuantity < 0) {
      throw new BadRequestException(
        'Adjustment would result in negative inventory',
      );
    }

    if (newAvailable < 0) {
      throw new BadRequestException(
        'Adjustment would result in negative available inventory (reserved stock exceeds total)',
      );
    }

    // Update inventory and create adjustment record in a transaction
    const [updatedInventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQuantity,
          available: newAvailable,
          lastRestockedAt: quantityChange > 0 ? new Date() : undefined,
        },
        include: {
          productVariant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          quantityChange,
          reason,
          notes,
          userId,
        },
      }),
    ]);

    // Check if inventory is now below low stock threshold and send notification
    await this.checkAndSendLowStockAlert(updatedInventory);

    return this.mapToResponseDto(updatedInventory);
  }

  /**
   * Reserve stock for order placement
   */
  async reserveStock(dto: ReserveStockDto): Promise<InventoryResponseDto> {
    const { productVariantId, quantity } = dto;

    const inventory = await this.prisma.inventory.findUnique({
      where: { productVariantId },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found for variant ${productVariantId}`,
      );
    }

    if (!inventory.trackInventory) {
      // If not tracking inventory, just return current state
      return this.mapToResponseDto(inventory);
    }

    const newAvailable = inventory.available - quantity;

    if (newAvailable < 0 && !inventory.allowBackorder) {
      throw new ConflictException(
        `Insufficient inventory. Available: ${inventory.available}, Requested: ${quantity}`,
      );
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: inventory.reserved + quantity,
        available: newAvailable,
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Check if inventory is now below low stock threshold and send notification
    await this.checkAndSendLowStockAlert(updatedInventory);

    return this.mapToResponseDto(updatedInventory);
  }

  /**
   * Release reserved stock (e.g., order cancellation)
   */
  async releaseStock(dto: ReleaseStockDto): Promise<InventoryResponseDto> {
    const { productVariantId, quantity } = dto;

    const inventory = await this.prisma.inventory.findUnique({
      where: { productVariantId },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found for variant ${productVariantId}`,
      );
    }

    if (inventory.reserved < quantity) {
      throw new BadRequestException(
        `Cannot release ${quantity} units. Only ${inventory.reserved} units are reserved.`,
      );
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: inventory.reserved - quantity,
        available: inventory.available + quantity,
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(updatedInventory);
  }

  /**
   * Check if stock is available for a variant
   */
  async checkAvailability(
    variantId: string,
    quantity: number,
  ): Promise<{ available: boolean; currentStock: number }> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productVariantId: variantId },
    });

    if (!inventory) {
      return { available: false, currentStock: 0 };
    }

    if (!inventory.trackInventory) {
      return { available: true, currentStock: inventory.quantity };
    }

    const available =
      inventory.available >= quantity || inventory.allowBackorder;

    return {
      available,
      currentStock: inventory.available,
    };
  }

  /**
   * Get items with low stock
   */
  async getLowStockItems(): Promise<InventoryResponseDto[]> {
    const inventory = await this.prisma.inventory.findMany({
      where: {
        trackInventory: true,
        available: {
          gt: 0,
        },
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        available: 'asc',
      },
    });

    // Filter items where available <= lowStockThreshold
    const lowStockItems = inventory.filter(
      (inv) => inv.available <= inv.lowStockThreshold,
    );

    return lowStockItems.map(this.mapToResponseDto);
  }

  /**
   * Get adjustment history for an inventory record
   */
  async getAdjustmentHistory(
    inventoryId: string,
  ): Promise<InventoryAdjustmentResponseDto[]> {
    const adjustments = await this.prisma.inventoryAdjustment.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
    });

    return adjustments.map((adj) => ({
      id: adj.id,
      inventoryId: adj.inventoryId,
      quantityChange: adj.quantityChange,
      reason: adj.reason,
      notes: adj.notes || undefined,
      userId: adj.userId || undefined,
      createdAt: adj.createdAt,
    }));
  }

  /**
   * Check if inventory is low and send notification to admins
   */
  private async checkAndSendLowStockAlert(inventory: any): Promise<void> {
    // Only send alert if tracking inventory and stock is low (but not out of stock)
    if (
      !inventory.trackInventory ||
      inventory.available <= 0 ||
      inventory.available > inventory.lowStockThreshold
    ) {
      return;
    }

    // Get all users with inventory:read permission
    const usersWithPermission = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          rolePermissions: {
            some: {
              permission: {
                name: 'inventory:read',
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Send notification to each user with permission
    const productName = inventory.productVariant?.product?.name || 'Unknown';
    const variantName = inventory.productVariant?.name || '';
    const fullProductName = variantName
      ? `${productName} - ${variantName}`
      : productName;

    for (const user of usersWithPermission) {
      try {
        await this.notificationsService.create({
          userId: user.id,
          title: 'Low Stock Alert',
          message: `${fullProductName} is running low. Only ${inventory.available} units available.`,
          category: 'WORKFLOW',
          priority: 'NORMAL',
          actionUrl: '/dashboard/ecommerce/inventory',
          actionLabel: 'View Inventory',
          requiredPermission: 'inventory:read',
        });
      } catch (error) {
        // Log error but don't fail the inventory adjustment
        console.error(
          `Failed to send low stock notification to user ${user.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Map Prisma inventory to response DTO
   */
  private mapToResponseDto(inventory: any): InventoryResponseDto {
    return {
      id: inventory.id,
      productVariantId: inventory.productVariantId,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      available: inventory.available,
      lowStockThreshold: inventory.lowStockThreshold,
      trackInventory: inventory.trackInventory,
      allowBackorder: inventory.allowBackorder,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      lastRestockedAt: inventory.lastRestockedAt || undefined,
      productVariant: inventory.productVariant
        ? {
            id: inventory.productVariant.id,
            name: inventory.productVariant.name,
            sku: inventory.productVariant.sku || undefined,
            product: {
              id: inventory.productVariant.product.id,
              name: inventory.productVariant.product.name,
              slug: inventory.productVariant.product.slug,
            },
          }
        : undefined,
    };
  }
}
