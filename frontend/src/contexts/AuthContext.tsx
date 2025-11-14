"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  ReactNode 
} from "react";
import { UserProfile } from "@/types/user";
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  JwtPayload 
} from "@/types/auth";
import { authConfig } from "@/config/auth.config";
import { ApiClient } from "@/lib/api";

/**
 * Authentication Context Type
 * Defines the shape of the authentication context
 */
interface AuthContextType {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Permission checking utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Utility methods
  getUser: () => UserProfile | null;
  getPermissions: () => string[];
}

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Decode JWT token to extract payload
 */
function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  // Check if token expires in less than 30 seconds
  return Date.now() >= (payload.exp * 1000) - 30000;
}

/**
 * Get token expiry time in milliseconds
 */
function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Refs for token refresh
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Store access token in localStorage and state
   */
  const storeAccessToken = useCallback((token: string) => {
    setAccessToken(token);
    if (authConfig.storage.useLocalStorage) {
      localStorage.setItem(authConfig.storage.accessTokenKey, token);
    } else {
      sessionStorage.setItem(authConfig.storage.accessTokenKey, token);
    }
    ApiClient.setAccessToken(token);
  }, []);

  /**
   * Clear access token from storage and state
   */
  const clearAccessToken = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem(authConfig.storage.accessTokenKey);
    sessionStorage.removeItem(authConfig.storage.accessTokenKey);
    ApiClient.setAccessToken(null);
  }, []);

  /**
   * Get stored access token
   */
  const getStoredToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    if (authConfig.storage.useLocalStorage) {
      return localStorage.getItem(authConfig.storage.accessTokenKey);
    }
    return sessionStorage.getItem(authConfig.storage.accessTokenKey);
  }, []);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((token: string) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!authConfig.tokenRefresh.enabled) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    // Calculate when to refresh (before expiry)
    const refreshTime = expiry - Date.now() - (authConfig.tokenRefresh.refreshBeforeExpiry * 1000);
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        // Prevent concurrent refresh attempts
        if (isRefreshingRef.current) return;
        
        isRefreshingRef.current = true;

        try {
          // Get refresh token from localStorage
          const storedRefreshToken = localStorage.getItem('refreshToken');
          
          if (!storedRefreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await fetch(
            `${authConfig.api.baseUrl}${authConfig.endpoints.refresh}`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken: storedRefreshToken }),
            }
          );

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          // Store new access token
          storeAccessToken(data.accessToken);
          
          // Note: Backend does not rotate refresh tokens
          // The existing refresh token in localStorage remains valid
          
          // Schedule next refresh recursively
          scheduleTokenRefresh(data.accessToken);
          
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearAccessToken();
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          isRefreshingRef.current = false;
        }
      }, refreshTime);
    }
  }, [storeAccessToken, clearAccessToken]);

  /**
   * Refresh access token manually
   */
  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;

    try {
      // Get refresh token from localStorage
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.refresh}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Store new access token
      storeAccessToken(data.accessToken);
      
      // Note: Backend does not rotate refresh tokens
      // The existing refresh token in localStorage remains valid
      
      // Schedule next refresh
      scheduleTokenRefresh(data.accessToken);
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAccessToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [storeAccessToken, clearAccessToken, scheduleTokenRefresh]);



  /**
   * Load user profile from token
   */
  const loadUserFromToken = useCallback(async (token: string) => {
    try {
      console.log('[AuthContext] Loading user from token...');
      const payload = decodeToken(token);
      if (!payload) {
        throw new Error('Invalid token');
      }

      // Fetch full user profile from API
      console.log('[AuthContext] Fetching user profile from API...');
      const response = await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.profile}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }

      const userProfile: UserProfile = await response.json();
      console.log('[AuthContext] User profile loaded:', {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        avatarUrl: userProfile.avatarUrl,
        hasAvatar: !!userProfile.avatarUrl
      });
      
      setUser(userProfile);
      setIsAuthenticated(true);
      
      // Schedule token refresh
      scheduleTokenRefresh(token);
      
    } catch (error) {
      console.error('[AuthContext] Failed to load user:', error);
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [clearAccessToken, scheduleTokenRefresh]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;

    const initAuth = async () => {
      if (!isMounted || hasInitialized) return;
      hasInitialized = true;
      
      console.log('[AuthContext] Initializing auth...');
      setIsLoading(true);
      
      try {
        const token = getStoredToken();
        
        if (token && !isTokenExpired(token)) {
          console.log('[AuthContext] Valid token found, loading user...');
          ApiClient.setAccessToken(token);
          await loadUserFromToken(token);
        } else if (token) {
          console.log('[AuthContext] Token expired, refreshing...');
          // Token expired, try to refresh
          await refreshToken();
        } else {
          console.log('[AuthContext] No token found');
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
      } finally {
        if (isMounted) {
          console.log('[AuthContext] Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      console.log('[AuthContext] Cleaning up...');
      isMounted = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [getStoredToken, loadUserFromToken, refreshToken]);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      console.log('[AuthContext] Attempting login for:', credentials.email);
      const response = await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.login}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for refresh token
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      console.log('[AuthContext] Login response received:', {
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email,
        userName: data.user?.name,
        avatarUrl: data.user?.avatarUrl,
        hasAvatar: !!data.user?.avatarUrl,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken
      });
      
      // Store access token
      storeAccessToken(data.accessToken);
      
      // Store refresh token
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Set user
      console.log('[AuthContext] Setting user state with avatar:', data.user?.avatarUrl);
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Schedule token refresh
      scheduleTokenRefresh(data.accessToken);
      
      console.log('[AuthContext] Login complete, user authenticated');
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeAccessToken, scheduleTokenRefresh]);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.register}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store access token
      storeAccessToken(authResponse.accessToken);
      
      // Store refresh token
      if (authResponse.refreshToken) {
        localStorage.setItem('refreshToken', authResponse.refreshToken);
      }
      
      // Set user
      setUser(authResponse.user);
      setIsAuthenticated(true);
      
      // Schedule token refresh
      scheduleTokenRefresh(authResponse.accessToken);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeAccessToken, scheduleTokenRefresh]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Get refresh token for logout
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      // Call logout endpoint to invalidate refresh token
      await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.logout}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      clearAccessToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }
  }, [accessToken, clearAccessToken]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // Use the permissions array from the user profile
    const permissions = user.permissions || [];
    
    // Check for super admin permission
    if (permissions.includes('*:*')) return true;
    
    // Check for specific permission
    if (permissions.includes(permission)) return true;
    
    // Check for wildcard resource permission (e.g., users:*)
    const [resource] = permission.split(':');
    if (permissions.includes(`${resource}:*`)) return true;
    
    return false;
  }, [user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.name === role;
  }, [user]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  /**
   * Refresh user profile data
   */
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      console.log('[AuthContext] Cannot refresh user - not authenticated or no token');
      return;
    }
    
    try {
      console.log('[AuthContext] Refreshing user profile...');
      const response = await fetch(
        `${authConfig.api.baseUrl}${authConfig.endpoints.profile}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh user profile');
      }

      const userProfile: UserProfile = await response.json();
      console.log('[AuthContext] User profile refreshed:', {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        avatarUrl: userProfile.avatarUrl,
        hasAvatar: !!userProfile.avatarUrl,
        previousAvatar: user?.avatarUrl,
        avatarChanged: user?.avatarUrl !== userProfile.avatarUrl
      });
      
      setUser(userProfile);
      console.log('[AuthContext] User state updated with new profile data');
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  }, [isAuthenticated, accessToken, user?.avatarUrl]);

  /**
   * Get current user
   */
  const getUser = useCallback((): UserProfile | null => {
    return user;
  }, [user]);

  /**
   * Get user permissions
   */
  const getPermissions = useCallback((): string[] => {
    if (!user) return [];
    return user.permissions || [];
  }, [user]);

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    refreshUser,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    getUser,
    getPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}