import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  NotificationAnalyticsService,
  NotificationMetrics,
  CategoryStats,
  ChannelPerformance,
} from './notification-analytics.service';

class AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
}

@Controller('notifications/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationAnalyticsController {
  constructor(
    private readonly analyticsService: NotificationAnalyticsService,
  ) {}

  /**
   * Get notification metrics for current user
   * GET /notifications/analytics/metrics
   */
  @Get('metrics')
  @Permissions('notifications:read')
  async getMetrics(
    @CurrentUser() user: { id: string },
    @Query() query: AnalyticsQueryDto,
  ): Promise<NotificationMetrics> {
    const dateRange = this.parseDateRange(query);
    return this.analyticsService.getMetrics(user.id, dateRange);
  }

  /**
   * Get category statistics (admin only)
   * GET /notifications/analytics/categories
   */
  @Get('categories')
  @Permissions('notifications:admin')
  async getCategoryStats(
    @Query() query: AnalyticsQueryDto,
  ): Promise<CategoryStats[]> {
    const dateRange = this.parseDateRange(query);
    return this.analyticsService.getCategoryStats(dateRange);
  }

  /**
   * Get channel performance metrics (admin only)
   * GET /notifications/analytics/channels
   */
  @Get('channels')
  @Permissions('notifications:admin')
  async getChannelPerformance(
    @Query() query: AnalyticsQueryDto,
  ): Promise<ChannelPerformance[]> {
    const dateRange = this.parseDateRange(query);
    return this.analyticsService.getChannelPerformance(dateRange);
  }

  /**
   * Parse date range from query parameters
   * Defaults to last 30 days if not provided
   */
  private parseDateRange(query: AnalyticsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return { startDate, endDate };
  }
}
