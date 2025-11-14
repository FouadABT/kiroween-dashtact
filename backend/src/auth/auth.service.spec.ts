import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at the module level
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaClient;
  let jwtService: JwtService;

  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
    },
    tokenBlacklist: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockRole = {
    id: 'role-id',
    name: 'USER',
    description: 'Standard user',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedpassword',
    roleId: 'role-id',
    isActive: true,
    emailVerified: false,
    authProvider: 'local',
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      ...mockRole,
      rolePermissions: [
        {
          permission: {
            id: 'perm-1',
            name: 'users:read',
            description: 'Read users',
            resource: 'users',
            action: 'read',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaClient>(PrismaClient);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password with bcrypt', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerDto.password,
        expect.any(Number),
      );
    });

    it('should not return password in response', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should compare password using bcrypt', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should generate access and refresh tokens', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should include user permissions in response', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login(loginDto);

      expect(result.user.permissions).toBeInstanceOf(Array);
      expect(result.user.permissions).toContain('users:read');
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';
    const mockPayload = {
      sub: 'user-id',
      email: 'test@example.com',
      roleId: 'role-id',
      roleName: 'USER',
      permissions: ['users:read'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    it('should generate new access token with valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw UnauthorizedException if token is blacklisted', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue({
        id: 'blacklist-id',
        token: refreshToken,
        userId: 'user-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify refresh token signature', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      await service.refreshToken(refreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    const userId = 'user-id';
    const refreshToken = 'valid-refresh-token';
    const mockPayload = {
      sub: userId,
      email: 'test@example.com',
      roleId: 'role-id',
      roleName: 'USER',
      permissions: [],
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    it('should successfully logout and blacklist token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.create.mockResolvedValue({
        id: 'blacklist-id',
        token: refreshToken,
        userId,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      await expect(service.logout(userId, refreshToken)).resolves.not.toThrow();

      expect(mockPrismaClient.tokenBlacklist.create).toHaveBeenCalled();
    });

    it('should add token to blacklist with expiration', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaClient.tokenBlacklist.create.mockResolvedValue({
        id: 'blacklist-id',
        token: refreshToken,
        userId,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      await service.logout(userId, refreshToken);

      expect(mockPrismaClient.tokenBlacklist.create).toHaveBeenCalledWith({
        data: {
          token: refreshToken,
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should not throw if token verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.logout(userId, refreshToken)).resolves.not.toThrow();
    });

    it('should not throw if token belongs to different user (graceful logout)', async () => {
      const differentUserPayload = {
        ...mockPayload,
        sub: 'different-user-id',
      };
      mockJwtService.verifyAsync.mockResolvedValue(differentUserPayload);

      // Should not throw - allows graceful logout even with mismatched token
      await expect(service.logout(userId, refreshToken)).resolves.not.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'Password123',
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'Password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'WrongPassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.generateTokens(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue({
        id: 'blacklist-id',
        token: 'blacklisted-token',
        userId: 'user-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.isTokenBlacklisted('blacklisted-token');

      expect(result).toBe(true);
    });

    it('should return false if token is not blacklisted', async () => {
      mockPrismaClient.tokenBlacklist.findUnique.mockResolvedValue(null);

      const result = await service.isTokenBlacklisted('valid-token');

      expect(result).toBe(false);
    });
  });
});
