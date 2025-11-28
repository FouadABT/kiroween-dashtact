import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  ProductQueryDto,
  BulkStatusUpdateDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard, FeatureGuard)
@FeatureEnabled('ecommerce')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Get all product categories (public)
   * No authentication required - for landing page editor
   */
  @Public()
  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  /**
   * Get all product tags (public)
   * No authentication required - for landing page editor
   */
  @Public()
  @Get('tags')
  async getTags() {
    return this.productsService.getTags();
  }

  /**
   * Get all products with filtering and pagination (public)
   * No authentication required - for storefront/landing pages
   */
  @Public()
  @Get('public')
  async findAllPublic(@Query() query: ProductQueryDto) {
    // Only return published products for public endpoint
    return this.productsService.findAll({ ...query, status: ProductStatus.PUBLISHED });
  }

  /**
   * Get product by slug (public endpoint)
   * No authentication required
   */
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Get all products with filtering and pagination
   * Requires: products:read permission
   */
  @Get()
  @Permissions('products:read')
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Get a single product by ID
   * Requires: products:read permission
   */
  @Get(':id')
  @Permissions('products:read')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Create a new product
   * Requires: products:write permission
   */
  @Post()
  @Permissions('products:write')
  async create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.productsService.create(dto, userId);
  }

  /**
   * Update a product
   * Requires: products:write permission
   */
  @Patch(':id')
  @Permissions('products:write')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser('id') userId: string) {
    return this.productsService.update(id, dto, userId);
  }

  /**
   * Delete a product (only if no orders)
   * Requires: products:delete permission
   */
  @Delete(':id')
  @Permissions('products:delete')
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  /**
   * Add a variant to a product
   * Requires: products:write permission
   */
  @Post(':id/variants')
  @Permissions('products:write')
  async addVariant(
    @Param('id') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.addVariant(productId, dto);
  }

  /**
   * Update a variant
   * Requires: products:write permission
   */
  @Patch('variants/:id')
  @Permissions('products:write')
  async updateVariant(
    @Param('id') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(variantId, dto);
  }

  /**
   * Delete a variant
   * Requires: products:delete permission
   */
  @Delete('variants/:id')
  @Permissions('products:delete')
  async deleteVariant(@Param('id') variantId: string) {
    await this.productsService.deleteVariant(variantId);
    return { message: 'Variant deleted successfully' };
  }

  /**
   * Bulk update product status
   * Requires: products:write permission
   */
  @Post('bulk-status')
  @Permissions('products:write')
  async bulkUpdateStatus(@Body() dto: BulkStatusUpdateDto) {
    return this.productsService.bulkUpdateStatus(dto);
  }
}
