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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { ValidateSlugDto } from './dto/validate-slug.dto';
import { ReorderPagesDto } from './dto/reorder-pages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UploadsService } from '../uploads/uploads.service';

@Controller('pages')
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ==================== Public Endpoints ====================

  /**
   * List published pages (public)
   */
  @Public()
  @Get()
  async findAllPublic(@Query() query: PageQueryDto) {
    // Force status to PUBLISHED for public endpoint
    const publicQuery = { ...query, status: 'PUBLISHED' as any };
    return this.pagesService.findAll(publicQuery);
  }

  /**
   * Get page by slug (public)
   */
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug, true);
  }

  /**
   * Get page hierarchy for navigation (public)
   */
  @Public()
  @Get('hierarchy')
  async getHierarchy() {
    return this.pagesService.getHierarchy();
  }

  /**
   * Check for redirect (public)
   */
  @Public()
  @Get('redirect/:slug')
  async checkRedirect(@Param('slug') slug: string) {
    const page = await this.pagesService.resolveRedirect(slug);
    
    if (!page) {
      throw new BadRequestException('No redirect found');
    }

    // Build the full slug path including parent
    let redirectTo = page.slug;
    
    // Type assertion since resolveRedirect includes parentPage relation
    const pageWithParent = page as any;
    if (pageWithParent.parentPage) {
      redirectTo = `${pageWithParent.parentPage.slug}/${page.slug}`;
    }

    return { redirectTo };
  }

  // ==================== Admin Endpoints ====================

  /**
   * List all pages with filters (admin)
   * Requires pages:read permission
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:read')
  async findAll(@Query() query: PageQueryDto) {
    return this.pagesService.findAll(query);
  }

  /**
   * Get page by ID (admin)
   * Requires pages:read permission
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:read')
  async findById(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }

  /**
   * Create new page
   * Requires pages:write permission
   */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:write')
  async create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  /**
   * Update page
   * Requires pages:write permission
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:write')
  async update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  /**
   * Delete page
   * Requires pages:delete permission
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:delete')
  async delete(@Param('id') id: string) {
    await this.pagesService.delete(id);
    return { message: 'Page deleted successfully' };
  }

  /**
   * Publish page
   * Requires pages:publish permission
   */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:publish')
  async publish(@Param('id') id: string) {
    return this.pagesService.publish(id);
  }

  /**
   * Unpublish page
   * Requires pages:publish permission
   */
  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:publish')
  async unpublish(@Param('id') id: string) {
    return this.pagesService.unpublish(id);
  }

  /**
   * Reorder pages
   * Requires pages:write permission
   */
  @Post('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:write')
  async reorder(@Body() reorderDto: ReorderPagesDto) {
    await this.pagesService.reorder(reorderDto.updates);
    return { message: 'Pages reordered successfully' };
  }

  /**
   * Validate slug availability
   * Requires pages:write permission
   */
  @Post('validate-slug')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:write')
  async validateSlug(@Body() validateSlugDto: ValidateSlugDto) {
    const isValid = await this.pagesService.validateSlug(
      validateSlugDto.slug,
      validateSlugDto.excludeId,
    );

    return {
      isValid,
      message: isValid ? 'Slug is available' : 'Slug is not available',
    };
  }

  /**
   * Upload featured image
   * Requires pages:write permission
   */
  @Post('featured-image')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages:write')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFeaturedImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadResult = await this.uploadsService.uploadFile(file, {
      type: 'image',
    });

    return {
      url: uploadResult.url,
      filename: uploadResult.filename,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
    };
  }
}
