import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StorefrontService } from './storefront.service';
import { StorefrontQueryDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('storefront')
@Public() // All storefront endpoints are public
@UseGuards(FeatureGuard)
@FeatureEnabled('ecommerce')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  /**
   * Get all published products with filtering and pagination
   * GET /storefront/products
   */
  @Get('products')
  async getProducts(@Query() query: StorefrontQueryDto) {
    return this.storefrontService.getPublicProducts(query);
  }

  /**
   * Get product by slug
   * GET /storefront/products/:slug
   */
  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.storefrontService.getProductBySlug(slug);
  }

  /**
   * Get all categories with product counts
   * GET /storefront/categories
   */
  @Get('categories')
  async getCategories() {
    return this.storefrontService.getCategories();
  }

  /**
   * Get products by category slug
   * GET /storefront/categories/:slug/products
   */
  @Get('categories/:slug/products')
  async getProductsByCategory(
    @Param('slug') slug: string,
    @Query() query: StorefrontQueryDto,
  ) {
    return this.storefrontService.getProductsByCategory(slug, query);
  }

  /**
   * Search products
   * GET /storefront/search?search=query
   */
  @Get('search')
  async searchProducts(@Query() query: StorefrontQueryDto) {
    return this.storefrontService.searchProducts(query.search || '', query);
  }

  /**
   * Get related products
   * GET /storefront/products/:id/related
   */
  @Get('products/:id/related')
  async getRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.storefrontService.getRelatedProducts(id, limit);
  }
}
