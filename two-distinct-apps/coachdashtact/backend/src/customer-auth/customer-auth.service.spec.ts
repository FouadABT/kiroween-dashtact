import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CustomerAuthService } from './customer-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('CustomerAuthService', () => {
  let service: CustomerAuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let cartService: CartService;

  const mockPrismaService = {
    customerAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      create: jest.fn(),
      update: jest.fn(),
    },
    tokenBlacklist: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockCartService = {
    mergeCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<CustomerAuthService>(CustomerAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    cartService = module.get<CartService>(CartService);

    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const userId = 'account-123';
    const customerId = 'customer-123';

    const mockAccount = {
      id: userId,
      email: 'old@example.com',
      emailVerified: false,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId,
      customer: {
        id: customerId,
        email: 'old@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        company: 'Acme Corp',
        shippingAddress: null,
        billingAddress: null,
      },
    };

    it('should update profile with firstName only', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockAccount.customer,
        firstName: 'Jane',
      });
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce({
        ...mockAccount,
        customer: { ...mockAccount.customer, firstName: 'Jane' },
      });

      const result = await service.updateProfile(userId, { firstName: 'Jane' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          email: 'old@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '555-1234',
          company: 'Acme Corp',
          shippingAddress: null,
          billingAddress: null,
        },
      });
      expect(result).toBeDefined();
    });

    it('should update profile with email and check uniqueness', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(null); // Email not taken
      mockPrismaService.customerAccount.update.mockResolvedValue({
        ...mockAccount,
        email: 'new@example.com',
      });
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockAccount.customer,
        email: 'new@example.com',
      });
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce({
        ...mockAccount,
        email: 'new@example.com',
        customer: { ...mockAccount.customer, email: 'new@example.com' },
      });

      const result = await service.updateProfile(userId, { email: 'new@example.com' });

      expect(prisma.customerAccount.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { email: 'new@example.com' },
      });
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if email already in use', async () => {
      const existingAccount = { id: 'other-account', email: 'taken@example.com' };
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(existingAccount);

      await expect(
        service.updateProfile(userId, { email: 'taken@example.com' })
      ).rejects.toThrow(ConflictException);
    });

    it('should update profile with company field', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockAccount.customer,
        company: 'New Company Inc',
      });
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce({
        ...mockAccount,
        customer: { ...mockAccount.customer, company: 'New Company Inc' },
      });

      const result = await service.updateProfile(userId, { company: 'New Company Inc' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: expect.objectContaining({
          company: 'New Company Inc',
        }),
      });
      expect(result).toBeDefined();
    });

    it('should update profile with multiple fields including email', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(null); // Email not taken
      mockPrismaService.customerAccount.update.mockResolvedValue({
        ...mockAccount,
        email: 'newemail@example.com',
      });
      mockPrismaService.customer.update.mockResolvedValue({
        ...mockAccount.customer,
        email: 'newemail@example.com',
        firstName: 'Jane',
        company: 'Tech Corp',
      });
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce({
        ...mockAccount,
        email: 'newemail@example.com',
        customer: {
          ...mockAccount.customer,
          email: 'newemail@example.com',
          firstName: 'Jane',
          company: 'Tech Corp',
        },
      });

      const result = await service.updateProfile(userId, {
        email: 'newemail@example.com',
        firstName: 'Jane',
        company: 'Tech Corp',
      });

      expect(prisma.customerAccount.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { email: 'newemail@example.com' },
      });
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: expect.objectContaining({
          email: 'newemail@example.com',
          firstName: 'Jane',
          company: 'Tech Corp',
        }),
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(userId, { firstName: 'Jane' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should not update email if it matches current email', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.customer.update.mockResolvedValue(mockAccount.customer);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);

      await service.updateProfile(userId, { email: 'old@example.com' });

      // Should not call customerAccount.update for email
      expect(prisma.customerAccount.update).not.toHaveBeenCalled();
    });

    it('should preserve existing values when updating partial fields', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.customer.update.mockResolvedValue(mockAccount.customer);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);
      mockPrismaService.customerAccount.findUnique.mockResolvedValueOnce(mockAccount);

      await service.updateProfile(userId, { phone: '555-9999' });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: {
          email: 'old@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-9999',
          company: 'Acme Corp',
          shippingAddress: null,
          billingAddress: null,
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should return customer profile', async () => {
      const mockAccount = {
        id: 'account-123',
        email: 'test@example.com',
        emailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          id: 'customer-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
          company: 'Acme Corp',
        },
      };

      mockPrismaService.customerAccount.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getProfile('account-123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.customer.company).toBe('Acme Corp');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.customerAccount.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
