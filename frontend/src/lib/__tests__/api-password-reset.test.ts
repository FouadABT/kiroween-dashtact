/**
 * Password Reset API Client Tests
 * 
 * Tests for password reset functionality in the API client
 */

import { ApiClient } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient - Password Reset', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('forgotPassword', () => {
    it('should send password reset email request', async () => {
      const mockResponse = { message: 'Reset email sent' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ApiClient.forgotPassword('user@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle forgot password errors', async () => {
      const mockError = { message: 'Invalid email' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      await expect(
        ApiClient.forgotPassword('invalid-email')
      ).rejects.toThrow('Invalid email');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        ApiClient.forgotPassword('user@example.com')
      ).rejects.toThrow('Network error');
    });
  });

  describe('validateResetToken', () => {
    it('should validate a valid reset token', async () => {
      const mockResponse = { valid: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ApiClient.validateResetToken('valid-token-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/validate-reset-token'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'valid-token-123' }),
        })
      );
      expect(result).toEqual({ valid: true });
    });

    it('should return invalid for expired token', async () => {
      const mockResponse = { 
        valid: false, 
        message: 'Token expired' 
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ApiClient.validateResetToken('expired-token');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Token expired');
    });

    it('should handle validation errors', async () => {
      const mockError = { message: 'Invalid token format' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      await expect(
        ApiClient.validateResetToken('malformed-token')
      ).rejects.toThrow('Invalid token format');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockResponse = { message: 'Password reset successfully' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await ApiClient.resetPassword(
        'valid-token-123',
        'NewPassword123!'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'valid-token-123',
            newPassword: 'NewPassword123!',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle weak password error', async () => {
      const mockError = { 
        message: 'Password must be at least 8 characters' 
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      await expect(
        ApiClient.resetPassword('token', 'weak')
      ).rejects.toThrow('Password must be at least 8 characters');
    });

    it('should handle expired token error', async () => {
      const mockError = { message: 'Token has expired' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      await expect(
        ApiClient.resetPassword('expired-token', 'NewPassword123!')
      ).rejects.toThrow('Token has expired');
    });

    it('should handle used token error', async () => {
      const mockError = { message: 'Token has already been used' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      await expect(
        ApiClient.resetPassword('used-token', 'NewPassword123!')
      ).rejects.toThrow('Token has already been used');
    });
  });

  describe('isEmailSystemEnabled', () => {
    it('should return true when email system is enabled', async () => {
      const mockConfig = { isEnabled: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      } as Response);

      const result = await ApiClient.isEmailSystemEnabled();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/configuration'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toBe(true);
    });

    it('should return false when email system is disabled', async () => {
      const mockConfig = { isEnabled: false };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      } as Response);

      const result = await ApiClient.isEmailSystemEnabled();

      expect(result).toBe(false);
    });

    it('should return false when configuration not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await ApiClient.isEmailSystemEnabled();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiClient.isEmailSystemEnabled();

      expect(result).toBe(false);
    });

    it('should handle malformed response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // No isEnabled field
      } as Response);

      const result = await ApiClient.isEmailSystemEnabled();

      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete password reset flow', async () => {
      // Step 1: Request reset
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      } as Response);

      await ApiClient.forgotPassword('user@example.com');

      // Step 2: Validate token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      } as Response);

      const validation = await ApiClient.validateResetToken('token-123');
      expect(validation.valid).toBe(true);

      // Step 3: Reset password
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successfully' }),
      } as Response);

      const result = await ApiClient.resetPassword('token-123', 'NewPass123!');
      expect(result.message).toContain('successfully');
    });

    it('should check email system before showing forgot password', async () => {
      // Check if email system is enabled
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnabled: true }),
      } as Response);

      const isEnabled = await ApiClient.isEmailSystemEnabled();
      expect(isEnabled).toBe(true);

      // If enabled, allow forgot password
      if (isEnabled) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Reset email sent' }),
        } as Response);

        await ApiClient.forgotPassword('user@example.com');
      }

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
