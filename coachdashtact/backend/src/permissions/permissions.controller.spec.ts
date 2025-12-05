import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  const mockPermission = {
    id: 'perm-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'Read user data',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByResource: jest.fn(),
    assignPermissionToRole: jest.fn(),
    removePermissionFromRole: jest.fn(),
    getRolePermissions: jest.fn(),
    userHasPermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createDto: CreatePermissionDto = {
        name: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'Read user data',
      };
      mockPermissionsService.create.mockResolvedValue(mockPermission);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPermission);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all permissions when no resource filter', async () => {
      const permissions = [mockPermission];
      mockPermissionsService.findAll.mockResolvedValue(permissions);

      const result = await controller.findAll();

      expect(result).toEqual(permissions);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByResource).not.toHaveBeenCalled();
    });

    it('should return filtered permissions when resource provided', async () => {
      const permissions = [mockPermission];
      mockPermissionsService.findByResource.mockResolvedValue(permissions);

      const result = await controller.findAll('users');

      expect(result).toEqual(permissions);
      expect(service.findByResource).toHaveBeenCalledWith('users');
      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      mockPermissionsService.findOne.mockResolvedValue(mockPermission);

      const result = await controller.findOne('perm-1');

      expect(result).toEqual(mockPermission);
      expect(service.findOne).toHaveBeenCalledWith('perm-1');
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updateDto: UpdatePermissionDto = {
        description: 'Updated description',
      };
      const updatedPermission = { ...mockPermission, ...updateDto };
      mockPermissionsService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update('perm-1', updateDto);

      expect(result).toEqual(updatedPermission);
      expect(service.update).toHaveBeenCalledWith('perm-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockPermissionsService.remove.mockResolvedValue(mockPermission);

      const result = await controller.remove('perm-1');

      expect(result).toEqual(mockPermission);
      expect(service.remove).toHaveBeenCalledWith('perm-1');
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign a permission to a role', async () => {
      mockPermissionsService.assignPermissionToRole.mockResolvedValue(undefined);

      const result = await controller.assignPermissionToRole('role-1', 'perm-1');

      expect(result).toEqual({ message: 'Permission assigned successfully' });
      expect(service.assignPermissionToRole).toHaveBeenCalledWith('role-1', 'perm-1');
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove a permission from a role', async () => {
      mockPermissionsService.removePermissionFromRole.mockResolvedValue(undefined);

      const result = await controller.removePermissionFromRole('role-1', 'perm-1');

      expect(result).toEqual({ message: 'Permission removed successfully' });
      expect(service.removePermissionFromRole).toHaveBeenCalledWith('role-1', 'perm-1');
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', async () => {
      const permissions = [mockPermission];
      mockPermissionsService.getRolePermissions.mockResolvedValue(permissions);

      const result = await controller.getRolePermissions('role-1');

      expect(result).toEqual(permissions);
      expect(service.getRolePermissions).toHaveBeenCalledWith('role-1');
    });
  });

  describe('checkUserPermission', () => {
    it('should return true if user has permission', async () => {
      mockPermissionsService.userHasPermission.mockResolvedValue(true);

      const result = await controller.checkUserPermission('user-1', 'users:read');

      expect(result).toEqual({ hasPermission: true });
      expect(service.userHasPermission).toHaveBeenCalledWith('user-1', 'users:read');
    });

    it('should return false if user does not have permission', async () => {
      mockPermissionsService.userHasPermission.mockResolvedValue(false);

      const result = await controller.checkUserPermission('user-1', 'posts:write');

      expect(result).toEqual({ hasPermission: false });
      expect(service.userHasPermission).toHaveBeenCalledWith('user-1', 'posts:write');
    });
  });
});
