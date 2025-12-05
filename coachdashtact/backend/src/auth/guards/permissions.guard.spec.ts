import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PermissionsService } from '../../permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let permissionsService: PermissionsService;

  const mockPermissionsService = {
    userHasAllPermissions: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no permissions are required', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPermissionsService.userHasAllPermissions).not.toHaveBeenCalled();
    });

    it('should allow access when permissions array is empty', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPermissionsService.userHasAllPermissions).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext(undefined);
      mockReflector.getAllAndOverride.mockReturnValue(['users:read']);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated');
    });

    it('should allow access when user has all required permissions', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredPermissions = ['users:read', 'users:write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockPermissionsService.userHasAllPermissions.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPermissionsService.userHasAllPermissions).toHaveBeenCalledWith(
        'user-1',
        requiredPermissions,
      );
    });

    it('should throw ForbiddenException when user lacks required permissions', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredPermissions = ['users:delete'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockPermissionsService.userHasAllPermissions.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Insufficient permissions. Required: users:delete',
      );
    });

    it('should check permissions from both handler and class', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredPermissions = ['users:read'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockPermissionsService.userHasAllPermissions.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
    });

    it('should handle multiple required permissions', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredPermissions = ['users:read', 'users:write', 'users:delete'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockPermissionsService.userHasAllPermissions.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPermissionsService.userHasAllPermissions).toHaveBeenCalledWith(
        'user-1',
        requiredPermissions,
      );
    });
  });
});
