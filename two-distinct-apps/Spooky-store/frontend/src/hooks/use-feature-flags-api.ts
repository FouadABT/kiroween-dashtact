'use client';

import { useEffect, useState, useCallback } from 'react';

interface FeatureStatus {
  key: string;
  name: string;
  isEnabled: boolean;
  category: string;
}

/**
 * Hook to fetch feature flags from the API
 * Useful for real-time feature flag updates without rebuilding
 */
export function useFeatureFlagsAPI() {
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/features`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }

      const data = await response.json();
      setFeatures(data.features || []);
      setEnabledFeatures(
        (data.features || [])
          .filter((f: FeatureStatus) => f.isEnabled)
          .map((f: FeatureStatus) => f.key)
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const isFeatureEnabled = useCallback(
    (featureKey: string): boolean => {
      return enabledFeatures.includes(featureKey);
    },
    [enabledFeatures]
  );

  const getFeature = useCallback(
    (featureKey: string): FeatureStatus | undefined => {
      return features.find(f => f.key === featureKey);
    },
    [features]
  );

  return {
    features,
    enabledFeatures,
    loading,
    error,
    isFeatureEnabled,
    getFeature,
    refetch: fetchFeatures,
  };
}
