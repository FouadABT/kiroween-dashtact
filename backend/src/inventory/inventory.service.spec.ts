import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockPrismaService = {
    inventory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    inventoryAdjustment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockInventory = {
    id: 'inv-1',
    productVariantId: 'variant-1',
    quantity: 100,
    reserved: 10,
    available: 90,
    lowStockThreshold: 20,
    trackInventory: true,
    allowBackorder: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastRestockedAt: null,
    productVariant: {
      id: 'variant-1',
      name: 'Large',
      sku: 'TEST-LG',
      product: {
        id: 'product-1',
        name: 'Test Product',
        slug: 'test-product',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated inventory', async () => {
      mockPrismaService.inventory.findMany.mockResolvedValue([mockInventory]);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter low stock items', async () => {
      const lowStockItem = { ...mockInventory, available: 15 };
      mockPrismaService.inventory.findMany.mockResolvedValue([lowStockItem]);
      const result = await service.findAll({ lowStockOnly: true });
      expect(result.data).toHaveLength(1);
    });

    it('should filter out of stock items', async () => {
      mockPrismaService.inventory.findMany.mockResolvedValue([]);
      await service.findAll({ outOfStockOnly: true });
      expect(mockPrismaService.inventory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            available: { lte: 0 },
          }),
        }),
      );
    });
  });

  describe('findByVariant', () => {
    it('should return inventory by variant id', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      const result = await service.findByVariant('variant-1');
      expect(result.productVariantId).toBe('variant-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);
      await expect(service.findByVariant('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adjustQuantity', () => {
    it('should adjust inventory quantity', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockInventory, quantity: 110, available: 100 },
        {},
      ]);
      const result = await service.adjustQuantity({
        productVariantId: 'variant-1',
        quantityChange: 10,
        reason: 'Restock',
      });
      expect(result.quantity).toBe(110);
    });

    it('should create inventory if not exists', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);
      mockPrismaService.inventory.create.mockResolvedValue({
        ...mockInventory,
        quantity: 0,
        reserved: 0,
        available: 0,
      });
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockInventory, quantity: 10, available: 10 },
        {},
      ]);
      await service.adjustQuantity({
        productVariantId: 'variant-1',
        quantityChange: 10,
        reason: 'Initial stock',
      });
      expect(mockPrismaService.inventory.create).toHaveBeenCalled();
    });

    it('should throw error for negative inventory', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      await expect(
        service.adjustQuantity({
          productVariantId: 'variant-1',
          quantityChange: -200,
          reason: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock successfully', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventory.update.mockResolvedValue({
        ...mockInventory,
        reserved: 15,
        available: 85,
      });
      mockPrismaService.user.findMany.mockResolvedValue([]);
      const result = await service.reserveStock({
        productVariantId: 'variant-1',
        quantity: 5,
      });
      expect(result.reserved).toBe(15);
      expect(result.available).toBe(85);
    });

    it('should throw error if insufficient stock', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      await expect(
        service.reserveStock({
          productVariantId: 'variant-1',
          quantity: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow backorder if enabled', async () => {
      const backorderInventory = { ...mockInventory, allowBackorder: true };
      mockPrismaService.inventory.findUnique.mockResolvedValue(
        backorderInventory,
      );
      mockPrismaService.inventory.update.mockResolvedValue({
        ...backorderInventory,
        reserved: 110,
        available: -10,
      });
      mockPrismaService.user.findMany.mockResolvedValue([]);
      const result = await service.reserveStock({
        productVariantId: 'variant-1',
        quantity: 100,
      });
      expect(result.available).toBe(-10);
    });
  });

  describe('releaseStock', () => {
    it('should release reserved stock', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventory.update.mockResolvedValue({
        ...mockInventory,
        reserved: 5,
        available: 95,
      });
      const result = await service.releaseStock({
        productVariantId: 'variant-1',
        quantity: 5,
      });
      expect(result.reserved).toBe(5);
      expect(result.available).toBe(95);
    });

    it('should throw error if releasing more than reserved', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      await expect(
        service.releaseStock({
          productVariantId: 'variant-1',
          quantity: 20,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability status', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      const result = await service.checkAvailability('variant-1', 50);
      expect(result.available).toBe(true);
      expect(result.currentStock).toBe(90);
    });

    it('should return false if insufficient stock', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);
      const result = await service.checkAvailability('variant-1', 100);
      expect(result.available).toBe(false);
    });

    it('should return false if inventory not found', async () => {
      mockPrismaService.inventory.findUnique.mockResolvedValue(null);
      const result = await service.checkAvailability('nonexistent', 10);
      expect(result.available).toBe(false);
      expect(result.currentStock).toBe(0);
    });
  });

  describe('getLowStockItems', () => {
    it('should return items with low stock', async () => {
      const lowStockItem = { ...mockInventory, available: 15 };
      mockPrismaService.inventory.findMany.mockResolvedValue([lowStockItem]);
      const result = await service.getLowStockItems();
      expect(result).toHaveLength(1);
      expect(result[0].available).toBe(15);
    });

    it('should not return items above threshold', async () => {
      const highStockItem = { ...mockInventory, available: 50 };
      mockPrismaService.inventory.findMany.mockResolvedValue([highStockItem]);
      const result = await service.getLowStockItems();
      expect(result).toHaveLength(0);
    });
  });

  describe('getAdjustmentHistory', () => {
    it('should return adjustment history', async () => {
      const adjustments = [
        {
          id: 'adj-1',
          inventoryId: 'inv-1',
          quantityChange: 10,
          reason: 'Restock',
          notes: 'Monthly restock',
          userId: 'user-1',
          createdAt: new Date(),
        },
      ];
      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue(
        adjustments,
      );
      const result = await service.getAdjustmentHistory('inv-1');
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('Restock');
    });
  });
});
