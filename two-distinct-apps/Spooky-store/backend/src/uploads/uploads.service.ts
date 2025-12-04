import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Upload, Visibility } from '@prisma/client';
import { CreateUploadDto } from './dto/create-upload.dto';
import { GetUploadsQueryDto } from './dto/get-uploads-query.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkVisibilityUpdateDto } from './dto/bulk-visibility-update.dto';
import type { RequestUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create upload record after file storage
   */
  async create(dto: CreateUploadDto, userId: string): Promise<Upload> {
    return this.prisma.upload.create({
      data: {
        ...dto,
        uploadedById: userId,
        visibility: dto.visibility || Visibility.PRIVATE, // Use provided visibility or default to PRIVATE
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Get uploads with access control
   */
  async findAll(
    query: GetUploadsQueryDto,
    user: RequestUser,
  ): Promise<{ data: Upload[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      type,
      visibility,
      uploadedBy,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.UploadWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
    };

    // Apply access control
    // Users with media:view:all can see all files regardless of ownership
    const hasViewAllPermission = this.hasPermission(user, 'media:view:all');
    if (!this.isAdmin(user) && !hasViewAllPermission) {
      where.OR = [
        { visibility: Visibility.PUBLIC },
        { uploadedById: user.id },
        {
          visibility: Visibility.ROLE_BASED,
          allowedRoles: { has: user.roleId },
        },
      ];
    }

    // Admin filter
    if (uploadedBy && this.isAdmin(user)) {
      where.uploadedById = uploadedBy;
    }

    // Visibility filter
    if (visibility) {
      where.visibility = visibility;
    }

    const [data, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.upload.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get single upload with permission check
   */
  async findOne(id: string, user: RequestUser): Promise<Upload> {
    const upload = await this.prisma.upload.findUnique({
      where: { id, deletedAt: null },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    if (!this.canAccess(upload, user)) {
      throw new ForbiddenException('Access denied');
    }

    return upload;
  }

  /**
   * Update upload metadata
   */
  async update(
    id: string,
    dto: UpdateUploadDto,
    user: RequestUser,
  ): Promise<Upload> {
    const upload = await this.findOne(id, user);

    if (!this.canEdit(upload, user)) {
      throw new ForbiddenException(
        'You do not have permission to edit this file',
      );
    }

    return this.prisma.upload.update({
      where: { id },
      data: dto,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string, user: RequestUser): Promise<{ warning?: string }> {
    const upload = await this.findOne(id, user);

    if (!this.canDelete(upload, user)) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }

    // Check if file is in use
    let warning: string | undefined;
    if (upload.usageCount > 0) {
      warning = `This file is currently used in ${upload.usageCount} location(s). Deleting it may break references.`;
    }

    await this.prisma.upload.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
      },
    });

    return { warning };
  }

  /**
   * Bulk delete
   */
  async bulkDelete(
    dto: BulkDeleteDto,
    user: RequestUser,
  ): Promise<{ deleted: number }> {
    const uploads = await this.prisma.upload.findMany({
      where: { id: { in: dto.ids }, deletedAt: null },
    });

    const deletableIds = uploads
      .filter((upload) => this.canDelete(upload, user))
      .map((upload) => upload.id);

    await this.prisma.upload.updateMany({
      where: { id: { in: deletableIds } },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
      },
    });

    return { deleted: deletableIds.length };
  }

  /**
   * Bulk visibility update
   */
  async bulkUpdateVisibility(
    dto: BulkVisibilityUpdateDto,
    user: RequestUser,
  ): Promise<{ updated: number }> {
    const uploads = await this.prisma.upload.findMany({
      where: { id: { in: dto.ids }, deletedAt: null },
    });

    const editableIds = uploads
      .filter((upload) => this.canEdit(upload, user))
      .map((upload) => upload.id);

    await this.prisma.upload.updateMany({
      where: { id: { in: editableIds } },
      data: {
        visibility: dto.visibility,
        allowedRoles: dto.allowedRoles || [],
      },
    });

    return { updated: editableIds.length };
  }

  /**
   * Increment usage count
   */
  async incrementUsage(
    id: string,
    entity: string,
    entityId: string,
  ): Promise<void> {
    const upload = await this.prisma.upload.findUnique({ where: { id } });
    if (!upload) return;

    const usedIn = (upload.usedIn as any) || {};
    if (!usedIn[entity]) {
      usedIn[entity] = [];
    }
    if (!usedIn[entity].includes(entityId)) {
      usedIn[entity].push(entityId);
    }

    await this.prisma.upload.update({
      where: { id },
      data: {
        usedIn,
        usageCount: { increment: 1 },
      },
    });
  }

  /**
   * Check if user has a specific permission
   */
  private hasPermission(user: RequestUser, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }

  /**
   * Check if user is admin
   */
  private isAdmin(user: RequestUser): boolean {
    return user.role?.name === 'Admin' || user.role?.name === 'Super Admin';
  }

  /**
   * Check if user can access upload
   */
  private canAccess(upload: Upload, user: RequestUser): boolean {
    if (this.isAdmin(user)) return true;
    if (upload.visibility === Visibility.PUBLIC) return true;
    if (upload.uploadedById === user.id) return true;
    if (
      upload.visibility === Visibility.ROLE_BASED &&
      upload.allowedRoles.includes(user.roleId)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Check if user can edit upload
   */
  private canEdit(upload: Upload, user: RequestUser): boolean {
    return this.isAdmin(user) || upload.uploadedById === user.id;
  }

  /**
   * Check if user can delete upload
   */
  private canDelete(upload: Upload, user: RequestUser): boolean {
    return this.isAdmin(user) || upload.uploadedById === user.id;
  }

  /**
   * Get soft-deleted files (admin only)
   */
  async findDeleted(
    user: RequestUser,
  ): Promise<Upload[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can view deleted files');
    }

    return this.prisma.upload.findMany({
      where: {
        deletedAt: { not: null },
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        deletedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  /**
   * Restore soft-deleted file (admin only)
   */
  async restore(id: string, user: RequestUser): Promise<Upload> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can restore files');
    }

    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    if (!upload.deletedAt) {
      throw new ForbiddenException('File is not deleted');
    }

    return this.prisma.upload.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Permanently delete file (admin only)
   */
  async permanentDelete(id: string, user: RequestUser): Promise<void> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can permanently delete files');
    }

    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    // Delete from database
    await this.prisma.upload.delete({
      where: { id },
    });

    // Delete from filesystem
    const fs = require('fs');
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }
  }
}
