import { ProductStatus } from '@prisma/client';

export class ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  featuredImage?: string;
  images: string[];
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    sku?: string;
    attributes: Record<string, any>;
    price?: number;
    isActive: boolean;
  }>;
  variantCount?: number;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class VariantResponseDto {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  attributes: Record<string, any>;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  inventory?: {
    quantity: number;
    reserved: number;
    available: number;
  };
}
