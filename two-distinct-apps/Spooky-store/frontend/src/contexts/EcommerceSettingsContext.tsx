'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EcommerceSettings, UpdateEcommerceSettingsDto } from '@/types/ecommerce';
import { ApiClient } from '@/lib/api';

interface EcommerceSettingsContextType {
  settings: EcommerceSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (id: string, data: UpdateEcommerceSettingsDto) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const EcommerceSettingsContext = createContext<EcommerceSettingsContextType | undefined>(
  undefined,
);

const CACHE_KEY = 'ecommerce-settings';
const CACHE_TTL = 3600000; // 1 hour

interface CachedSettings {
  data: EcommerceSettings;
  timestamp: number;
}

export function EcommerceSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EcommerceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load settings from cache
   */
  const loadFromCache = useCallback((): EcommerceSettings | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp }: CachedSettings = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_TTL) {
        return data;
      }

      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.error('Error loading settings from cache:', err);
      return null;
    }
  }, []);

  /**
   * Save settings to cache
   */
  const saveToCache = useCallback((data: EcommerceSettings) => {
    if (typeof window === 'undefined') return;

    try {
      const cached: CachedSettings = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (err) {
      console.error('Error saving settings to cache:', err);
    }
  }, []);

  /**
   * Fetch settings from API
   */
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedSettings = loadFromCache();
      if (cachedSettings) {
        setSettings(cachedSettings);
        setIsLoading(false);
        // Fetch in background to update cache
        fetchFromApi();
        return;
      }

      await fetchFromApi();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
      console.error('Error fetching e-commerce settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache]);

  /**
   * Fetch settings from API (internal)
   */
  const fetchFromApi = async () => {
    const response = await ApiClient.get<EcommerceSettings>('/ecommerce-settings/global');
    setSettings(response);
    saveToCache(response);
  };

  /**
   * Update settings
   */
  const updateSettings = useCallback(
    async (id: string, data: UpdateEcommerceSettingsDto) => {
      try {
        setError(null);
        const updated = await ApiClient.patch<EcommerceSettings>(
          `/ecommerce-settings/${id}`,
          data,
        );
        setSettings(updated);
        saveToCache(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update settings';
        setError(message);
        throw err;
      }
    },
    [saveToCache],
  );

  /**
   * Refresh settings from API
   */
  const refreshSettings = useCallback(async () => {
    // Clear cache and fetch fresh data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    await fetchSettings();
  }, [fetchSettings]);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value: EcommerceSettingsContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    refreshSettings,
  };

  return (
    <EcommerceSettingsContext.Provider value={value}>
      {children}
    </EcommerceSettingsContext.Provider>
  );
}

/**
 * Hook to use e-commerce settings context
 */
export function useEcommerceSettings() {
  const context = useContext(EcommerceSettingsContext);
  if (context === undefined) {
    throw new Error('useEcommerceSettings must be used within EcommerceSettingsProvider');
  }
  return context;
}

/**
 * Helper function to format currency
 */
export function formatCurrency(amount: number, settings: EcommerceSettings | null): string {
  if (!settings) return `$${amount.toFixed(2)}`;
  return `${settings.currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Helper function to calculate tax
 */
export function calculateTax(amount: number, settings: EcommerceSettings | null): number {
  if (!settings) return 0;
  return (amount * settings.taxRate) / 100;
}

/**
 * Helper function to check if inventory tracking is enabled
 */
export function isInventoryTrackingEnabled(settings: EcommerceSettings | null): boolean {
  return settings?.trackInventory ?? true;
}

/**
 * Helper function to check if customer portal is enabled
 */
export function isPortalEnabled(settings: EcommerceSettings | null): boolean {
  return settings?.portalEnabled ?? true;
}
