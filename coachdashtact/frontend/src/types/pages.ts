/**
 * Custom Pages Types
 * Synced with backend/prisma/schema.prisma CustomPage model
 */

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  status: PageStatus;
  visibility: PageVisibility;
  parentPageId?: string | null;
  showInNavigation: boolean;
  displayOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  customCssClass?: string | null;
  templateKey?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  parentPage?: CustomPage | null;
  childPages?: CustomPage[];
}

export interface CreatePageDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PageStatus;
  visibility?: PageVisibility;
  parentPageId?: string;
  showInNavigation?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customCssClass?: string;
  templateKey?: string;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export interface PageQueryDto {
  status?: PageStatus;
  visibility?: PageVisibility;
  parentPageId?: string;
  showInNavigation?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPagesResponse {
  data: CustomPage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PageHierarchyNode {
  id: string;
  title: string;
  slug: string;
  children: PageHierarchyNode[];
}

export interface ValidateSlugDto {
  slug: string;
  excludeId?: string;
}

export interface ValidateSlugResponse {
  isValid: boolean;
  message: string;
}

export interface PageOrderUpdate {
  id: string;
  order: number;
}

export interface ReorderPagesDto {
  updates: PageOrderUpdate[];
}

export interface PageRedirect {
  id: string;
  fromSlug: string;
  toPageId: string;
  redirectType: number;
  createdAt: string;
}
