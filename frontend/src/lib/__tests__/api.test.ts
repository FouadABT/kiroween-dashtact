/**
 * API Client Tests
 * 
 * Tests for the API client functionality and type safety
 */

import { UserApi, ApiClient, apiUtils } from '../api';
import { UserRole, LoginCredentials, RegisterUserData } from '@/types/user';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('ApiClient', () => {
    it('should make GET requests with correct headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ApiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({ data: 'test' });
    });

    it('should include auth token in headers when set', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      ApiClient.setAuthToken('test-token');
      await ApiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
    });

    it('should handle API errors correctly', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Bad Request' }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(ApiClient.get('/test')).rejects.toThrow('Bad Request');
    });
  });

  describe('UserApi', () => {
    it('should call login endpoint with correct data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.USER,
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          token: 'jwt-token',
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await UserApi.login(credentials);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(UserRole.USER);
    });

    it('should call register endpoint with correct data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.USER,
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const registerData: RegisterUserData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = await UserApi.register(registerData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('apiUtils', () => {
    it('should set and clear auth tokens correctly', () => {
      const mockSetItem = jest.fn();
      const mockRemoveItem = jest.fn();
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: mockSetItem,
          removeItem: mockRemoveItem,
          getItem: jest.fn(),
        },
        writable: true,
      });

      apiUtils.setAuthToken('test-token');
      expect(mockSetItem).toHaveBeenCalledWith('authToken', 'test-token');

      apiUtils.clearAuthToken();
      expect(mockRemoveItem).toHaveBeenCalledWith('authToken');
    });

    it('should check authentication status correctly', () => {
      const mockGetItem = jest.fn().mockReturnValue('test-token');
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const isAuth = apiUtils.isAuthenticated();
      expect(isAuth).toBe(true);
      expect(mockGetItem).toHaveBeenCalledWith('authToken');
    });
  });
});