import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService - JWT Authentication Fields', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userRole: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockRole = {
    id: 'role-1',
    name: 'USER',
    description: 'Standard user',
    isActive: true,
    isSystemRole: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create - JWT Auth Fields', () => {
    it('should create user with default JWT auth field values', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: createUserDto.email,
        name: createUserDto.name,
        password: 'hashed_password',
        roleId: 'cldefault_user',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result.emailVerified).toBe(false);
      expect(result.authProvider).toBe('local');
      expect(result.twoFactorEnabled).toBe(false);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: createUserDto.email,
            name: createUserDto.name,
          }),
        }),
      );
    });

    it('should create user with custom emailVerified value', async () => {
      const createUserDto = {
        email: 'verified@example.com',
        password: 'password123',
        emailVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-2',
        email: createUserDto.email,
        password: 'hashed_password',
        roleId: 'cldefault_user',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result.emailVerified).toBe(true);
    });

    it('should create user with custom authProvider', async () => {
      const createUserDto = {
        email: 'google@example.com',
        password: 'password123',
        authProvider: 'google',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-3',
        email: createUserDto.email,
        password: 'hashed_password',
        roleId: 'cldefault_user',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'google',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result.authProvider).toBe('google');
    });

    it('should create user with twoFactorEnabled', async () => {
      const createUserDto = {
        email: '2fa@example.com',
        password: 'password123',
        twoFactorEnabled: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-4',
        email: createUserDto.email,
        password: 'hashed_password',
        roleId: 'cldefault_user',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result.twoFactorEnabled).toBe(true);
    });
  });

  describe('update - JWT Auth Fields', () => {
    const existingUser = {
      id: 'user-1',
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'hashed_password',
      roleId: 'role-1',
      role: mockRole,
      isActive: true,
      emailVerified: false,
      authProvider: 'local',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update emailVerified status', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...existingUser,
        emailVerified: true,
      });

      const result = await service.update('user-1', { emailVerified: true });

      expect(result.emailVerified).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            emailVerified: true,
          }),
        }),
      );
    });

    it('should update authProvider', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...existingUser,
        authProvider: 'github',
      });

      const result = await service.update('user-1', { authProvider: 'github' });

      expect(result.authProvider).toBe('github');
    });

    it('should enable two-factor authentication', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...existingUser,
        twoFactorEnabled: true,
      });

      const result = await service.update('user-1', { twoFactorEnabled: true });

      expect(result.twoFactorEnabled).toBe(true);
    });

    it('should disable two-factor authentication', async () => {
      const userWith2FA = { ...existingUser, twoFactorEnabled: true };
      mockPrismaService.user.findUnique.mockResolvedValue(userWith2FA);
      mockPrismaService.user.update.mockResolvedValue({
        ...userWith2FA,
        twoFactorEnabled: false,
      });

      const result = await service.update('user-1', { twoFactorEnabled: false });

      expect(result.twoFactorEnabled).toBe(false);
    });

    it('should update multiple JWT auth fields at once', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...existingUser,
        emailVerified: true,
        authProvider: 'google',
        twoFactorEnabled: true,
      });

      const result = await service.update('user-1', {
        emailVerified: true,
        authProvider: 'google',
        twoFactorEnabled: true,
      });

      expect(result.emailVerified).toBe(true);
      expect(result.authProvider).toBe('google');
      expect(result.twoFactorEnabled).toBe(true);
    });
  });

  describe('findAll - JWT Auth Fields', () => {
    it('should return users with JWT auth fields', async () => {
      const users = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          password: 'hashed',
          roleId: 'role-1',
          role: mockRole,
          isActive: true,
          emailVerified: true,
          authProvider: 'local',
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          password: 'hashed',
          roleId: 'role-1',
          role: mockRole,
          isActive: true,
          emailVerified: false,
          authProvider: 'google',
          twoFactorEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.users).toHaveLength(2);
      expect(result.users[0].emailVerified).toBe(true);
      expect(result.users[0].authProvider).toBe('local');
      expect(result.users[0].twoFactorEnabled).toBe(false);
      expect(result.users[1].emailVerified).toBe(false);
      expect(result.users[1].authProvider).toBe('google');
      expect(result.users[1].twoFactorEnabled).toBe(true);
    });
  });

  describe('findOne - JWT Auth Fields', () => {
    it('should return user with JWT auth fields', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'github',
        twoFactorEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(result.emailVerified).toBe(true);
      expect(result.authProvider).toBe('github');
      expect(result.twoFactorEnabled).toBe(true);
    });
  });

  describe('findByEmail - JWT Auth Fields', () => {
    it('should return user with JWT auth fields when finding by email', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result.emailVerified).toBe(false);
      expect(result.authProvider).toBe('local');
      expect(result.twoFactorEnabled).toBe(false);
    });
  });
});
