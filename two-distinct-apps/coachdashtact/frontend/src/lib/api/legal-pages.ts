/**
 * Legal Pages API Client
 * 
 * API client methods for legal pages management (Terms of Service, Privacy Policy).
 */

import { ApiClient } from '@/lib/api';
import type {
  LegalPage,
  UpdateLegalPageDto,
} from '@/types/legal-pages';

export const legalPagesApi = {
  /**
   * Get legal page by type (terms or privacy)
   * Public endpoint - no authentication required
   * @param pageType - 'terms' or 'privacy'
   * @returns Legal page content or null if not found
   */
  async getLegalPage(pageType: 'terms' | 'privacy'): Promise<LegalPage | null> {
    try {
      return await ApiClient.get<LegalPage>(`/legal-pages/${pageType}`);
    } catch (error) {
      // Return null if page not found (404)
      if (error instanceof Error && 'statusCode' in error && (error as any).statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update legal page by type (terms or privacy)
   * Requires authentication and settings.manage permission
   * @param pageType - 'terms' or 'privacy'
   * @param content - HTML content to update
   * @returns Updated legal page
   */
  async updateLegalPage(pageType: 'terms' | 'privacy', content: string): Promise<LegalPage> {
    const data: UpdateLegalPageDto = { content };
    return ApiClient.put<LegalPage>(`/legal-pages/${pageType}`, data);
  },
};
