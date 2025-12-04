'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrandingApi } from '@/lib/api/branding';
import type { BrandSettings, UpdateBrandSettingsDto } from '@/types/branding';

interface BrandingContextValue {
  brandSettings: BrandSettings | null;
  loading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
  updateBranding: (data: UpdateBrandSettingsDto) => Promise<void>;
  uploadLogo: (file: File, isDark?: boolean) => Promise<string>;
  uploadFavicon: (file: File) => Promise<string>;
  resetBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

const CACHE_KEY = 'brand_settings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedBrandSettings {
  data: BrandSettings;
  timestamp: number;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from cache
  const loadFromCache = useCallback((): BrandSettings | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp }: CachedBrandSettings = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }

      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.error('Failed to load branding from cache:', err);
      return null;
    }
  }, []);

  // Save to cache
  const saveToCache = useCallback((data: BrandSettings) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached: CachedBrandSettings = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (err) {
      console.error('Failed to save branding to cache:', err);
    }
  }, []);

  // Fetch brand settings
  const fetchBrandSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await BrandingApi.getBrandSettings();
      setBrandSettings(data);
      saveToCache(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load brand settings';
      setError(errorMessage);
      console.error('Failed to fetch brand settings:', err);
    } finally {
      setLoading(false);
    }
  }, [saveToCache]);

  // Refresh branding
  const refreshBranding = useCallback(async () => {
    await fetchBrandSettings();
  }, [fetchBrandSettings]);

  // Update branding
  const updateBranding = useCallback(async (data: UpdateBrandSettingsDto) => {
    try {
      setError(null);
      const updated = await BrandingApi.updateBrandSettings(data);
      setBrandSettings(updated);
      saveToCache(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand settings';
      setError(errorMessage);
      throw err;
    }
  }, [saveToCache]);

  // Upload logo
  const uploadLogo = useCallback(async (file: File, isDark = false): Promise<string> => {
    try {
      setError(null);
      const response = isDark 
        ? await BrandingApi.uploadLogoDark(file)
        : await BrandingApi.uploadLogo(file);
      
      // Refresh settings to get updated URLs
      await fetchBrandSettings();
      
      return response.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBrandSettings]);

  // Upload favicon
  const uploadFavicon = useCallback(async (file: File): Promise<string> => {
    try {
      setError(null);
      const response = await BrandingApi.uploadFavicon(file);
      
      // Refresh settings to get updated URL
      await fetchBrandSettings();
      
      return response.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload favicon';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBrandSettings]);

  // Reset branding
  const resetBranding = useCallback(async () => {
    try {
      setError(null);
      const defaultSettings = await BrandingApi.resetBranding();
      setBrandSettings(defaultSettings);
      saveToCache(defaultSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset branding';
      setError(errorMessage);
      throw err;
    }
  }, [saveToCache]);

  // Initialize on mount
  useEffect(() => {
    // Try to load from cache first
    const cached = loadFromCache();
    if (cached) {
      setBrandSettings(cached);
      setLoading(false);
    }

    // Fetch fresh data
    fetchBrandSettings();
  }, [fetchBrandSettings, loadFromCache]);

  const value: BrandingContextValue = {
    brandSettings,
    loading,
    error,
    refreshBranding,
    updateBranding,
    uploadLogo,
    uploadFavicon,
    resetBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBrandingContext() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBrandingContext must be used within a BrandingProvider');
  }
  return context;
}
