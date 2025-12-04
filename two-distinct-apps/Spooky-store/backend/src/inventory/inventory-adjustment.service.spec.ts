import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AdjustInventoryDto } from './dto';

describe('InventoryService - Adjustment Operations', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inventory: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    inventoryAdjustment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockInventory = {
    id: 'inv-1',
    productVariantId: 'variant-1',
    quantity: 100,
    reserved: 20,
    available: 80,
    lowStockThreshold: 10,
    trackInventory: true,
    allowBackorder: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastRestockedAt: null,
  };

  const mockProductVariant = {
    id: 'variant-1',
    name: 'Test Variant',
    sku: 'TEST-SKU',
    product: {
      id: 'product-1',
      name: 'Test Product',
      slug: 'test-product',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('adjustQuantity', () => {
    it('should successfully adjust inventory quantity upward', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 50,
        reason: 'Restock',
        notes: 'New shipment arrived',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 150,
        available: 130,
        lastRestockedAt: new Date(),
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-1' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result.quantity).toBe(150);
      expect(result.available).toBe(130);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should successfully adjust inventory quantity downward', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: -30,
        reason: 'Damaged goods',
        notes: 'Items damaged during storage',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 70,
        available: 50,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-2' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result.quantity).toBe(70);
      expect(result.available).toBe(50);
    });

    it('should create inventory record if it does not exist', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-2',
        quantityChange: 100,
        reason: 'Initial stock',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(null);

      const newInventory = {
        id: 'inv-2',
        productVariantId: 'variant-2',
        quantity: 0,
        reserved: 0,
        available: 0,
      };

      mockPrismaService.inventory.create.mockResolvedValue(newInventory);

      const updatedInventory = {
        ...newInventory,
        quantity: 100,
        available: 100,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-3' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(mockPrismaService.inventory.create).toHaveBeenCalled();
      expect(result.quantity).toBe(100);
    });

    it('should throw BadRequestException if adjustment results in negative inventory', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: -150,
        reason: 'Test',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      await expect(service.adjustQuantity(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.adjustQuantity(dto)).rejects.toThrow(
        'Adjustment would result in negative inventory',
      );
    });

    it('should throw BadRequestException if adjustment results in negative available inventory', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: -90,
        reason: 'Test',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      await expect(service.adjustQuantity(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.adjustQuantity(dto)).rejects.toThrow(
        'negative available inventory',
      );
    });

    it('should update lastRestockedAt only when quantity increases', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 50,
        reason: 'Restock',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 150,
        available: 130,
        lastRestockedAt: new Date(),
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-4' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result.lastRestockedAt).toBeDefined();
    });

    it('should not update lastRestockedAt when quantity decreases', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: -10,
        reason: 'Shrinkage',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 90,
        available: 70,
        lastRestockedAt: null,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-5' },
      ]);

      await service.adjustQuantity(dto);

      const transactionCall = mockPrismaService.$transaction.mock.calls[0][0];
      const updateCall = transactionCall[0];
      
      expect(updateCall.data.lastRestockedAt).toBeUndefined();
    });

    it('should create adjustment record with all details', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 25,
        reason: 'Return from customer',
        notes: 'Item returned in good condition',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 125,
        available: 105,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-6' },
      ]);

      await service.adjustQuantity(dto);

      const transactionCall = mockPrismaService.$transaction.mock.calls[0][0];
      const adjustmentCall = transactionCall[1];

      expect(adjustmentCall.data).toMatchObject({
        inventoryId: mockInventory.id,
        quantityChange: 25,
        reason: 'Return from customer',
        notes: 'Item returned in good condition',
        userId: 'user-1',
      });
    });

    it('should handle adjustment without notes', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 10,
        reason: 'Recount',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 110,
        available: 90,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-7' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result).toBeDefined();
      expect(result.quantity).toBe(110);
    });

    it('should handle adjustment without userId', async () => {
      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 5,
        reason: 'System adjustment',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const updatedInventory = {
        ...mockInventory,
        quantity: 105,
        available: 85,
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-8' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result).toBeDefined();
    });

    it('should correctly calculate available quantity with reserved stock', async () => {
      const inventoryWithReserved = {
        ...mockInventory,
        quantity: 100,
        reserved: 30,
        available: 70,
      };

      const dto: AdjustInventoryDto = {
        productVariantId: 'variant-1',
        quantityChange: 20,
        reason: 'Restock',
        userId: 'user-1',
      };

      mockPrismaService.inventory.findUnique.mockResolvedValue(
        inventoryWithReserved,
      );

      const updatedInventory = {
        ...inventoryWithReserved,
        quantity: 120,
        available: 90, // 120 - 30 reserved
        productVariant: mockProductVariant,
      };

      mockPrismaService.$transaction.mockResolvedValue([
        updatedInventory,
        { id: 'adj-9' },
      ]);

      const result = await service.adjustQuantity(dto);

      expect(result.quantity).toBe(120);
      expect(result.available).toBe(90);
      expect(result.reserved).toBe(30);
    });
  });

  describe('getAdjustmentHistory', () => {
    it('should return adjustment history for an inventory record', async () => {
      const mockAdjustments = [
        {
          id: 'adj-1',
          inventoryId: 'inv-1',
          quantityChange: 50,
          reason: 'Restock',
          notes: 'New shipment',
          userId: 'user-1',
          createdAt: new Date(),
        },
        {
          id: 'adj-2',
          inventoryId: 'inv-1',
          quantityChange: -10,
          reason: 'Damaged',
          notes: null,
          userId: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue(
        mockAdjustments,
      );

      const result = await service.getAdjustmentHistory('inv-1');

      expect(result).toHaveLength(2);
      expect(result[0].quantityChange).toBe(50);
      expect(result[1].quantityChange).toBe(-10);
      expect(mockPrismaService.inventoryAdjustment.findMany).toHaveBeenCalledWith(
        {
          where: { inventoryId: 'inv-1' },
          orderBy: { createdAt: 'desc' },
        },
      );
    });

    it('should return empty array if no adjustments exist', async () => {
      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue([]);

      const result = await service.getAdjustmentHistory('inv-1');

      expect(result).toEqual([]);
    });

    it('should handle adjustments without notes', async () => {
      const mockAdjustments = [
        {
          id: 'adj-1',
          inventoryId: 'inv-1',
          quantityChange: 25,
          reason: 'Recount',
          notes: null,
          userId: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue(
        mockAdjustments,
      );

      const result = await service.getAdjustmentHistory('inv-1');

      expect(result[0].notes).toBeUndefined();
    });

    it('should handle adjustments without userId', async () => {
      const mockAdjustments = [
        {
          id: 'adj-1',
          inventoryId: 'inv-1',
          quantityChange: 10,
          reason: 'System adjustment',
          notes: null,
          userId: null,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.inventoryAdjustment.findMany.mockResolvedValue(
        mockAdjustments,
      );

      const result = await service.getAdjustmentHistory('inv-1');

      expect(result[0].userId).toBeUndefined();
    });
  });
});
