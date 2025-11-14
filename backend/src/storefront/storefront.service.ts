import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';
import {
  StorefrontQueryDto,
  SortBy,
  StorefrontProductResponseDto,
  StorefrontProductListResponseDto,
  StorefrontCategoryResponseDto,
} from './dto';

@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get published products for public storefront with filtering and pagination
   */
  async getPublicProducts(
    query: StorefrontQueryDto,
  ): Promise<StorefrontProductListResponseDto> {
    const {
      search,
      categorySlug,
      tagSlug,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = SortBy.NEWEST,
      page = 1,
      limit = 24,
    } = query;

    // Build where clause - only PUBLISHED and visible products
    const where: any = {
      status: ProductStatus.PUBLISHED,
      isVisible: true,
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug },
      };
    }

    // Tag filter
    if (tagSlug) {
      where.tags = {
        some: { slug: tagSlug },
      };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) {
        where.basePrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.basePrice.lte = maxPrice;
      }
    }

    // Featured filter
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case SortBy.PRICE_ASC:
        orderBy = { basePrice: 'asc' };
        break;
      case SortBy.PRICE_DESC:
        orderBy = { basePrice: 'desc' };
        break;
      case SortBy.NAME_ASC:
        orderBy = { name: 'asc' };
        break;
      case SortBy.NAME_DESC:
        orderBy = { name: 'desc' };
        break;
      case SortBy.OLDEST:
        orderBy = { publishedAt: 'asc' };
        break;
      case SortBy.NEWEST:
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const productsWithPrices = products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
    }));

    return {
      products: productsWithPrices as StorefrontProductResponseDto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get product by slug for product detail page
   */
  async getProductBySlug(slug: string): Promise<StorefrontProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            attributes: true,
            price: true,
            isActive: true,
            inventory: {
              select: {
                quantity: true,
                reserved: true,
                available: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Only return published and visible products
    if (product.status !== ProductStatus.PUBLISHED || !product.isVisible) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    } as StorefrontProductResponseDto;
  }

  /**
   * Get products by category slug
   */
  async getProductsByCategory(
    categorySlug: string,
    query: StorefrontQueryDto,
  ): Promise<StorefrontProductListResponseDto> {
    // Verify category exists
    const category = await this.prisma.productCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with slug ${categorySlug} not found`,
      );
    }

    // Use getPublicProducts with category filter
    return this.getPublicProducts({
      ...query,
      categorySlug,
    });
  }

  /**
   * Search products by query
   */
  async searchProducts(
    searchQuery: string,
    query: StorefrontQueryDto,
  ): Promise<StorefrontProductListResponseDto> {
    return this.getPublicProducts({
      ...query,
      search: searchQuery,
    });
  }

  /**
   * Get related products based on category
   */
  async getRelatedProducts(
    productId: string,
    limit: number = 6,
  ): Promise<StorefrontProductResponseDto[]> {
    // Get the product with its categories
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: { id: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get category IDs
    const categoryIds = product.categories.map((c) => c.id);

    if (categoryIds.length === 0) {
      return [];
    }

    // Find related products in the same categories
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        isVisible: true,
        id: { not: productId }, // Exclude current product
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return relatedProducts.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    })) as StorefrontProductResponseDto[];
  }

  /**
   * Get all categories with product counts
   */
  async getCategories(): Promise<StorefrontCategoryResponseDto[]> {
    const categories = await this.prisma.productCategory.findMany({
      where: {
        isVisible: true,
        parentId: null, // Only root categories
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: {
              select: {
                products: {
                  where: {
                    status: ProductStatus.PUBLISHED,
                    isVisible: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            products: {
              where: {
                status: ProductStatus.PUBLISHED,
                isVisible: true,
              },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        productCount: child._count.products,
      })),
    }));
  }
}
