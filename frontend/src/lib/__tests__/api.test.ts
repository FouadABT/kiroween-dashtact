/**
 * API Client Unit Tests
 * 
 * Tests for the API client functionality including:
 * - Token injection in requests
 * - Automatic token refresh
 * - Error handling (401, 403, 429, etc.)
 * - Request methods (GET, POST, PUT, PATCH, DELETE)
 * 
 * Requirements: All from Requirement 4 (Backend API Protection)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  ApiClient, 
  apiUtils, 
  ApiError, 
  AuthError, 
  RateLimitError 
} from '../api';
import { authConfig } from '@/config/auth.config';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    ApiClient.clearTokens();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Injection in Requests', () => {
    it('should include Authorization header when access token is set', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.setAccessToken('test-access-token');
      await ApiClient.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should not include Authorization header when no token is set', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.clearTokens();
      await ApiClient.get('/test-endpoint');

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callArgs.headers as Record<string, string>;
      
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should include token in POST requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.setAccessToken('test-token');
      await ApiClient.post('/test-endpoint', { data: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in PUT requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.setAccessToken('test-token');
      await ApiClient.put('/test-endpoint', { data: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in PATCH requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.setAccessToken('test-token');
      await ApiClient.patch('/test-endpoint', { data: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in DELETE requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      ApiClient.setAccessToken('test-token');
      await ApiClient.delete('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should persist token to localStorage when set', () => {
      ApiClient.setAccessToken('persistent-token');
      
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBe('persistent-token');
    });

    it('should retrieve token from localStorage on get', () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, 'stored-token');
      
      const token = ApiClient.getAccessToken();
      
      expect(token).toBe('stored-token');
    });

    it('should clear token from localStorage when cleared', () => {
      localStorage.setItem(authConfig.storage.accessTokenKey, 'token-to-clear');
      
      ApiClient.clearTokens();
      
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBeNull();
    });
  });

  describe('Automatic Token Refresh', () => {
    it('should attempt token refresh on 401 response', async () => {
      // First request returns 401
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      // Refresh token request succeeds
      const refreshResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      // Retry request succeeds
      const retryResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(retryResponse);

      ApiClient.setAccessToken('old-token');
      const result = await ApiClient.get('/protected-endpoint');

      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(3);
      
      // Check refresh endpoint was called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(authConfig.endpoints.refresh),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should update access token after successful refresh', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const refreshResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ accessToken: 'refreshed-token' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const retryResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(retryResponse);

      ApiClient.setAccessToken('old-token');
      await ApiClient.get('/protected-endpoint');

      expect(ApiClient.getAccessToken()).toBe('refreshed-token');
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBe('refreshed-token');
    });

    it('should retry original request with new token after refresh', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const refreshResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const retryResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'protected-data' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(retryResponse);

      const result = await ApiClient.get('/protected-endpoint');

      expect(result).toEqual({ data: 'protected-data' });
      
      // Verify the retry request used the new token
      const lastCall = mockFetch.mock.calls[2];
      const headers = lastCall[1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer new-token');
    });

    it('should clear tokens and redirect on refresh failure', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const refreshFailureResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Refresh token expired' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshFailureResponse);

      // Mock window.location
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      ApiClient.setAccessToken('old-token');

      await expect(ApiClient.get('/protected-endpoint')).rejects.toThrow();

      expect(ApiClient.getAccessToken()).toBeNull();
      expect(localStorage.getItem(authConfig.storage.accessTokenKey)).toBeNull();
      expect(window.location.href).toBe(authConfig.redirects.unauthorized);
    });

    it('should handle multiple concurrent requests during refresh', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const refreshResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      // Setup mock to return 401 for first 3 calls, then refresh, then success for retries
      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse)
        .mockResolvedValueOnce(successResponse)
        .mockResolvedValueOnce(successResponse);

      ApiClient.setAccessToken('old-token');

      // Make 3 concurrent requests
      const promises = [
        ApiClient.get('/endpoint1'),
        ApiClient.get('/endpoint2'),
        ApiClient.get('/endpoint3'),
      ];

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(result => {
        expect(result).toEqual({ data: 'success' });
      });

      // Refresh should only be called once
      const refreshCalls = mockFetch.mock.calls.filter(call => 
        call[0].includes(authConfig.endpoints.refresh)
      );
      expect(refreshCalls).toHaveLength(1);
    });

    it('should not attempt refresh for non-401 errors', async () => {
      const forbiddenResponse = {
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({ message: 'Forbidden' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(forbiddenResponse);

      await expect(ApiClient.get('/forbidden-endpoint')).rejects.toThrow('Forbidden');

      // Should not call refresh endpoint
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw AuthError for 401 Unauthorized', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      // Mock refresh to also fail
      const refreshFailure = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Refresh failed' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshFailure);

      // Mock window.location
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      try {
        await ApiClient.get('/protected');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).statusCode).toBe(401);
        expect((error as AuthError).code).toBe('UNAUTHORIZED');
      }
    });

    it('should throw AuthError for 403 Forbidden', async () => {
      const forbiddenResponse = {
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({ message: 'Access forbidden' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(forbiddenResponse);

      try {
        await ApiClient.get('/admin-only');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).statusCode).toBe(403);
        expect((error as AuthError).message).toBe('Access forbidden');
      }
    });

    it('should throw RateLimitError for 429 Too Many Requests', async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({ message: 'Too many requests' }),
        headers: new Headers({
          'content-type': 'application/json',
          'Retry-After': '60',
        }),
      };

      mockFetch.mockResolvedValueOnce(rateLimitResponse);

      try {
        await ApiClient.get('/rate-limited');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).statusCode).toBe(429);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    it('should throw ApiError for other HTTP errors', async () => {
      const badRequestResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Bad request' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(badRequestResponse);

      try {
        await ApiClient.get('/bad-request');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(400);
        expect((error as ApiError).message).toBe('Bad request');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiClient.get('/endpoint')).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      const textResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Not JSON')),
        text: vi.fn().mockResolvedValue('Internal Server Error'),
        headers: new Headers({ 'content-type': 'text/plain' }),
      };

      mockFetch.mockResolvedValueOnce(textResponse);

      try {
        await ApiClient.get('/text-error');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(500);
      }
    });

    it('should include response data in error', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ 
          message: 'Validation failed',
          errors: ['Field is required'],
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(errorResponse);

      try {
        await ApiClient.post('/validate', { data: 'invalid' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).response).toEqual({
          message: 'Validation failed',
          errors: ['Field is required'],
        });
      }
    });
  });

  describe('apiUtils', () => {
    it('should identify AuthError correctly', () => {
      const authError = new AuthError('Unauthorized', 401, 'UNAUTHORIZED');
      const apiError = new ApiError('Bad request', 400);
      const regularError = new Error('Regular error');

      expect(apiUtils.isAuthError(authError)).toBe(true);
      expect(apiUtils.isAuthError(apiError)).toBe(false);
      expect(apiUtils.isAuthError(regularError)).toBe(false);
    });

    it('should identify RateLimitError correctly', () => {
      const rateLimitError = new RateLimitError('Too many requests', 60);
      const authError = new AuthError('Unauthorized', 401);
      const regularError = new Error('Regular error');

      expect(apiUtils.isRateLimitError(rateLimitError)).toBe(true);
      expect(apiUtils.isRateLimitError(authError)).toBe(false);
      expect(apiUtils.isRateLimitError(regularError)).toBe(false);
    });

    it('should identify unauthorized errors correctly', () => {
      const unauthorizedError = new AuthError('Unauthorized', 401);
      const forbiddenError = new AuthError('Forbidden', 403);

      expect(apiUtils.isUnauthorizedError(unauthorizedError)).toBe(true);
      expect(apiUtils.isUnauthorizedError(forbiddenError)).toBe(false);
    });

    it('should identify forbidden errors correctly', () => {
      const forbiddenError = new AuthError('Forbidden', 403);
      const unauthorizedError = new AuthError('Unauthorized', 401);

      expect(apiUtils.isForbiddenError(forbiddenError)).toBe(true);
      expect(apiUtils.isForbiddenError(unauthorizedError)).toBe(false);
    });

    it('should provide user-friendly error messages for AuthError', () => {
      const unauthorizedError = new AuthError('Unauthorized', 401);
      const forbiddenError = new AuthError('Forbidden', 403);

      expect(apiUtils.getErrorMessage(unauthorizedError)).toContain('session has expired');
      expect(apiUtils.getErrorMessage(forbiddenError)).toContain('do not have permission');
    });

    it('should provide user-friendly error messages for RateLimitError', () => {
      const rateLimitError = new RateLimitError('Too many requests', 60);
      const rateLimitErrorNoRetry = new RateLimitError('Too many requests');

      expect(apiUtils.getErrorMessage(rateLimitError)).toContain('60 seconds');
      expect(apiUtils.getErrorMessage(rateLimitErrorNoRetry)).toContain('try again later');
    });

    it('should provide user-friendly error messages for ApiError', () => {
      const apiError = new ApiError('Validation failed', 400);

      expect(apiUtils.getErrorMessage(apiError)).toBe('Validation failed');
    });

    it('should provide generic message for unknown errors', () => {
      const unknownError = { something: 'unexpected' };

      expect(apiUtils.getErrorMessage(unknownError)).toContain('unexpected error');
    });

    it('should check authentication status correctly', () => {
      ApiClient.clearTokens();
      expect(apiUtils.isAuthenticated()).toBe(false);

      ApiClient.setAccessToken('test-token');
      expect(apiUtils.isAuthenticated()).toBe(true);
    });

    it('should manually refresh token', async () => {
      const refreshResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ accessToken: 'manually-refreshed-token' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(refreshResponse);

      const result = await apiUtils.refreshToken();

      expect(result).toBe(true);
      expect(ApiClient.getAccessToken()).toBe('manually-refreshed-token');
    });

    it('should handle manual refresh failure', async () => {
      const refreshFailure = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Refresh failed' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(refreshFailure);

      const result = await apiUtils.refreshToken();

      expect(result).toBe(false);
      expect(ApiClient.getAccessToken()).toBeNull();
    });
  });

  describe('Request Methods', () => {
    it('should make GET requests with query parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      await ApiClient.get('/users', { page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users?page=1&limit=10'),
        expect.any(Object)
      );
    });

    it('should make POST requests with body', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '1' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValueOnce(mockResponse);

      const postData = { name: 'Test', email: 'test@example.com' };
      await ApiClient.post('/users', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('should include credentials in all requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await ApiClient.get('/test');
      await ApiClient.post('/test', {});
      await ApiClient.put('/test', {});
      await ApiClient.patch('/test', {});
      await ApiClient.delete('/test');

      mockFetch.mock.calls.forEach(call => {
        expect(call[1]).toMatchObject({ credentials: 'include' });
      });
    });
  });
});
