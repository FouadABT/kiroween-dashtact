import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import type {
  AuthResponse,
  TokenResponse,
  UserProfile,
} from './interfaces/auth-response.interface';
import type { RequestUser } from './decorators/current-user.decorator';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getUserProfile: jest.fn(),
  };

  const mockUserProfile: UserProfile = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: {
      id: 'role-id',
      name: 'USER',
      description: 'Standard user',
    },
    permissions: ['users:read', 'profile:write'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUserProfile,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
  };

  const mockTokenResponse: TokenResponse = {
    accessToken: 'new-access-token',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

    it('should be defined', () => {
      expect(controller.register).toBeDefined();
    });

    it('should successfully register a new user with valid data', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should return user profile with tokens', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email already in use'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should not return password in response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should include user role in response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result.user.role).toBeDefined();
      expect(result.user.role.name).toBe('USER');
    });

    it('should include user permissions in response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result.user.permissions).toBeDefined();
      expect(Array.isArray(result.user.permissions)).toBe(true);
    });

    it('should handle registration without optional name field', async () => {
      const dtoWithoutName: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const responseWithoutName = {
        ...mockAuthResponse,
        user: { ...mockUserProfile, name: null },
      };

      mockAuthService.register.mockResolvedValue(responseWithoutName);

      const result = await controller.register(dtoWithoutName);

      expect(authService.register).toHaveBeenCalledWith(dtoWithoutName);
      expect(result.user.name).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });

    it('should successfully login with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return user profile with tokens', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const invalidEmailDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(invalidEmailDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const invalidPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(invalidPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle login with rememberMe option', async () => {
      const loginWithRememberMe: LoginDto = {
        ...loginDto,
        rememberMe: true,
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginWithRememberMe);

      expect(authService.login).toHaveBeenCalledWith(loginWithRememberMe);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should not expose password in error messages', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      try {
        await controller.login(loginDto);
      } catch (error) {
        expect((error as Error).message).not.toContain(loginDto.password);
      }
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should be defined', () => {
      expect(controller.refresh).toBeDefined();
    });

    it('should successfully refresh token with valid refresh token', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it('should return new access token and expiration', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(900);
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with expired refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with blacklisted token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Token has been revoked'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const userId = 'user-id';
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should be defined', () => {
      expect(controller.logout).toBeDefined();
    });

    it('should successfully logout user', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId, refreshTokenDto);

      expect(authService.logout).toHaveBeenCalledWith(
        userId,
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return success message', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId, refreshTokenDto);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Logged out successfully');
    });

    it('should blacklist refresh token on logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(userId, refreshTokenDto);

      expect(authService.logout).toHaveBeenCalledWith(
        userId,
        refreshTokenDto.refreshToken,
      );
    });

    it('should handle logout with invalid token gracefully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId, refreshTokenDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getProfile', () => {
    const mockRequestUser: RequestUser = {
      id: 'user-id',
      email: 'test@example.com',
      roleId: 'role-id',
      roleName: 'USER',
      permissions: ['users:read', 'profile:write'],
    };

    it('should be defined', () => {
      expect(controller.getProfile).toBeDefined();
    });

    it('should return user profile for authenticated user', async () => {
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(mockRequestUser);

      expect(authService.getUserProfile).toHaveBeenCalledWith(
        mockRequestUser.id,
      );
      expect(result).toEqual(mockUserProfile);
    });

    it('should return complete user profile with role and permissions', async () => {
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(mockRequestUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('permissions');
      expect(result.role.name).toBe('USER');
      expect(Array.isArray(result.permissions)).toBe(true);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthService.getUserProfile.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.getProfile(mockRequestUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not return password in profile', async () => {
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(mockRequestUser);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Response Formats', () => {
    it('should return consistent AuthResponse format for register', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toMatchObject({
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          role: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          permissions: expect.any(Array),
        }),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
    });

    it('should return consistent AuthResponse format for login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toMatchObject({
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          role: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
          permissions: expect.any(Array),
        }),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
    });

    it('should return consistent TokenResponse format for refresh', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
    });

    it('should return consistent message format for logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout('user-id', {
        refreshToken: 'token',
      });

      expect(result).toMatchObject({
        message: expect.any(String),
      });
    });

    it('should return consistent UserProfile format for getProfile', async () => {
      const mockRequestUser: RequestUser = {
        id: 'user-id',
        email: 'test@example.com',
        roleId: 'role-id',
        roleName: 'USER',
        permissions: ['users:read'],
      };

      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(mockRequestUser);

      expect(result).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        role: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
        permissions: expect.any(Array),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('Authentication Guards', () => {
    it('should have JwtAuthGuard applied to controller', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController);
      expect(guards).toBeDefined();
    });

    it('should allow public access to register endpoint', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.register,
      );
      expect(isPublic).toBe(true);
    });

    it('should allow public access to login endpoint', () => {
      const isPublic = Reflect.getMetadata('isPublic', controller.login);
      expect(isPublic).toBe(true);
    });

    it('should allow public access to refresh endpoint', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.refresh,
      );
      expect(isPublic).toBe(true);
    });

    it('should require authentication for logout endpoint', () => {
      const isPublic = Reflect.getMetadata('isPublic', controller.logout);
      expect(isPublic).toBeUndefined();
    });

    it('should require authentication for getProfile endpoint', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.getProfile,
      );
      expect(isPublic).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors in register', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle service errors in login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle service errors in refresh', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'token',
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Token verification failed'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        'Token verification failed',
      );
    });

    it('should handle service errors in logout', async () => {
      mockAuthService.logout.mockRejectedValue(
        new Error('Blacklist operation failed'),
      );

      await expect(
        controller.logout('user-id', { refreshToken: 'token' }),
      ).rejects.toThrow('Blacklist operation failed');
    });

    it('should handle service errors in getProfile', async () => {
      const mockRequestUser: RequestUser = {
        id: 'user-id',
        email: 'test@example.com',
        roleId: 'role-id',
        roleName: 'USER',
        permissions: [],
      };

      mockAuthService.getUserProfile.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.getProfile(mockRequestUser)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
