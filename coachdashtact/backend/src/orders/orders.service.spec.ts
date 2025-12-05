import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
    orderStatusHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockCustomersService = {
    findOne: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  const mockInventoryService = {
    checkAvailability: jest.fn(),
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-123456',
    customerId: 'customer-1',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
    subtotal: 99.99,
    tax: 10.0,
    shipping: 5.0,
    discount: 0,
    total: 114.99,
    shippingAddress: {},
    billingAddress: {},
    shippingMethodId: null,
    trackingNumber: null,
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerNotes: null,
    internalNotes: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    paidAt: null,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    items: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTotals', () => {
    it('should calculate subtotal and total correctly', () => {
      const items = [
        { unitPrice: 10.0, quantity: 2 },
        { unitPrice: 15.0, quantity: 3 },
      ];
      const result = service.calculateTotals(items, 5.0, 10.0, 2.0);
      expect(result.subtotal).toBe(65.0);
      expect(result.total).toBe(78.0);
    });

    it('should not return negative totals', () => {
      const items = [{ unitPrice: 10.0, quantity: 1 }];
      const result = service.calculateTotals(items, 0, 0, 20.0);
      expect(result.total).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      mockPrismaService.order.count.mockResolvedValue(1);
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.total).toBe(1);
      expect(result.orders).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.order.count.mockResolvedValue(0);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      await service.findAll({ status: OrderStatus.PROCESSING });
      expect(mockPrismaService.order.count).toHaveBeenCalledWith({
        where: { status: OrderStatus.PROCESSING },
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      const result = await service.findOne('order-1');
      expect(result.id).toBe('order-1');
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      mockPrismaService.order.findUnique
        .mockResolvedValueOnce(mockOrder) // First call for validation
        .mockResolvedValueOnce({
          ...mockOrder,
          status: OrderStatus.PROCESSING,
        }); // Second call for fetching updated order
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: OrderStatus.PROCESSING,
            }),
          },
          orderStatusHistory: { create: jest.fn() },
          orderItem: { findMany: jest.fn().mockResolvedValue([]) },
        });
      });
      const result = await service.updateStatus('order-1', {
        status: OrderStatus.PROCESSING,
      });
      expect(result.status).toBe(OrderStatus.PROCESSING);
    });

    it('should validate status transitions', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });
      await expect(
        service.updateStatus('order-1', { status: OrderStatus.PROCESSING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should release inventory when cancelled', async () => {
      mockPrismaService.order.findUnique
        .mockResolvedValueOnce(mockOrder) // First call for validation
        .mockResolvedValueOnce({
          ...mockOrder,
          status: OrderStatus.CANCELLED,
        }); // Second call for fetching updated order
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: OrderStatus.CANCELLED,
            }),
          },
          orderStatusHistory: { create: jest.fn() },
          orderItem: {
            findMany: jest.fn().mockResolvedValue([
              { productVariantId: 'variant-1', quantity: 2 },
            ]),
          },
        });
      });
      await service.updateStatus('order-1', {
        status: OrderStatus.CANCELLED,
      });
      expect(mockInventoryService.releaseStock).toHaveBeenCalled();
    });
  });

  describe('addNote', () => {
    it('should add a note to an order', async () => {
      mockPrismaService.order.findUnique
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(mockOrder);
      await service.addNote('order-1', { note: 'Test note' });
      expect(mockPrismaService.order.update).toHaveBeenCalled();
    });
  });

  describe('getStatusHistory', () => {
    it('should return status history', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderStatusHistory.findMany.mockResolvedValue([
        {
          id: 'history-1',
          orderId: 'order-1',
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          userId: null,
          notes: 'Order created',
          createdAt: new Date(),
        },
      ]);
      const result = await service.getStatusHistory('order-1');
      expect(result).toHaveLength(1);
    });
  });
});
