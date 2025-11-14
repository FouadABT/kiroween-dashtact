import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  ProductQueryDto,
  BulkStatusUpdateDto,
  ProductResponseDto,
  ProductListResponseDto,
  VariantResponseDto,
} from './dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a URL-friendly slug from a string
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure slug is unique by appending a number if needed
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Find all products with filtering and pagination
   */
  async findAll(query: ProductQueryDto): Promise<ProductListResponseDto> {
    const {
      search,
      categoryId,
      tagId,
      status,
      isFeatured,
      isVisible,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { id: categoryId },
      };
    }

    if (tagId) {
      where.tags = {
        some: { id: tagId },
      };
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isVisible !== undefined) {
      where.isVisible = isVisible;
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
        _count: {
          select: { variants: true },
        },
      },
    });

    const productsWithCount = products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      cost: product.cost ? Number(product.cost) : undefined,
      variantCount: product._count.variants,
    }));

    return {
      products: productsWithCount as ProductResponseDto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one product by ID with variants
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
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
          select: {
            id: true,
            name: true,
            sku: true,
            attributes: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      cost: product.cost ? Number(product.cost) : undefined,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : undefined,
      })),
    } as ProductResponseDto;
  }

  /**
   * Find product by slug (for public access)
   */
  async findBySlug(slug: string): Promise<ProductResponseDto> {
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

    // Only return published products for public access
    if (product.status !== ProductStatus.PUBLISHED || !product.isVisible) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      cost: product.cost ? Number(product.cost) : undefined,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : undefined,
      })),
    } as ProductResponseDto;
  }

  /**
   * Create a new product with slug generation
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    // Generate slug from name
    const baseSlug = this.generateSlug(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Check if SKU already exists
    if (dto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existing) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Set publishedAt if status is PUBLISHED
    const publishedAt =
      dto.status === ProductStatus.PUBLISHED ? new Date() : undefined;

    // Create product
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        basePrice: dto.basePrice,
        compareAtPrice: dto.compareAtPrice,
        cost: dto.cost,
        sku: dto.sku,
        barcode: dto.barcode,
        featuredImage: dto.featuredImage,
        images: dto.images || [],
        status: dto.status || ProductStatus.DRAFT,
        isVisible: dto.isVisible ?? true,
        isFeatured: dto.isFeatured ?? false,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        publishedAt,
        categories: dto.categoryIds
          ? {
              connect: dto.categoryIds.map((id) => ({ id })),
            }
          : undefined,
        tags: dto.tagIds
          ? {
              connect: dto.tagIds.map((id) => ({ id })),
            }
          : undefined,
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

    return {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      cost: product.cost ? Number(product.cost) : undefined,
    } as ProductResponseDto;
  }

  /**
   * Update a product
   */
  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Check if product exists
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Generate new slug if name changed
    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      const baseSlug = this.generateSlug(dto.name);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    // Check if SKU is being changed and if it's already taken
    if (dto.sku && dto.sku !== existing.sku) {
      const skuTaken = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (skuTaken) {
        throw new ConflictException('SKU is already taken');
      }
    }

    // Set publishedAt if status is being changed to PUBLISHED
    let publishedAt = existing.publishedAt;
    if (
      dto.status === ProductStatus.PUBLISHED &&
      existing.status !== ProductStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    // Build update data
    const updateData: any = {
      name: dto.name,
      slug,
      description: dto.description,
      shortDescription: dto.shortDescription,
      basePrice: dto.basePrice,
      compareAtPrice: dto.compareAtPrice,
      cost: dto.cost,
      sku: dto.sku,
      barcode: dto.barcode,
      featuredImage: dto.featuredImage,
      images: dto.images,
      status: dto.status,
      isVisible: dto.isVisible,
      isFeatured: dto.isFeatured,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      publishedAt,
    };

    // Handle category updates
    if (dto.categoryIds !== undefined) {
      updateData.categories = {
        set: dto.categoryIds.map((id) => ({ id })),
      };
    }

    // Handle tag updates
    if (dto.tagIds !== undefined) {
      updateData.tags = {
        set: dto.tagIds.map((id) => ({ id })),
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
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
          select: {
            id: true,
            name: true,
            sku: true,
            attributes: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    return {
      ...product,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      cost: product.cost ? Number(product.cost) : undefined,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : undefined,
      })),
    } as ProductResponseDto;
  }

  /**
   * Delete a product (only if no orders)
   */
  async delete(id: string): Promise<void> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if product has orders
    if (product._count.orderItems > 0) {
      throw new BadRequestException(
        'Cannot delete product with existing orders',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Add a variant to a product
   */
  async addVariant(
    productId: string,
    dto: CreateVariantDto,
  ): Promise<VariantResponseDto> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if SKU already exists
    if (dto.sku) {
      const existing = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });

      if (existing) {
        throw new ConflictException('Variant with this SKU already exists');
      }
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        attributes: dto.attributes as any,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        cost: dto.cost,
        image: dto.image,
        isActive: dto.isActive ?? true,
      },
    });

    return {
      ...variant,
      price: variant.price ? Number(variant.price) : undefined,
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
      cost: variant.cost ? Number(variant.cost) : undefined,
    } as VariantResponseDto;
  }

  /**
   * Update a variant
   */
  async updateVariant(
    variantId: string,
    dto: UpdateVariantDto,
  ): Promise<VariantResponseDto> {
    // Check if variant exists
    const existing = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existing) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    // Check if SKU is being changed and if it's already taken
    if (dto.sku && dto.sku !== existing.sku) {
      const skuTaken = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });

      if (skuTaken) {
        throw new ConflictException('SKU is already taken');
      }
    }

    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        attributes: dto.attributes as any,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        cost: dto.cost,
        image: dto.image,
        isActive: dto.isActive,
      },
      include: {
        inventory: {
          select: {
            quantity: true,
            reserved: true,
            available: true,
          },
        },
      },
    });

    return {
      ...variant,
      price: variant.price ? Number(variant.price) : undefined,
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
      cost: variant.cost ? Number(variant.cost) : undefined,
    } as VariantResponseDto;
  }

  /**
   * Delete a variant
   */
  async deleteVariant(variantId: string): Promise<void> {
    // Check if variant exists
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    // Check if variant has orders
    if (variant._count.orderItems > 0) {
      throw new BadRequestException(
        'Cannot delete variant with existing orders',
      );
    }

    await this.prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(dto: BulkStatusUpdateDto): Promise<{ count: number }> {
    const { productIds, status } = dto;

    // Set publishedAt for products being published
    const publishedAt = status === ProductStatus.PUBLISHED ? new Date() : undefined;

    const result = await this.prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        status,
        publishedAt,
      },
    });

    return { count: result.count };
  }
}
