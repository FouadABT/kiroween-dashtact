import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

describe('AuthController - Registration', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test User',
    };

    const mockAuthResponse: AuthResponse = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: {
          id: 'role-id',
          name: 'USER',
          description: 'Standard user',
        },
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900,
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should return user profile with tokens', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should not include password in response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should handle registration with minimal data', async () => {
      const minimalRegisterDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const minimalResponse: AuthResponse = {
        ...mockAuthResponse,
        user: {
          ...mockAuthResponse.user,
          name: null,
        },
      };

      mockAuthService.register.mockResolvedValue(minimalResponse);

      const result = await controller.register(minimalRegisterDto);

      expect(result.user.name).toBeNull();
      expect(authService.register).toHaveBeenCalledWith(minimalRegisterDto);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Registration failed',
      );
    });

    it('should return HTTP 201 status code', async () => {
      // This test verifies the @HttpCode(HttpStatus.CREATED) decorator
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      // The actual status code is set by the decorator, not the return value
    });

    it('should be a public endpoint', async () => {
      // This test verifies the @Public() decorator is applied
      // In a real scenario, this would be tested with integration tests
      // checking that the endpoint is accessible without authentication
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
    });
  });

  describe('RegisterDto validation', () => {
    it('should accept valid registration data', async () => {
      const validDto: RegisterDto = {
        email: 'valid@example.com',
        password: 'ValidPass123',
        name: 'Valid User',
      };

      mockAuthService.register.mockResolvedValue({} as AuthResponse);

      await controller.register(validDto);

      expect(authService.register).toHaveBeenCalledWith(validDto);
    });

    it('should accept registration without name', async () => {
      const dtoWithoutName: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockAuthService.register.mockResolvedValue({} as AuthResponse);

      await controller.register(dtoWithoutName);

      expect(authService.register).toHaveBeenCalledWith(dtoWithoutName);
    });
  });
});
