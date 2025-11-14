export interface StorefrontProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  sku: string | null;
  featuredImage: string | null;
  images: string[];
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  variants?: {
    id: string;
    name: string;
    sku: string | null;
    attributes: any;
    price: number | null;
    isActive: boolean;
    inventory?: {
      quantity: number;
      reserved: number;
      available: number;
    };
  }[];
}

export interface StorefrontProductListResponseDto {
  products: StorefrontProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StorefrontCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
  children?: StorefrontCategoryResponseDto[];
}
