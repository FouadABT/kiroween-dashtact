import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TrackEventDto,
  PageAnalyticsDto,
  SectionEngagementDto,
  TrafficSourceDto,
  DeviceAnalyticsDto,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a page view event
   */
  async trackPageView(
    pageId: string,
    metadata: {
      sessionId: string;
      userId?: string;
      deviceType: string;
      browser: string;
      referrer?: string;
      userAgent?: string;
    },
  ): Promise<void> {
    await this.prisma.landingAnalytics.create({
      data: {
        pageId,
        eventType: 'view',
        eventData: {},
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
        referrer: metadata.referrer,
      },
    });
  }

  /**
   * Track a CTA click event
   */
  async trackCTAClick(
    ctaId: string,
    metadata: {
      pageId: string;
      sessionId: string;
      userId?: string;
      deviceType: string;
      browser: string;
      ctaText?: string;
      ctaPosition?: string;
    },
  ): Promise<void> {
    await this.prisma.landingAnalytics.create({
      data: {
        pageId: metadata.pageId,
        eventType: 'cta_click',
        eventData: {
          ctaId,
          ctaText: metadata.ctaText,
          ctaPosition: metadata.ctaPosition,
        },
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
      },
    });
  }

  /**
   * Track a section view event
   */
  async trackSectionView(
    sectionId: string,
    metadata: {
      pageId: string;
      sessionId: string;
      userId?: string;
      deviceType: string;
      browser: string;
      timeSpent?: number;
      scrollDepth?: number;
    },
  ): Promise<void> {
    await this.prisma.landingAnalytics.create({
      data: {
        pageId: metadata.pageId,
        eventType: 'section_view',
        eventData: {
          sectionId,
          timeSpent: metadata.timeSpent,
          scrollDepth: metadata.scrollDepth,
        },
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
      },
    });
  }

  /**
   * Get page analytics with date range filtering
   */
  async getPageAnalytics(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PageAnalyticsDto> {
    const where: any = { pageId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    // Get total views
    const totalViews = await this.prisma.landingAnalytics.count({
      where: { ...where, eventType: 'view' },
    });

    // Get unique visitors
    const uniqueVisitors = await this.prisma.landingAnalytics.findMany({
      where: { ...where, eventType: 'view' },
      select: { sessionId: true },
      distinct: ['sessionId'],
    });

    // Calculate average time on page (from section view events)
    const sectionViews = await this.prisma.landingAnalytics.findMany({
      where: { ...where, eventType: 'section_view' },
      select: { eventData: true },
    });

    const totalTime = sectionViews.reduce((sum, view: any) => {
      return sum + (view.eventData?.timeSpent || 0);
    }, 0);

    const avgTimeOnPage =
      sectionViews.length > 0 ? totalTime / sectionViews.length : 0;

    // Calculate bounce rate (sessions with only 1 view)
    const allSessions = await this.prisma.landingAnalytics.groupBy({
      by: ['sessionId'],
      where: { ...where, eventType: 'view' },
      _count: { sessionId: true },
    });

    const bouncedSessions = allSessions.filter((s) => s._count.sessionId === 1);
    const bounceRate =
      allSessions.length > 0
        ? (bouncedSessions.length / allSessions.length) * 100
        : 0;

    return {
      pageId,
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      avgTimeOnPage: Math.round(avgTimeOnPage),
      bounceRate: Math.round(bounceRate * 10) / 10,
      dateRange: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      },
    };
  }

  /**
   * Get section engagement analytics
   */
  async getSectionEngagement(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SectionEngagementDto[]> {
    const where: any = {
      pageId,
      eventType: 'section_view',
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const sectionViews = await this.prisma.landingAnalytics.findMany({
      where,
      select: { eventData: true },
    });

    // Group by section ID
    const sectionMap = new Map<string, any>();

    sectionViews.forEach((view: any) => {
      const sectionId = view.eventData?.sectionId;
      if (!sectionId) return;

      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, {
          sectionId,
          views: 0,
          totalTimeSpent: 0,
          avgScrollDepth: 0,
          scrollDepths: [],
        });
      }

      const section = sectionMap.get(sectionId);
      section.views++;
      section.totalTimeSpent += view.eventData?.timeSpent || 0;
      if (view.eventData?.scrollDepth) {
        section.scrollDepths.push(view.eventData.scrollDepth);
      }
    });

    // Calculate averages and format results
    const results: SectionEngagementDto[] = [];
    sectionMap.forEach((section) => {
      const avgTimeSpent =
        section.views > 0 ? section.totalTimeSpent / section.views : 0;
      const avgScrollDepth =
        section.scrollDepths.length > 0
          ? section.scrollDepths.reduce((a: number, b: number) => a + b, 0) /
            section.scrollDepths.length
          : 0;

      results.push({
        sectionId: section.sectionId,
        views: section.views,
        avgTimeSpent: Math.round(avgTimeSpent),
        avgScrollDepth: Math.round(avgScrollDepth * 10) / 10,
      });
    });

    // Sort by views descending
    return results.sort((a, b) => b.views - a.views);
  }

  /**
   * Get CTA performance analytics
   */
  async getCTAAnalytics(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const where: any = {
      pageId,
      eventType: 'cta_click',
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const ctaClicks = await this.prisma.landingAnalytics.findMany({
      where,
      select: { eventData: true },
    });

    // Get total page views for CTR calculation
    const totalViews = await this.prisma.landingAnalytics.count({
      where: {
        pageId,
        eventType: 'view',
        ...(startDate || endDate
          ? {
              timestamp: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
    });

    // Group by CTA ID
    const ctaMap = new Map<string, any>();

    ctaClicks.forEach((click: any) => {
      const ctaId = click.eventData?.ctaId;
      if (!ctaId) return;

      if (!ctaMap.has(ctaId)) {
        ctaMap.set(ctaId, {
          ctaId,
          ctaText: click.eventData?.ctaText,
          clicks: 0,
        });
      }

      ctaMap.get(ctaId).clicks++;
    });

    // Calculate CTR and format results
    const results: any[] = [];
    ctaMap.forEach((cta) => {
      const ctr = totalViews > 0 ? (cta.clicks / totalViews) * 100 : 0;
      results.push({
        ctaId: cta.ctaId,
        ctaText: cta.ctaText,
        clicks: cta.clicks,
        ctr: Math.round(ctr * 10) / 10,
      });
    });

    return results.sort((a, b) => b.clicks - a.clicks);
  }

  /**
   * Get traffic source analytics
   */
  async getTrafficSources(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TrafficSourceDto[]> {
    const where: any = {
      pageId,
      eventType: 'view',
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const views = await this.prisma.landingAnalytics.findMany({
      where,
      select: { referrer: true },
    });

    // Group by referrer
    const sourceMap = new Map<string, number>();

    views.forEach((view) => {
      const source = view.referrer || 'Direct';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    // Format results
    const results: TrafficSourceDto[] = [];
    const totalViews = views.length;

    sourceMap.forEach((count, source) => {
      const percentage = totalViews > 0 ? (count / totalViews) * 100 : 0;
      results.push({
        source,
        visits: count,
        percentage: Math.round(percentage * 10) / 10,
      });
    });

    return results.sort((a, b) => b.visits - a.visits);
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DeviceAnalyticsDto> {
    const where: any = {
      pageId,
      eventType: 'view',
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const views = await this.prisma.landingAnalytics.findMany({
      where,
      select: { deviceType: true, browser: true },
    });

    // Group by device type
    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();

    views.forEach((view) => {
      deviceMap.set(
        view.deviceType,
        (deviceMap.get(view.deviceType) || 0) + 1,
      );
      browserMap.set(view.browser, (browserMap.get(view.browser) || 0) + 1);
    });

    const totalViews = views.length;

    // Format device breakdown
    const deviceBreakdown: any[] = [];
    deviceMap.forEach((count, device) => {
      const percentage = totalViews > 0 ? (count / totalViews) * 100 : 0;
      deviceBreakdown.push({
        device,
        visits: count,
        percentage: Math.round(percentage * 10) / 10,
      });
    });

    // Format browser breakdown
    const browserBreakdown: any[] = [];
    browserMap.forEach((count, browser) => {
      const percentage = totalViews > 0 ? (count / totalViews) * 100 : 0;
      browserBreakdown.push({
        browser,
        visits: count,
        percentage: Math.round(percentage * 10) / 10,
      });
    });

    return {
      deviceBreakdown: deviceBreakdown.sort((a, b) => b.visits - a.visits),
      browserBreakdown: browserBreakdown.sort((a, b) => b.visits - a.visits),
    };
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics(
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<string> {
    const where: any = { pageId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const events = await this.prisma.landingAnalytics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    // Generate CSV
    const headers = [
      'Timestamp',
      'Event Type',
      'Session ID',
      'User ID',
      'Device Type',
      'Browser',
      'Referrer',
      'Event Data',
    ];

    const rows = events.map((event) => [
      event.timestamp.toISOString(),
      event.eventType,
      event.sessionId,
      event.userId || '',
      event.deviceType,
      event.browser,
      event.referrer || '',
      JSON.stringify(event.eventData),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csv;
  }
}
