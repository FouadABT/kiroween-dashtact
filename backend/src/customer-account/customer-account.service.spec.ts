import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAccountService } from './customer-account.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CustomerAccountService', () => {
  let service: CustomerAccountService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    customerPaymentMethod: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomerAccountService>(CustomerAccountService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const customerId = 'customer-123';
    const mockCustomer = {
      id: customerId,
      email: 'old@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234',
      company: 'Acme Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update profile with firstName only', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        firstName: 'Jane',
      });

      const result = await service.updateProfile(customerId, { firstName: 'Jane' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'old@example.com',
          phone: '555-1234',
          company: 'Acme Corp',
        },
      });
      expect(result.firstName).toBe('Jane');
    });

    it('should update profile with email and check uniqueness', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(mockCustomer);
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(null); // Email not taken
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        email: 'new@example.com',
      });

      const result = await service.updateProfile(customerId, { email: 'new@example.com' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'new@example.com',
          phone: '555-1234',
          company: 'Acme Corp',
        },
      });
      expect(result.email).toBe('new@example.com');
    });

    it('should throw ConflictException if email already in use', async () => {
      const existingCustomer = { id: 'other-customer', email: 'taken@example.com' };
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(mockCustomer);
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(existingCustomer);

      await expect(
        service.updateProfile(customerId, { email: 'taken@example.com' })
      ).rejects.toThrow(ConflictException);
    });

    it('should update profile with company field', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        company: 'New Company Inc',
      });

      const result = await service.updateProfile(customerId, { company: 'New Company Inc' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: expect.objectContaining({
          company: 'New Company Inc',
        }),
      });
      expect(result.company).toBe('New Company Inc');
    });

    it('should update profile with multiple fields', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(mockCustomer);
      mockPrismaService.customer.findUnique.mockResolvedValueOnce(null); // Email not taken
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockCustomer,
        email: 'newemail@example.com',
        firstName: 'Jane',
        company: 'Tech Corp',
      });

      const result = await service.updateProfile(customerId, {
        email: 'newemail@example.com',
        firstName: 'Jane',
        company: 'Tech Corp',
      });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'newemail@example.com',
          phone: '555-1234',
          company: 'Tech Corp',
        },
      });
      expect(result.email).toBe('newemail@example.com');
      expect(result.firstName).toBe('Jane');
      expect(result.company).toBe('Tech Corp');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(customerId, { firstName: 'Jane' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should not check email uniqueness if email not changed', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue(mockCustomer);

      await service.updateProfile(customerId, { firstName: 'Jane' });

      // Should only call findUnique once (for initial check)
      expect(prisma.customer.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should preserve existing values when updating partial fields', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue(mockCustomer);

      await service.updateProfile(customerId, { phone: '555-9999' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'old@example.com',
          phone: '555-9999',
          company: 'Acme Corp',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should return customer profile', async () => {
      const mockCustomer = {
        id: 'customer-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        company: 'Acme Corp',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.getProfile('customer-123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.company).toBe('Acme Corp');
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
