import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaClient } from '../../generated/prisma';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService - Registration', () => {
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
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
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
      password: 'hashed-password',
      roleId: 'role-id',
      isActive: true,
      emailVerified: false,
      authProvider: 'local',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: {
        ...mockRole,
        rolePermissions: [],
      },
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
      expect(result.user.name).toBe(registerDto.name);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should hash the password before storing', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

      await service.register(registerDto);

      expect(bcryptHashSpy).toHaveBeenCalledWith(
        registerDto.password,
        expect.any(Number),
      );
    });

    it('should assign default role to new user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      await service.register(registerDto);

      expect(mockPrismaClient.userRole.findFirst).toHaveBeenCalledWith({
        where: { name: expect.any(String) },
      });
    });

    it('should throw error if default role not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Default role not found',
      );
    });

    it('should generate access and refresh tokens', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should handle registration without name', async () => {
      const registerDtoWithoutName: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue({
        ...mockUser,
        name: null,
      });
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDtoWithoutName);

      expect(result.user.name).toBeNull();
    });

    it('should return user profile without password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });

    it('should include role information in user profile', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result.user.role).toHaveProperty('id');
      expect(result.user.role).toHaveProperty('name');
      expect(result.user.role).toHaveProperty('description');
    });

    it('should include permissions in user profile', async () => {
      const mockUserWithPermissions = {
        ...mockUser,
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

      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.userRole.findFirst.mockResolvedValue(mockRole);
      mockPrismaClient.user.create.mockResolvedValue(mockUserWithPermissions);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result.user.permissions).toBeInstanceOf(Array);
      expect(result.user.permissions).toContain('users:read');
    });
  });
});
