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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { CreateUploadDto } from './dto/create-upload.dto';
import { GetUploadsQueryDto } from './dto/get-uploads-query.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkVisibilityUpdateDto } from './dto/bulk-visibility-update.dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // Specific POST routes MUST come before generic @Post()
  @Post('editor-image')
  @Permissions('media:upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEditorImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    
    // Create upload record for editor image
    // Editor images in blog/pages should be PUBLIC so they're visible to readers
    const dto: CreateUploadDto = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${baseUrl}/files/${file.filename}`,
      path: file.path,
      type: 'EDITOR_IMAGE',
      visibility: 'PUBLIC', // Public so blog/page readers can see them
    };

    const upload = await this.uploadsService.create(dto, user.id);

    // Return format expected by editor with full URL
    return {
      url: upload.url,
      filename: upload.filename,
      size: upload.size,
      mimetype: upload.mimeType,
    };
  }

  @Post('bulk-delete')
  @Permissions('media:delete:own', 'media:delete:all')
  async bulkDelete(
    @Body() dto: BulkDeleteDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.uploadsService.bulkDelete(dto, user);
  }

  @Post()
  @Permissions('media:upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
    @Body() metadata: Partial<CreateUploadDto>,
  ) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    
    // Determine type from MIME type, don't trust client input
    const uploadType = this.determineType(file.mimetype);
    
    // File already saved by multer
    const dto: CreateUploadDto = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${baseUrl}/files/${file.filename}`,
      path: file.path,
      type: uploadType,
      // Spread metadata but exclude type to prevent override
      ...(metadata.altText && { altText: metadata.altText }),
      ...(metadata.title && { title: metadata.title }),
      ...(metadata.description && { description: metadata.description }),
      ...(metadata.tags && { tags: metadata.tags }),
      ...(metadata.category && { category: metadata.category }),
      ...(metadata.visibility && { visibility: metadata.visibility }),
    };

    return this.uploadsService.create(dto, user.id);
  }

  // Specific GET routes MUST come before @Get(':id')
  @Get('deleted')
  @Permissions('media:view:all')
  async findDeleted(@CurrentUser() user: RequestUser) {
    return this.uploadsService.findDeleted(user);
  }

  @Get()
  @Permissions('media:view')
  async findAll(
    @Query() query: GetUploadsQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.uploadsService.findAll(query, user);
  }

  @Get(':id')
  @Permissions('media:view')
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.uploadsService.findOne(id, user);
  }

  @Patch('bulk-visibility')
  @Permissions('media:edit:own', 'media:edit:all')
  async bulkUpdateVisibility(
    @Body() dto: BulkVisibilityUpdateDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.uploadsService.bulkUpdateVisibility(dto, user);
  }

  @Patch(':id')
  @Permissions('media:edit:own', 'media:edit:all')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUploadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.uploadsService.update(id, dto, user);
  }

  // Specific DELETE routes MUST come before @Delete(':id')
  @Delete(':id/permanent')
  @Permissions('media:delete:all')
  async permanentDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.uploadsService.permanentDelete(id, user);
    return { message: 'File permanently deleted' };
  }

  @Delete(':id')
  @Permissions('media:delete:own', 'media:delete:all')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const result = await this.uploadsService.remove(id, user);
    return { 
      message: 'File deleted successfully',
      ...result,
    };
  }

  // Specific POST routes for parameterized paths
  @Post(':id/restore')
  @Permissions('media:delete:all')
  async restore(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const upload = await this.uploadsService.restore(id, user);
    return { message: 'File restored successfully', upload };
  }

  private determineType(mimeType: string): 'IMAGE' | 'DOCUMENT' {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    return 'DOCUMENT';
  }
}
