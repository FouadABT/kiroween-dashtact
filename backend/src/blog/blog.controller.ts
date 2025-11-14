import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ExcerptPreviewDto } from './dto/excerpt-preview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all published blog posts (public)
   * GET /blog
   * Cached for 5 minutes via HTTP headers
   */
  @Public()
  @Header('Cache-Control', 'public, max-age=300, s-maxage=300')
  @Get()
  async findPublished(@Query() query: BlogQueryDto) {
    return this.blogService.findPublished(query);
  }

  /**
   * Get a single published blog post by slug (public)
   * GET /blog/:slug
   * Cached for 5 minutes via HTTP headers
   */
  @Public()
  @Header('Cache-Control', 'public, max-age=300, s-maxage=300')
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  /**
   * Get all categories (public)
   * GET /blog/categories
   * Cached for 10 minutes via HTTP headers
   */
  @Public()
  @Header('Cache-Control', 'public, max-age=600, s-maxage=600')
  @Get('categories/all')
  async findAllCategories() {
    return this.blogService.findAllCategories();
  }

  /**
   * Get all tags (public)
   * GET /blog/tags
   * Cached for 10 minutes via HTTP headers
   */
  @Public()
  @Header('Cache-Control', 'public, max-age=600, s-maxage=600')
  @Get('tags/all')
  async findAllTags() {
    return this.blogService.findAllTags();
  }

  // ==================== SLUG VALIDATION ====================

  /**
   * Validate slug availability
   * GET /blog/validate-slug/:slug
   * Requires: blog:write permission
   *
   * Query params:
   * - excludeId: Post ID to exclude from validation (for editing)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Get('validate-slug/:slug')
  async validateSlug(
    @Param('slug') slug: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.blogService.validateSlug(slug, excludeId);
  }

  /**
   * Generate slug from title
   * POST /blog/generate-slug
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Post('generate-slug')
  async generateSlugFromTitle(
    @Body() body: { title: string; excludeId?: string },
  ) {
    const baseSlug = this.blogService.generateSlug(body.title);
    const uniqueSlug = await this.blogService.ensureUniqueSlug(
      baseSlug,
      body.excludeId,
    );
    return {
      slug: uniqueSlug,
      isUnique: baseSlug === uniqueSlug,
    };
  }

  /**
   * Preview auto-generated excerpt
   * POST /blog/preview-excerpt
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Post('preview-excerpt')
  previewExcerpt(@Body() excerptPreviewDto: ExcerptPreviewDto) {
    return this.blogService.previewExcerpt(
      excerptPreviewDto.content,
      excerptPreviewDto.maxLength,
    );
  }

  // ==================== PROTECTED ENDPOINTS ====================

  /**
   * Get all blog posts including drafts (admin)
   * GET /blog/admin
   * Requires: blog:read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:read')
  @Get('admin/posts')
  async findAll(@Query() query: BlogQueryDto) {
    return this.blogService.findAll(query);
  }

  /**
   * Get a single blog post by ID (admin)
   * GET /blog/admin/:id
   * Requires: blog:read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:read')
  @Get('admin/:id')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  /**
   * Create a new blog post
   * POST /blog
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Post()
  async create(
    @Body() createBlogPostDto: CreateBlogPostDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.blogService.create(createBlogPostDto, req.user.id);
  }

  /**
   * Update a blog post
   * PATCH /blog/:id
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, updateBlogPostDto);
  }

  /**
   * Publish a blog post
   * PATCH /blog/:id/publish
   * Requires: blog:publish permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:publish')
  @Patch(':id/publish')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  /**
   * Unpublish a blog post
   * PATCH /blog/:id/unpublish
   * Requires: blog:publish permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:publish')
  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }

  /**
   * Delete a blog post
   * DELETE /blog/:id
   * Requires: blog:delete permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  // ==================== CATEGORY MANAGEMENT ====================

  /**
   * Create a new category
   * POST /blog/categories
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.blogService.createCategory(
      createCategoryDto.name,
      createCategoryDto.slug,
      createCategoryDto.description,
    );
  }

  /**
   * Update a category
   * PATCH /blog/categories/:id
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.blogService.updateCategory(
      id,
      updateCategoryDto.name,
      updateCategoryDto.slug,
      updateCategoryDto.description,
    );
  }

  /**
   * Delete a category
   * DELETE /blog/categories/:id
   * Requires: blog:delete permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:delete')
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ==================== TAG MANAGEMENT ====================

  /**
   * Create a new tag
   * POST /blog/tags
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Post('tags')
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.blogService.createTag(createTagDto.name, createTagDto.slug);
  }

  /**
   * Update a tag
   * PATCH /blog/tags/:id
   * Requires: blog:write permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:write')
  @Patch('tags/:id')
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.blogService.updateTag(id, updateTagDto.name, updateTagDto.slug);
  }

  /**
   * Delete a tag
   * DELETE /blog/tags/:id
   * Requires: blog:delete permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog:delete')
  @Delete('tags/:id')
  async deleteTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }
}
