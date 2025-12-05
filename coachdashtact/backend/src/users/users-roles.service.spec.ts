import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at module level
jest.mock('bcrypt');

describe('UsersService - Role Management', () => {
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

  const mockUserRole = {
    id: 'cldefault_user',
    name: 'USER',
    description: 'Standard user with basic permissions',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminRole = {
    id: 'cldefault_admin',
    name: 'ADMIN',
    description: 'Administrator with full system access',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    roleId: 'cldefault_user',
    role: mockUserRole,
    isActive: true,
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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return all active roles', async () => {
      const mockRoles = [mockUserRole, mockAdminRole];
      mockPrismaService.userRole.findMany.mockResolvedValue(mockRoles);

      const result = await service.getRoles();

      expect(result).toEqual(mockRoles);
      expect(mockPrismaService.userRole.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array if no roles exist', async () => {
      mockPrismaService.userRole.findMany.mockResolvedValue([]);

      const result = await service.getRoles();

      expect(result).toEqual([]);
    });
  });

  describe('getRoleByName', () => {
    it('should return role by name', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockUserRole);

      const result = await service.getRoleByName('USER');

      expect(result).toEqual(mockUserRole);
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { name: 'USER' },
      });
    });

    it('should return null if role not found', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);

      const result = await service.getRoleByName('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('create - with roleId', () => {
    it('should create user with valid roleId', async () => {
      const createDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        roleId: 'cldefault_user',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockUserRole);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: createDto.email,
        name: createDto.name,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.create(createDto);

      expect(result.email).toBe(createDto.email);
      expect(result.role).toEqual(mockUserRole);
      expect(result).not.toHaveProperty('password');
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'cldefault_user' },
      });
    });

    it('should use default USER role if roleId not provided', async () => {
      const createDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockUserRole);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await service.create(createDto);

      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'cldefault_user' },
      });
    });

    it('should throw BadRequestException if roleId is invalid', async () => {
      const createDto = {
        email: 'newuser@example.com',
        password: 'password123',
        roleId: 'invalid_role_id',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('update - with roleId', () => {
    it('should update user role successfully', async () => {
      const updateDto = {
        roleId: 'cldefault_admin',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockAdminRole);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        roleId: 'cldefault_admin',
        role: mockAdminRole,
      });

      const result = await service.update('user123', updateDto);

      expect(result.roleId).toBe('cldefault_admin');
      expect(result.role).toEqual(mockAdminRole);
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'cldefault_admin' },
      });
    });

    it('should throw BadRequestException if new roleId is invalid', async () => {
      const updateDto = {
        roleId: 'invalid_role_id',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);

      await expect(service.update('user123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should not validate roleId if not provided in update', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      await service.update('user123', updateDto);

      expect(mockPrismaService.userRole.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findAll - with role filtering', () => {
    it('should filter users by roleId', async () => {
      const query = {
        roleId: 'cldefault_admin',
        page: 1,
        limit: 10,
      };

      const mockUsers = [
        { ...mockUser, roleId: 'cldefault_admin', role: mockAdminRole },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role.name).toBe('ADMIN');
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roleId: 'cldefault_admin',
          }),
        }),
      );
    });

    it('should filter users by roleName', async () => {
      const query = {
        roleName: 'ADMIN',
        page: 1,
        limit: 10,
      };

      const mockUsers = [
        { ...mockUser, roleId: 'cldefault_admin', role: mockAdminRole },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.users).toHaveLength(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: { name: 'ADMIN' },
          }),
        }),
      );
    });

    it('should include role data in response', async () => {
      const query = { page: 1, limit: 10 };

      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.users[0]).toHaveProperty('role');
      expect(result.users[0].role).toHaveProperty('name');
      expect(result.users[0].role).toHaveProperty('description');
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { role: true },
        }),
      );
    });
  });

  describe('findOne - with role data', () => {
    it('should return user with role object', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user123');

      expect(result).toHaveProperty('role');
      expect(result.role).toEqual(mockUserRole);
      expect(result).not.toHaveProperty('password');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        include: { role: true },
      });
    });
  });

  describe('findByEmail - with role data', () => {
    it('should return user with role object for authentication', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('role');
      expect(result?.role).toEqual(mockUserRole);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { role: true },
      });
    });
  });
});
