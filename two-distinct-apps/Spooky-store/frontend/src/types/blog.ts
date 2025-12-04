/**
 * Blog Type Definitions
 * 
 * TypeScript interfaces for blog posts, categories, and tags.
 * These types match the backend Prisma schema and DTOs.
 */

/**
 * Blog post status enum
 */
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Blog post author (subset of User)
 */
export interface BlogAuthor {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Blog category
 */
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

/**
 * Blog tag
 */
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

/**
 * Blog post (full)
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: PostStatus;
  publishedAt: string | null;
  
  // Author (optional for SEO flexibility)
  authorId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  author?: BlogAuthor | null;
  
  // Relations
  categories: BlogCategory[];
  tags: BlogTag[];
  
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Create blog post DTO
 */
export interface CreateBlogPostDto {
  title: string;
  slug?: string;  // Optional - auto-generated from title if not provided
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Update blog post DTO
 */
export interface UpdateBlogPostDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Blog query parameters
 */
export interface BlogQueryDto {
  page?: number;
  limit?: number;
  status?: PostStatus;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Blog post list response
 */
export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Create blog category DTO
 */
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
}

/**
 * Update blog category DTO
 */
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
}

/**
 * Create blog tag DTO
 */
export interface CreateTagDto {
  name: string;
  slug?: string;
}

/**
 * Update blog tag DTO
 */
export interface UpdateTagDto {
  name?: string;
  slug?: string;
}

/**
 * API response wrapper
 */
export interface BlogApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
