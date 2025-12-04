import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
  };

  const mockCustomer = {
    id: 'customer-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    company: 'Test Company',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      apartment: 'Apt 4B',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    notes: 'VIP customer',
    tags: ['vip', 'wholesale'],
    portalToken: null,
    portalExpiresAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastOrderAt: null,
    _count: { orders: 2 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      mockPrismaService.customer.count.mockResolvedValue(1);
      mockPrismaService.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrismaService.order.findMany.mockResolvedValue([
        { total: 100 },
        { total: 200 },
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.customers).toHaveLength(1);
      expect(mockPrismaService.customer.findMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      mockPrismaService.customer.count.mockResolvedValue(0);
      mockPrismaService.customer.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'john' });

      expect(mockPrismaService.customer.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { company: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should filter by tag', async () => {
      mockPrismaService.customer.count.mockResolvedValue(0);
      mockPrismaService.customer.findMany.mockResolvedValue([]);

      await service.findAll({ tag: 'vip' });

      expect(mockPrismaService.customer.count).toHaveBeenCalledWith({
        where: {
          tags: { has: 'vip' },
        },
      });
    });

    it('should sort by specified field', async () => {
      mockPrismaService.customer.count.mockResolvedValue(0);
      mockPrismaService.customer.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'email', sortOrder: 'asc' });

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { email: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.order.findMany.mockResolvedValue([
        { total: 100 },
        { total: 200 },
      ]);
      const result = await service.findOne('customer-1');
      expect(result.id).toBe('customer-1');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      email: 'new@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should create a new customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.create.mockResolvedValue({
        ...mockCustomer,
        ...createDto,
      });
      const result = await service.create(createDto);
      expect(result.email).toBe(createDto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update a customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        ...updateDto,
      });
      mockPrismaService.order.findMany.mockResolvedValue([]);
      const result = await service.update('customer-1', updateDto);
      expect(result.firstName).toBe(updateDto.firstName);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      const customerWithCount = {
        ...mockCustomer,
        _count: { orders: 0 },
      };
      mockPrismaService.customer.findUnique.mockResolvedValue(
        customerWithCount,
      );
      mockPrismaService.customer.delete.mockResolvedValue(mockCustomer);
      await service.delete('customer-1');
      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generatePortalToken', () => {
    it('should generate a portal token', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        portalToken: 'token123',
        portalExpiresAt: new Date(),
      });
      const result = await service.generatePortalToken('customer-1');
      expect(result).toBeDefined();
      expect(mockPrismaService.customer.update).toHaveBeenCalled();
    });
  });
});