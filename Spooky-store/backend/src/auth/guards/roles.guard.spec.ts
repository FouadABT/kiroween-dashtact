import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    prismaService = module.get<PrismaService>(PrismaService);
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
    it('should allow access when no roles are required', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should allow access when roles array is empty', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext(undefined);
      mockReflector.getAllAndOverride.mockReturnValue(['Admin']);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated');
    });

    it('should throw ForbiddenException when user is not found', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue(['Admin']);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('User role not found');
    });

    it('should throw ForbiddenException when user has no role', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      mockReflector.getAllAndOverride.mockReturnValue(['Admin']);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: null,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('User role not found');
    });

    it('should allow access when user has required role', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredRoles = ['Admin'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { id: 'role-1', name: 'Admin' },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { role: true },
      });
    });

    it('should throw ForbiddenException when user lacks required role', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredRoles = ['Admin'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { id: 'role-2', name: 'User' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Insufficient role. Required: Admin',
      );
    });

    it('should allow access when user has one of multiple required roles', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredRoles = ['Admin', 'Manager'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { id: 'role-2', name: 'Manager' },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should check roles from both handler and class', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredRoles = ['Admin'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { id: 'role-1', name: 'Admin' },
      });

      await guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should handle case-sensitive role names', async () => {
      const context = createMockExecutionContext({ id: 'user-1' });
      const requiredRoles = ['admin'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { id: 'role-1', name: 'Admin' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});
