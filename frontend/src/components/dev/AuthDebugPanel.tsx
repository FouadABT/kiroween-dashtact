"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authConfig } from "@/config/auth.config";

/**
 * Auth Debug Panel Props
 */
interface AuthDebugPanelProps {
  /** Position of the debug panel */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Auth Debug Panel Component
 * 
 * Development-only tool for debugging authentication state.
 * Displays current user info, permissions, token status, and provides
 * quick actions for testing authentication flows.
 * 
 * Only renders in development mode.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * {process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
 * ```
 */
export function AuthDebugPanel({ position = 'bottom-right' }: AuthDebugPanelProps) {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    hasPermission,
    getPermissions,
    logout,
    refreshToken,
  } = useAuth();

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [testPermission, setTestPermission] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState<string>('');
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');

  /**
   * Get stored access token
   */
  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    if (authConfig.storage.useLocalStorage) {
      return localStorage.getItem(authConfig.storage.accessTokenKey);
    }
    return sessionStorage.getItem(authConfig.storage.accessTokenKey);
  };

  /**
   * Decode JWT token to extract payload
   */
  const decodeToken = (token: string): { exp?: number } | null => {
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
    } catch {
      return null;
    }
  };

  /**
   * Clear all tokens
   */
  const handleClearTokens = () => {
    localStorage.removeItem(authConfig.storage.accessTokenKey);
    sessionStorage.removeItem(authConfig.storage.accessTokenKey);
    window.location.reload();
  };

  /**
   * Force token refresh
   */
  const handleForceRefresh = async () => {
    try {
      await refreshToken();
      alert('Token refreshed successfully!');
    } catch (error) {
      alert('Token refresh failed: ' + (error as Error).message);
    }
  };

  /**
   * Update token expiry information
   */
  useEffect(() => {
    const updateTokenInfo = () => {
      const token = getStoredToken();
      if (!token) {
        setTokenExpiry('No token');
        setTimeUntilExpiry('N/A');
        return;
      }

      const payload = decodeToken(token);
      if (!payload || !payload.exp) {
        setTokenExpiry('Invalid token');
        setTimeUntilExpiry('N/A');
        return;
      }

      const expiryTime = new Date(payload.exp * 1000);
      setTokenExpiry(expiryTime.toLocaleTimeString());

      const now = Date.now();
      const expiry = payload.exp * 1000;
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeUntilExpiry('Expired');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilExpiry(`${minutes}m ${seconds}s`);
      }
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 max-w-md`}
      style={{ fontFamily: 'monospace' }}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          title="Open Auth Debug Panel"
        >
          🔐 Auth Debug
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <h3 className="font-bold text-sm flex items-center gap-2">
              🔐 Auth Debug Panel
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Minimize"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[600px] overflow-y-auto text-xs space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="text-yellow-400">
                ⏳ Loading authentication state...
              </div>
            )}

            {/* Authentication Status */}
            <div>
              <div className="text-gray-400 mb-1">Status:</div>
              <div className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
              </div>
            </div>

            {/* User Info */}
            {user && (
              <>
                <div>
                  <div className="text-gray-400 mb-1">User:</div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div><span className="text-gray-500">ID:</span> {user.id}</div>
                    <div><span className="text-gray-500">Email:</span> {user.email}</div>
                    <div><span className="text-gray-500">Name:</span> {user.name}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Role:</div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-blue-400">{user.role?.name || 'No role'}</div>
                  </div>
                </div>
              </>
            )}

            {/* Token Info */}
            <div>
              <div className="text-gray-400 mb-1">Access Token:</div>
              <div className="bg-gray-800 p-2 rounded space-y-1">
                <div>
                  <span className="text-gray-500">Expires:</span> {tokenExpiry}
                </div>
                <div>
                  <span className="text-gray-500">Time left:</span>{' '}
                  <span className={timeUntilExpiry === 'Expired' ? 'text-red-400' : 'text-green-400'}>
                    {timeUntilExpiry}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {user && (
              <div>
                <div className="text-gray-400 mb-1">Permissions ({getPermissions().length}):</div>
                <div className="bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
                  {getPermissions().length > 0 ? (
                    <ul className="space-y-1">
                      {getPermissions().map((perm) => (
                        <li key={perm} className="text-purple-400">
                          • {perm}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No permissions</div>
                  )}
                </div>
              </div>
            )}

            {/* Permission Tester */}
            {user && (
              <div>
                <div className="text-gray-400 mb-1">Test Permission:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPermission}
                    onChange={(e) => setTestPermission(e.target.value)}
                    placeholder="e.g., users:write"
                    className="flex-1 bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-xs"
                  />
                  <div className="flex items-center">
                    {testPermission && (
                      <span className={hasPermission(testPermission) ? 'text-green-400' : 'text-red-400'}>
                        {hasPermission(testPermission) ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>
                {testPermission && (
                  <div className="mt-1 text-xs">
                    {hasPermission(testPermission) ? (
                      <span className="text-green-400">✓ User has this permission</span>
                    ) : (
                      <span className="text-red-400">✗ User lacks this permission</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <div className="text-gray-400 mb-2">Quick Actions:</div>
              <div className="space-y-2">
                {isAuthenticated && (
                  <>
                    <button
                      onClick={handleForceRefresh}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors text-xs"
                    >
                      🔄 Force Refresh Token
                    </button>
                    <button
                      onClick={() => logout()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors text-xs"
                    >
                      🚪 Logout
                    </button>
                  </>
                )}
                <button
                  onClick={handleClearTokens}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded transition-colors text-xs"
                >
                  🗑️ Clear All Tokens
                </button>
              </div>
            </div>

            {/* Config Info */}
            <div>
              <div className="text-gray-400 mb-1">Configuration:</div>
              <div className="bg-gray-800 p-2 rounded text-xs space-y-1">
                <div>
                  <span className="text-gray-500">API:</span> {authConfig.api.baseUrl}
                </div>
                <div>
                  <span className="text-gray-500">Storage:</span>{' '}
                  {authConfig.storage.useLocalStorage ? 'localStorage' : 'sessionStorage'}
                </div>
                <div>
                  <span className="text-gray-500">Auto Refresh:</span>{' '}
                  {authConfig.tokenRefresh.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthDebugPanel;
