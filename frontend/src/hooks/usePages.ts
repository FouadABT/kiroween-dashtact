import useSWR from 'swr';
import { ApiClient } from '@/lib/api';
import { 
  CustomPage, 
  CreatePageDto, 
  UpdatePageDto, 
  PageQueryDto,
  PaginatedPagesResponse 
} from '@/types/pages';

const fetcher = (url: string) => ApiClient.get<PaginatedPagesResponse>(url);

/**
 * Hook to fetch and manage pages with SWR caching
 */
export function usePages(filters?: PageQueryDto) {
  // Build query string
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const url = `/pages/admin${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedPagesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  /**
   * Create new page with optimistic update
   */
  const createPage = async (dto: CreatePageDto) => {
    const newPage = await ApiClient.post<CustomPage>('/pages', dto);
    
    // Revalidate list
    mutate();
    
    return newPage;
  };

  /**
   * Update page with optimistic update
   */
  const updatePage = async (id: string, dto: UpdatePageDto) => {
    // Optimistic update
    if (data) {
      const optimisticData: PaginatedPagesResponse = {
        ...data,
        data: data.data.map((page: CustomPage) => 
          page.id === id ? { ...page, ...dto, updatedAt: new Date().toISOString() } : page
        ),
      };
      mutate(optimisticData, false);
    }

    // Make API call
    const updated = await ApiClient.patch<CustomPage>(`/pages/${id}`, dto);

    // Revalidate
    mutate();

    return updated;
  };

  /**
   * Delete page
   */
  const deletePage = async (id: string) => {
    // Optimistic update
    if (data) {
      const optimisticData: PaginatedPagesResponse = {
        ...data,
        data: data.data.filter((page: CustomPage) => page.id !== id),
        total: data.total - 1,
      };
      mutate(optimisticData, false);
    }

    // Make API call
    await ApiClient.delete(`/pages/${id}`);

    // Revalidate
    mutate();
  };

  /**
   * Publish page
   */
  const publishPage = async (id: string) => {
    const published = await ApiClient.patch<CustomPage>(`/pages/${id}/publish`, {});
    mutate();
    return published;
  };

  /**
   * Unpublish page
   */
  const unpublishPage = async (id: string) => {
    const unpublished = await ApiClient.patch<CustomPage>(`/pages/${id}/unpublish`, {});
    mutate();
    return unpublished;
  };

  /**
   * Bulk publish pages
   */
  const bulkPublish = async (ids: string[]) => {
    await Promise.all(ids.map(id => publishPage(id)));
    mutate();
  };

  /**
   * Bulk unpublish pages
   */
  const bulkUnpublish = async (ids: string[]) => {
    await Promise.all(ids.map(id => unpublishPage(id)));
    mutate();
  };

  /**
   * Bulk delete pages
   */
  const bulkDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deletePage(id)));
    mutate();
  };

  return {
    pages: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    createPage,
    updatePage,
    deletePage,
    publishPage,
    unpublishPage,
    bulkPublish,
    bulkUnpublish,
    bulkDelete,
    mutate,
  };
}

/**
 * Hook to fetch a single page by ID
 */
export function usePage(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CustomPage>(
    id ? `/pages/admin/${id}` : null,
    (url: string) => ApiClient.get<CustomPage>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    page: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch page hierarchy
 */
export function usePageHierarchy() {
  const { data, error, isLoading, mutate } = useSWR<any[]>(
    '/pages/hierarchy',
    (url: string) => ApiClient.get<any[]>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds (hierarchy changes less frequently)
    }
  );

  return {
    hierarchy: data || [],
    isLoading,
    error,
    mutate,
  };
}
