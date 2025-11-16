'use client';

/**
 * Providers Component
 * Wraps all context providers in the correct order
 * 
 * Provider hierarchy:
 * 1. AuthProvider - Authentication state (required by ThemeProvider and NotificationProvider)
 * 2. ThemeProvider - Theme and design system state (requires user ID from AuthProvider)
 * 3. NotificationProvider - Notification state and WebSocket (requires user ID from AuthProvider)
 * 4. WidgetProvider - Widget layout state (independent, for dashboard customization)
 * 5. MetadataProvider - Page metadata and breadcrumb state (independent)
 * 6. EcommerceSettingsProvider - Ecommerce settings state (independent)
 */

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MetadataProvider } from '@/contexts/MetadataContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { EcommerceSettingsProvider } from '@/contexts/EcommerceSettingsContext';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { QueryProvider } from '@/providers/QueryProvider';

/**
 * Inner component that has access to auth context
 * and can pass userId to ThemeProvider
 */
function ThemeProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <ThemeProvider 
      defaultTheme="system" 
      storageKey="theme-mode"
      userId={user?.id}
    >
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  );
}

/**
 * Main Providers component
 * Wraps children with all necessary providers
 * 
 * Order matters:
 * - QueryProvider should be outermost (provides React Query client)
 * - AuthProvider must be next (provides user data)
 * - ThemeProvider needs user ID from AuthProvider
 * - NotificationProvider needs user ID from AuthProvider (placed after ThemeProvider)
 * - WidgetProvider is independent and placed after ThemeProvider
 * - MetadataProvider is independent and can be anywhere in the tree
 * - EcommerceSettingsProvider is independent and can be anywhere in the tree
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CustomerAuthProvider>
          <ThemeProviderWithAuth>
            <WidgetProvider>
              <MetadataProvider>
                <EcommerceSettingsProvider>
                  {children}
                </EcommerceSettingsProvider>
              </MetadataProvider>
            </WidgetProvider>
          </ThemeProviderWithAuth>
        </CustomerAuthProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
