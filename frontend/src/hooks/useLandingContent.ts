import useSWR from 'swr';
import { ApiClient } from '@/lib/api';
import { LandingPageContent, UpdateLandingPageContentDto } from '@/types/landing-page';

const fetcher = (url: string) => ApiClient.get<LandingPageContent>(url);

/**
 * Hook to fetch and manage landing page content with SWR caching
 */
export function useLandingContent() {
  const { data, error, isLoading, mutate } = useSWR<LandingPageContent>(
    '/landing/admin',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  /**
   * Update landing page content with optimistic updates
   */
  const updateContent = async (dto: UpdateLandingPageContentDto) => {
    // Optimistic update
    if (data) {
      mutate(
        {
          ...data,
          sections: dto.sections || data.sections,
          settings: dto.settings || data.settings,
          updatedAt: new Date().toISOString(),
        },
        false
      );
    }

    // Make API call
    const updated = await ApiClient.patch<LandingPageContent>('/landing', dto);

    // Revalidate
    mutate(updated);

    return updated;
  };

  /**
   * Reset to defaults
   */
  const resetToDefaults = async () => {
    const reset = await ApiClient.post<LandingPageContent>('/landing/reset', {});
    mutate(reset);
    return reset;
  };

  return {
    content: data,
    isLoading,
    error,
    updateContent,
    resetToDefaults,
    mutate,
  };
}
