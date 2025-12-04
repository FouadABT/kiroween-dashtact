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
import { LandingThemeProvider } from '@/contexts/LandingThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MetadataProvider } from '@/contexts/MetadataContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { EcommerceSettingsProvider } from '@/contexts/EcommerceSettingsContext';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { FaviconUpdater } from './FaviconUpdater';

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
        <MessagingProvider>
          {children}
        </MessagingProvider>
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
 * - LandingThemeProvider for public pages (no auth required, uses localStorage)
 * - AuthProvider must be next (provides user data)
 * - BrandingProvider is independent and provides global branding (placed early for metadata)
 * - ThemeProvider needs user ID from AuthProvider
 * - NotificationProvider needs user ID from AuthProvider (placed after ThemeProvider)
 * - WidgetProvider is independent and placed after ThemeProvider
 * - MetadataProvider is independent and can be anywhere in the tree
 * - EcommerceSettingsProvider is independent and can be anywhere in the tree
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LandingThemeProvider defaultMode="auto" enableToggle>
        <AuthProvider>
          <CustomerAuthProvider>
            <BrandingProvider>
              <ThemeProviderWithAuth>
                <WidgetProvider>
                  <MetadataProvider>
                    <EcommerceSettingsProvider>
                      <FaviconUpdater />
                      {children}
                    </EcommerceSettingsProvider>
                  </MetadataProvider>
                </WidgetProvider>
              </ThemeProviderWithAuth>
            </BrandingProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </LandingThemeProvider>
    </QueryProvider>
  );
}
