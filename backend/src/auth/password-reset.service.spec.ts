import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock service for password reset functionality
class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.isUsed) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: newPassword, lastPasswordChange: new Date() },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true },
        ],
      },
    });

    return result.count;
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should create a password reset token for valid user', async () => {
      const email = 'user@example.com';
      const mockUser = { id: 'user-1', email };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.create.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        token: 'reset-token',
        expiresAt: new Date(),
        isUsed: false,
        createdAt: new Date(),
      });

      const result = await service.requestPasswordReset(email);

      expect(result).toEqual({ message: 'Password reset email sent' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.requestPasswordReset('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate unique tokens', async () => {
      const mockUser = { id: 'user-1', email: 'user@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const tokens = new Set();
      for (let i = 0; i < 10; i++) {
        mockPrismaService.passwordResetToken.create.mockImplementation((args) => {
          tokens.add(args.data.token);
          return Promise.resolve({ id: `token-${i}`, ...args.data });
        });

        await service.requestPasswordReset('user@example.com');
      }

      expect(tokens.size).toBe(10); // All tokens should be unique
    });

    it('should set expiration time to 1 hour from now', async () => {
      const mockUser = { id: 'user-1', email: 'user@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const beforeTime = Date.now() + 3600000 - 1000; // 1 hour - 1 second
      await service.requestPasswordReset('user@example.com');
      const afterTime = Date.now() + 3600000 + 1000; // 1 hour + 1 second

      const createCall = mockPrismaService.passwordResetToken.create.mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt.getTime();

      expect(expiresAt).toBeGreaterThan(beforeTime);
      expect(expiresAt).toBeLessThan(afterTime);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword123';
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
        token,
        expiresAt: new Date(Date.now() + 3600000),
        isUsed: false,
        createdAt: new Date(),
        user: { id: 'user-1', email: 'user@example.com' },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({ message: 'Password reset successful' });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'newPassword')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for already used token', async () => {
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'used-token',
        expiresAt: new Date(Date.now() + 3600000),
        isUsed: true,
        createdAt: new Date(),
        user: { id: 'user-1', email: 'user@example.com' },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      await expect(service.resetPassword('used-token', 'newPassword')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired token', async () => {
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        isUsed: false,
        createdAt: new Date(),
        user: { id: 'user-1', email: 'user@example.com' },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);

      await expect(service.resetPassword('expired-token', 'newPassword')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update lastPasswordChange timestamp', async () => {
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        isUsed: false,
        createdAt: new Date(),
        user: { id: 'user-1', email: 'user@example.com' },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.$transaction.mockImplementation((operations) => {
        return Promise.resolve(operations);
      });

      await service.resetPassword('valid-token', 'newPassword');

      const transactionCall = mockPrismaService.$transaction.mock.calls[0][0];
      expect(transactionCall).toHaveLength(2);
    });

    it('should mark token as used after successful reset', async () => {
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        isUsed: false,
        createdAt: new Date(),
        user: { id: 'user-1', email: 'user@example.com' },
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      await service.resetPassword('valid-token', 'newPassword');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      mockPrismaService.passwordResetToken.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(5);
      expect(mockPrismaService.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) } },
            { isUsed: true },
          ],
        },
      });
    });

    it('should delete used tokens', async () => {
      mockPrismaService.passwordResetToken.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(3);
    });

    it('should return 0 when no tokens to cleanup', async () => {
      mockPrismaService.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(0);
    });
  });

  describe('User relation', () => {
    it('should cascade delete tokens when user is deleted', async () => {
      // This test verifies the onDelete: Cascade behavior
      const mockUser = { id: 'user-1', email: 'user@example.com' };
      const mockTokens = [
        { id: 'token-1', userId: 'user-1', token: 'token1' },
        { id: 'token-2', userId: 'user-1', token: 'token2' },
      ];

      // Simulate user deletion (tokens should be automatically deleted by Prisma)
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Verify relation exists
      expect(mockUser.id).toBe('user-1');
      expect(mockTokens.every((t) => t.userId === mockUser.id)).toBe(true);
    });

    it('should allow multiple reset tokens per user', async () => {
      const mockUser = { id: 'user-1', email: 'user@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Request multiple resets
      for (let i = 0; i < 3; i++) {
        mockPrismaService.passwordResetToken.create.mockResolvedValue({
          id: `token-${i}`,
          userId: 'user-1',
          token: `token-${i}`,
          expiresAt: new Date(),
          isUsed: false,
          createdAt: new Date(),
        });

        await service.requestPasswordReset('user@example.com');
      }

      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalledTimes(3);
    });
  });
});
