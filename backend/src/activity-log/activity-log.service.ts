import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import {
  ActivityLogResponseDto,
  ActivityLogListResponseDto,
} from './dto/activity-log-response.dto';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logActivity(
    data: CreateActivityLogDto,
    request?: Request,
  ): Promise<ActivityLogResponseDto | null> {
    try {
      const ipAddress =
        data.ipAddress ||
        (request
          ? (request.ip ||
              request.headers['x-forwarded-for'] ||
              request.socket.remoteAddress)
          : null);
      const userAgent = data.userAgent || request?.headers['user-agent'];

      let actorName = data.actorName;
      if (data.userId && !actorName) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: data.userId },
            select: { name: true, email: true },
          });
          actorName = user?.name || user?.email || 'Unknown User';
        } catch (userError) {
          this.logger.warn('Failed to fetch user for activity log', userError);
          actorName = 'Unknown User';
        }
      }

      if (!actorName) {
        actorName = 'System';
      }

      const activityLog = await this.prisma.activityLog.create({
        data: {
          action: data.action,
          userId: data.userId || null,
          actorName,
          entityType: data.entityType || null,
          entityId: data.entityId || null,
          metadata: data.metadata ? (data.metadata as any) : undefined,
          ipAddress: ipAddress as string,
          userAgent: userAgent as string,
        },
      });

      return new ActivityLogResponseDto({
        ...activityLog,
        metadata: activityLog.metadata as Record<string, any> | null,
      });
    } catch (error) {
      // Graceful degradation - log error but don't crash the app
      this.logger.error('Failed to log activity - continuing without logging', error);
      return null;
    }
  }

  async findAll(
    query: ActivityLogQueryDto,
  ): Promise<ActivityLogListResponseDto> {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return new ActivityLogListResponseDto({
      data: data.map((log) => new ActivityLogResponseDto({
        ...log,
        metadata: log.metadata as Record<string, any> | null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findOne(id: string): Promise<ActivityLogResponseDto | null> {
    const activityLog = await this.prisma.activityLog.findUnique({
      where: { id },
    });

    return activityLog ? new ActivityLogResponseDto({
      ...activityLog,
      metadata: activityLog.metadata as Record<string, any> | null,
    }) : null;
  }

  async logUserLogin(userId: string, request: Request): Promise<ActivityLogResponseDto | null> {
    return this.logActivity(
      {
        action: 'USER_LOGIN',
        userId,
        entityType: 'User',
        entityId: userId,
      },
      request,
    );
  }

  async logUserLogout(userId: string, request: Request): Promise<ActivityLogResponseDto | null> {
    return this.logActivity(
      {
        action: 'USER_LOGOUT',
        userId,
        entityType: 'User',
        entityId: userId,
      },
      request,
    );
  }

  async logEntityCreated(
    entityType: string,
    entityId: string,
    userId: string,
    metadata?: any,
  ): Promise<ActivityLogResponseDto | null> {
    return this.logActivity({
      action: `${entityType.toUpperCase()}_CREATED`,
      userId,
      entityType,
      entityId,
      metadata,
    });
  }

  async logEntityUpdated(
    entityType: string,
    entityId: string,
    userId: string,
    changes: any,
  ): Promise<ActivityLogResponseDto | null> {
    return this.logActivity({
      action: `${entityType.toUpperCase()}_UPDATED`,
      userId,
      entityType,
      entityId,
      metadata: { changes },
    });
  }

  async logEntityDeleted(
    entityType: string,
    entityId: string,
    userId: string,
  ): Promise<ActivityLogResponseDto | null> {
    return this.logActivity({
      action: `${entityType.toUpperCase()}_DELETED`,
      userId,
      entityType,
      entityId,
    });
  }
}
