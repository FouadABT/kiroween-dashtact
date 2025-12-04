/**
 * SignupForm Component Tests
 * 
 * Tests for the signup/registration form component including:
 * - Form validation (name, email, password, confirm password, terms)
 * - Password strength validation
 * - Successful registration flow
 * - Error handling
 * - Loading states
 * 
 * Requirements: All from Requirement 1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/config/auth.config';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
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

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'newuser@example.com',
  name: 'New User',
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
const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6Im5ld3VzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzEwNzIwMDAsImV4cCI6OTk5OTk5OTk5OX0.test';

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    
    // Setup default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderSignupForm = (props = {}) => {
    return render(
      <AuthProvider>
        <SignupForm {...props} />
      </AuthProvider>
    );
  };

  describe('Form Validation', () => {
    it('should display name required error when name is empty', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should display name length error when name is too short', async () => {
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'A');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should display email required error when email is empty', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should display invalid email error when email format is incorrect', async () => {
      renderSignupForm();
      
      const emailInput = screen.getByLabelText(/^email$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should display password required error when password is empty', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should display password length error when password is too short', async () => {
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(passwordInput, 'short');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should display password complexity error when password lacks required characters', async () => {
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(passwordInput, 'password');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
    });

    it('should display confirm password required error when confirm password is empty', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    it('should display password mismatch error when passwords do not match', async () => {
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password456');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should display terms acceptance error when terms are not accepted', async () => {
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('You must accept the terms of service')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing in field', async () => {
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      // Trigger validation error
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      // Start typing
      await userEvent.type(nameInput, 'T');
      
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });

    it('should validate all fields before submission', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
        expect(screen.getByText('You must accept the terms of service')).toBeInTheDocument();
      });
      
      // Should not call API
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Password Strength Validation', () => {
    it('should show password strength indicator when password is entered', async () => {
      if (!authConfig.ui.showPasswordStrength) {
        return; // Skip if feature is disabled
      }
      
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await userEvent.type(passwordInput, 'weak');
      
      await waitFor(() => {
        expect(screen.getByText(/password strength/i)).toBeInTheDocument();
      });
    });

    it('should show weak strength for simple passwords', async () => {
      if (!authConfig.ui.showPasswordStrength) {
        return;
      }
      
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await userEvent.type(passwordInput, 'password');
      
      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument();
      });
    });

    it('should show strong strength for complex passwords', async () => {
      if (!authConfig.ui.showPasswordStrength) {
        return;
      }
      
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await userEvent.type(passwordInput, 'StrongP@ssw0rd123');
      
      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });

    it('should show password requirements checklist', async () => {
      if (!authConfig.ui.showPasswordStrength) {
        return;
      }
      
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await userEvent.type(passwordInput, 'test');
      
      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/one number/i)).toBeInTheDocument();
      });
    });

    it('should update requirements checklist as password changes', async () => {
      if (!authConfig.ui.showPasswordStrength) {
        return;
      }
      
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      // Type a password that meets some requirements
      await userEvent.type(passwordInput, 'Password1');
      
      await waitFor(() => {
        // Should show requirements are met
        const requirementItems = screen.getAllByRole('img', { hidden: true });
        expect(requirementItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Successful Registration Flow', () => {
    it('should successfully register with valid data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              name: 'New User',
              email: 'newuser@example.com',
              password: 'Password123',
              confirmPassword: 'Password123',
              acceptTerms: true,
            }),
          })
        );
      });
    });

    it('should redirect to dashboard after successful registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(authConfig.redirects.afterRegister);
      });
    });

    it('should use custom redirectTo prop if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderSignupForm({ redirectTo: '/custom-page' });
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
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
      
      renderSignupForm({ onSuccess });
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
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
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when email already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display validation error from backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Password is too weak' }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
      });
    });

    it('should call onError callback when provided', async () => {
      const onError = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      });
      
      renderSignupForm({ onError });
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('Email already exists'));
      });
    });

    it('should not redirect on registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many registration attempts. Please try again later.' }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many registration attempts/i)).toBeInTheDocument();
      });
    });

    it('should display fallback error message for unknown errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during registration', async () => {
      let resolveRegister: ((value: Response) => void) | undefined;
      const registerPromise = new Promise<Response>((resolve) => {
        resolveRegister = resolve;
      });
      
      mockFetch.mockReturnValueOnce(registerPromise as Promise<Response>);
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolveRegister?.({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      } as Response);
    });

    it('should disable form inputs during registration', async () => {
      let resolveRegister: ((value: Response) => void) | undefined;
      const registerPromise = new Promise<Response>((resolve) => {
        resolveRegister = resolve;
      });
      
      mockFetch.mockReturnValueOnce(registerPromise as Promise<Response>);
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const termsCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /create account/i }) as HTMLButtonElement;
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
        expect(termsCheckbox).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
      
      // Resolve the promise
      resolveRegister?.({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      } as Response);
    });

    it('should re-enable form after registration completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      });
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderSignupForm();
      
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('should mark invalid fields with aria-invalid', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with inputs', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i);
        const nameError = screen.getByText('Name is required');
        
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
        expect(nameError).toHaveAttribute('id', 'name-error');
      });
    });

    it('should announce errors to screen readers', async () => {
      renderSignupForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite');
        });
      });
    });

    it('should have accessible terms of service links', () => {
      renderSignupForm();
      
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      
      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(termsLink).toHaveAttribute('target', '_blank');
      expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
      
      expect(privacyLink).toHaveAttribute('href', '/privacy');
      expect(privacyLink).toHaveAttribute('target', '_blank');
      expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have proper autocomplete attributes', () => {
      renderSignupForm();
      
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('Form Interaction', () => {
    it('should allow toggling terms checkbox', async () => {
      renderSignupForm();
      
      const termsCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      expect(termsCheckbox.checked).toBe(false);
      
      await userEvent.click(termsCheckbox);
      
      await waitFor(() => {
        expect(termsCheckbox.checked).toBe(true);
      });
      
      await userEvent.click(termsCheckbox);
      
      await waitFor(() => {
        expect(termsCheckbox.checked).toBe(false);
      });
    });

    it('should accept valid name input', async () => {
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      
      await userEvent.type(nameInput, 'John Doe');
      
      expect(nameInput.value).toBe('John Doe');
    });

    it('should accept valid email input', async () => {
      renderSignupForm();
      
      const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
      
      await userEvent.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should accept valid password input', async () => {
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      
      await userEvent.type(passwordInput, 'Password123');
      
      expect(passwordInput.value).toBe('Password123');
    });

    it('should accept matching confirm password', async () => {
      renderSignupForm();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      
      expect(confirmPasswordInput.value).toBe('Password123');
    });

    it('should trim whitespace from name input', async () => {
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, '   ');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Social Login Buttons', () => {
    it('should render Google login button', () => {
      renderSignupForm();
      
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('should render GitHub login button', () => {
      renderSignupForm();
      
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    });

    it('should disable social login buttons during registration', async () => {
      let resolveRegister: ((value: Response) => void) | undefined;
      const registerPromise = new Promise<Response>((resolve) => {
        resolveRegister = resolve;
      });
      
      mockFetch.mockReturnValueOnce(registerPromise as Promise<Response>);
      
      renderSignupForm();
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmPasswordInput, 'Password123');
      await userEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const googleButton = screen.getByRole('button', { name: /google/i }) as HTMLButtonElement;
        const githubButton = screen.getByRole('button', { name: /github/i }) as HTMLButtonElement;
        
        expect(googleButton).toBeDisabled();
        expect(githubButton).toBeDisabled();
      });
      
      // Resolve the promise
      resolveRegister?.({
        ok: true,
        json: async () => ({ user: mockUser, accessToken: mockAccessToken }),
      } as Response);
    });
  });
});
