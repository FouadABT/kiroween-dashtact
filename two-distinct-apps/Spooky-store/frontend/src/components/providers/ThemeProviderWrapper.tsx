'use client';

/**
 * Theme Provider Wrapper
 * Wraps ThemeProvider with user context to load user-specific settings
 */

import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <ThemeProvider 
      defaultTheme="system" 
      storageKey="theme-mode"
      userId={user?.id}
    >
      {children}
    </ThemeProvider>
  );
}
