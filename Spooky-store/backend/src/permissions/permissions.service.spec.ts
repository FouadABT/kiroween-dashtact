import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: PrismaService;

  const mockPermission = {
    id: 'perm-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'Read user data',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole = {
    id: 'role-1',
    name: 'USER',
    description: 'Standard user role',
    isActive: true,
    isSystemRole: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    roleId: 'role-1',
    isActive: true,
    emailVerified: true,
    authProvider: 'local',
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      ...mockRole,
      rolePermissions: [
        {
          id: 'rp-1',
          roleId: 'role-1',
          permissionId: 'perm-1',
          createdAt: new Date(),
          permission: mockPermission,
        },
      ],
    },
  };

  const mockPrismaService = {
    permission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userRole: {
      findUnique: jest.fn(),
    },
    rolePermission: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePermissionDto = {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'Read user data',
    };

    it('should create a new permission', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);
      mockPrismaService.permission.create.mockResolvedValue(mockPermission);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if permission already exists', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.permission.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all permissions ordered by resource and action', async () => {
      const permissions = [mockPermission];
      mockPrismaService.permission.findMany.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(result).toEqual(permissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);

      const result = await service.findOne('perm-1');

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { id: 'perm-1' },
      });
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a permission by name', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);

      const result = await service.findByName('users:read');

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { name: 'users:read' },
      });
    });

    it('should return null if permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      const result = await service.findByName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdatePermissionDto = {
      description: 'Updated description',
    };

    it('should update a permission', async () => {
      const updatedPermission = { ...mockPermission, ...updateDto };
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);
      mockPrismaService.permission.update.mockResolvedValue(updatedPermission);

      const result = await service.update('perm-1', updateDto);

      expect(result).toEqual(updatedPermission);
      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: 'perm-1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.permission.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating name to existing permission', async () => {
      const updateDtoWithName: UpdatePermissionDto = {
        name: 'users:write',
      };
      const existingPermission = { ...mockPermission, id: 'perm-2', name: 'users:write' };

      mockPrismaService.permission.findUnique
        .mockResolvedValueOnce(mockPermission) // First call for existence check
        .mockResolvedValueOnce(existingPermission); // Second call for name conflict check

      await expect(service.update('perm-1', updateDtoWithName)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.permission.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);
      mockPrismaService.permission.delete.mockResolvedValue(mockPermission);

      const result = await service.remove('perm-1');

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: 'perm-1' },
      });
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      expect(prisma.permission.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByResource', () => {
    it('should return permissions filtered by resource', async () => {
      const permissions = [mockPermission];
      mockPrismaService.permission.findMany.mockResolvedValue(permissions);

      const result = await service.findByResource('users');

      expect(result).toEqual(permissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { resource: 'users' },
        orderBy: { action: 'asc' },
      });
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign a permission to a role', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);
      mockPrismaService.rolePermission.findUnique.mockResolvedValue(null);
      mockPrismaService.rolePermission.create.mockResolvedValue({
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        createdAt: new Date(),
      });

      await service.assignPermissionToRole('role-1', 'perm-1');

      expect(prisma.rolePermission.create).toHaveBeenCalledWith({
        data: {
          roleId: 'role-1',
          permissionId: 'perm-1',
        },
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);

      await expect(service.assignPermissionToRole('nonexistent', 'perm-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.assignPermissionToRole('role-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if assignment already exists', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.permission.findUnique.mockResolvedValue(mockPermission);
      mockPrismaService.rolePermission.findUnique.mockResolvedValue({
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        createdAt: new Date(),
      });

      await expect(service.assignPermissionToRole('role-1', 'perm-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove a permission from a role', async () => {
      const assignment = {
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        createdAt: new Date(),
      };
      mockPrismaService.rolePermission.findUnique.mockResolvedValue(assignment);
      mockPrismaService.rolePermission.delete.mockResolvedValue(assignment);

      await service.removePermissionFromRole('role-1', 'perm-1');

      expect(prisma.rolePermission.delete).toHaveBeenCalledWith({
        where: {
          roleId_permissionId: {
            roleId: 'role-1',
            permissionId: 'perm-1',
          },
        },
      });
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockPrismaService.rolePermission.findUnique.mockResolvedValue(null);

      await expect(service.removePermissionFromRole('role-1', 'perm-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', async () => {
      const roleWithPermissions = {
        ...mockRole,
        rolePermissions: [
          {
            id: 'rp-1',
            roleId: 'role-1',
            permissionId: 'perm-1',
            createdAt: new Date(),
            permission: mockPermission,
          },
        ],
      };
      mockPrismaService.userRole.findUnique.mockResolvedValue(roleWithPermissions);

      const result = await service.getRolePermissions('role-1');

      expect(result).toEqual([mockPermission]);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);

      await expect(service.getRolePermissions('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('userHasPermission', () => {
    it('should return true if user has exact permission', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.userHasPermission('user-1', 'users:read');

      expect(result).toBe(true);
    });

    it('should return true if user has super admin permission (*:*)', async () => {
      const superAdminUser = {
        ...mockUser,
        role: {
          ...mockRole,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-super',
              createdAt: new Date(),
              permission: {
                id: 'perm-super',
                name: '*:*',
                resource: '*',
                action: '*',
                description: 'Super admin',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(superAdminUser);

      const result = await service.userHasPermission('user-1', 'anything:anything');

      expect(result).toBe(true);
    });

    it('should return true if user has wildcard resource permission', async () => {
      const userWithWildcard = {
        ...mockUser,
        role: {
          ...mockRole,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-wildcard',
              createdAt: new Date(),
              permission: {
                id: 'perm-wildcard',
                name: 'users:*',
                resource: 'users',
                action: '*',
                description: 'All user actions',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithWildcard);

      const result = await service.userHasPermission('user-1', 'users:write');

      expect(result).toBe(true);
    });

    it('should return true if user has wildcard action permission', async () => {
      const userWithWildcard = {
        ...mockUser,
        role: {
          ...mockRole,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-wildcard',
              createdAt: new Date(),
              permission: {
                id: 'perm-wildcard',
                name: '*:read',
                resource: '*',
                action: 'read',
                description: 'Read all resources',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithWildcard);

      const result = await service.userHasPermission('user-1', 'posts:read');

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.userHasPermission('user-1', 'posts:write');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.userHasPermission('nonexistent', 'users:read');

      expect(result).toBe(false);
    });
  });

  describe('userHasAnyPermission', () => {
    it('should return true if user has at least one permission', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.userHasAnyPermission('user-1', [
        'users:read',
        'posts:write',
      ]);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.userHasAnyPermission('user-1', [
        'posts:write',
        'comments:delete',
      ]);

      expect(result).toBe(false);
    });
  });

  describe('userHasAllPermissions', () => {
    it('should return true if user has all permissions', async () => {
      const userWithMultiplePerms = {
        ...mockUser,
        role: {
          ...mockRole,
          rolePermissions: [
            {
              id: 'rp-1',
              roleId: 'role-1',
              permissionId: 'perm-1',
              createdAt: new Date(),
              permission: mockPermission,
            },
            {
              id: 'rp-2',
              roleId: 'role-1',
              permissionId: 'perm-2',
              createdAt: new Date(),
              permission: {
                id: 'perm-2',
                name: 'users:write',
                resource: 'users',
                action: 'write',
                description: 'Write user data',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithMultiplePerms);

      const result = await service.userHasAllPermissions('user-1', [
        'users:read',
        'users:write',
      ]);

      expect(result).toBe(true);
    });

    it('should return false if user is missing any permission', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.userHasAllPermissions('user-1', [
        'users:read',
        'users:write',
      ]);

      expect(result).toBe(false);
    });
  });
});
