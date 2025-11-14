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

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
   * Get product by slug (public endpoint)
   * No authentication required
   */
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Create a new product
   * Requires: products:write permission
   */
  @Post()
  @Permissions('products:write')
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * Update a product
   * Requires: products:write permission
   */
  @Patch(':id')
  @Permissions('products:write')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
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
