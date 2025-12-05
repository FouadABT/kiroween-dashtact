/**
 * Legal Pages Types
 * 
 * TypeScript interfaces for legal pages management (Terms of Service, Privacy Policy).
 */

export type LegalPageType = 'TERMS' | 'PRIVACY';

export interface LegalPage {
  id: string;
  pageType: LegalPageType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for API requests

export interface UpdateLegalPageDto {
  content: string;
}
