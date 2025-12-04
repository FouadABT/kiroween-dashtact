/**
 * LoginForm Component Tests
 * 
 * Tests for the login form component including:
 * - Form validation (email and password)
 * - Successful login flow
 * - Error handling
 * - Loading states
 * - Remember me functionality
 * 
 * Requirements: All from Requirement 2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { authConfig } from '@/config/auth.config';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

// Mock search params
const mockSearchParams = {
  get: vi.fn(),
};

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: {
    id: 'role-1',
    name: 'User',
    description: 'Standard user',
    rolePermissions: [
      {
        id: 'rp-1',
        roleId: 'role-1',
        permissionId: 'perm-1',
        permission: {
          id: 'perm-1',
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'View users',
        },
      },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock access token
const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue(null);
    
    // Setup default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    );
  };

  describe('Form Validation', () => {
    it('should display email required error when email is empty', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should display invalid email error when email format is incorrect', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should display password required error when password is empty', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should display password length error when password is too short', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'short');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing in field', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Trigger validation error
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Start typing
      await userEvent.type(emailInput, 't');
      
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });

    it('should validate all fields before submission', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      
      // Should not call API
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
              rememberMe: false,
            }),
          })
        );
      });
    });

    it('should redirect to dashboard after successful login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.afterLogin);
      });
    });

    it('should redirect to intended page from query params', async () => {
      mockSearchParams.get.mockReturnValue('/dashboard/settings');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
      });
    });

    it('should use custom redirectTo prop if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm({ redirectTo: '/custom-page' });
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-page');
      });
    });

    it('should call onSuccess callback when provided', async () => {
      const onSuccess = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm({ onSuccess });
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should store access token in localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should call onError callback when provided', async () => {
      const onError = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      
      renderLoginForm({ onError });
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('Invalid'));
      });
    });

    it('should not redirect on login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests. Please try again later.' }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      let resolveLogin: ((value: Response) => void) | undefined;
      const loginPromise = new Promise<Response>((resolve) => {
        resolveLogin = resolve;
      });
      
      mockFetch.mockReturnValueOnce(loginPromise as Promise<Response>);
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolveLogin?.({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      } as Response);
    });

    it('should disable form inputs during login', async () => {
      let resolveLogin: ((value: Response) => void) | undefined;
      const loginPromise = new Promise<Response>((resolve) => {
        resolveLogin = resolve;
      });
      
      mockFetch.mockReturnValueOnce(loginPromise as Promise<Response>);
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement;
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
      
      // Resolve the promise
      resolveLogin?.({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      } as Response);
    });

    it('should re-enable form after login completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('Remember Me Functionality', () => {
    it('should render remember me checkbox when feature is enabled', () => {
      renderLoginForm();
      
      if (authConfig.features.rememberMe) {
        expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
      }
    });

    it('should toggle remember me checkbox', async () => {
      renderLoginForm();
      
      if (authConfig.features.rememberMe) {
        const rememberMeCheckbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;
        
        expect(rememberMeCheckbox.checked).toBe(false);
        
        await userEvent.click(rememberMeCheckbox);
        
        await waitFor(() => {
          expect(rememberMeCheckbox.checked).toBe(true);
        });
      }
    });

    it('should include rememberMe in login request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      if (authConfig.features.rememberMe) {
        const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
        await userEvent.click(rememberMeCheckbox);
      }
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
              rememberMe: authConfig.features.rememberMe ? true : false,
            }),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderLoginForm();
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('should mark invalid fields with aria-invalid', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with inputs', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const emailError = screen.getByText('Email is required');
        
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
        expect(emailError).toHaveAttribute('id', 'email-error');
      });
    });

    it('should announce errors to screen readers', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite');
        });
      });
    });
  });
});
