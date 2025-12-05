'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAccount, CustomerAuthResponse, RegisterCustomerDto, LoginCustomerDto } from '@/types/storefront';

interface CustomerAuthContextType {
  user: CustomerAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCustomerDto, sessionId?: string) => Promise<void>;
  register: (data: RegisterCustomerDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ACCESS_TOKEN_KEY = 'customer_access_token';
const REFRESH_TOKEN_KEY = 'customer_refresh_token';
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (tokens expire in 15)

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/customer-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        // Token invalid, clear it
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCustomerDto) => {
    try {
      const response = await fetch(`${API_URL}/customer-auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result: CustomerAuthResponse = await response.json();

      // Store tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);

      // Set user
      setUser(result.customer);

      // Redirect to account dashboard
      router.push('/account');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (credentials: LoginCustomerDto, sessionId?: string) => {
    try {
      const response = await fetch(`${API_URL}/customer-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          sessionId, // For cart merging
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result: CustomerAuthResponse = await response.json();

      // Store tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);

      // Set user
      setUser(result.customer);

      // Redirect to account dashboard or previous page
      const returnUrl = sessionStorage.getItem('returnUrl') || '/account';
      sessionStorage.removeItem('returnUrl');
      router.push(returnUrl);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        await fetch(`${API_URL}/customer-auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      router.push('/account/login');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshTokenValue) return;

      const response = await fetch(`${API_URL}/customer-auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      } else {
        // Refresh failed, logout
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/customer-auth/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedProfile = await response.json();
      setUser(updatedProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
