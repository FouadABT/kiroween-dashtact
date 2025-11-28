import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import {
  TrackEventDto,
  AnalyticsQueryDto,
} from './dto/analytics.dto';

@ApiTags('Landing Analytics')
@Controller('landing/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('track')
  @ApiOperation({ summary: 'Track analytics event (public endpoint)' })
  async trackEvent(@Body() dto: TrackEventDto): Promise<{ success: boolean }> {
    const { pageId, eventType, sessionId, userId, deviceType, browser, referrer, eventData } = dto;

    if (eventType === 'view') {
      await this.analyticsService.trackPageView(pageId, {
        sessionId,
        userId,
        deviceType,
        browser,
        referrer,
      });
    } else if (eventType === 'cta_click' && eventData?.ctaId) {
      await this.analyticsService.trackCTAClick(eventData.ctaId, {
        pageId,
        sessionId,
        userId,
        deviceType,
        browser,
        ctaText: eventData.ctaText,
        ctaPosition: eventData.ctaPosition,
      });
    } else if (eventType === 'section_view' && eventData?.sectionId) {
      await this.analyticsService.trackSectionView(eventData.sectionId, {
        pageId,
        sessionId,
        userId,
        deviceType,
        browser,
        timeSpent: eventData.timeSpent,
        scrollDepth: eventData.scrollDepth,
      });
    }

    return { success: true };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId')
  @ApiOperation({ summary: 'Get page analytics' })
  async getPageAnalytics(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getPageAnalytics(pageId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId/sections')
  @ApiOperation({ summary: 'Get section engagement analytics' })
  async getSectionEngagement(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getSectionEngagement(
      pageId,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId/cta')
  @ApiOperation({ summary: 'Get CTA performance analytics' })
  async getCTAAnalytics(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getCTAAnalytics(pageId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId/traffic-sources')
  @ApiOperation({ summary: 'Get traffic source analytics' })
  async getTrafficSources(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getTrafficSources(pageId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId/devices')
  @ApiOperation({ summary: 'Get device analytics' })
  async getDeviceAnalytics(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.analyticsService.getDeviceAnalytics(pageId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('landing:read')
  @ApiBearerAuth()
  @Get(':pageId/export')
  @ApiOperation({ summary: 'Export analytics data as CSV' })
  async exportAnalytics(
    @Param('pageId') pageId: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const csv = await this.analyticsService.exportAnalytics(
      pageId,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analytics-${pageId}-${Date.now()}.csv"`,
    );
    res.send(csv);
  }
}
