import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    landingAnalytics: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackPageView', () => {
    it('should track a page view event', async () => {
      const pageId = 'page-1';
      const metadata = {
        sessionId: 'session-1',
        userId: 'user-1',
        deviceType: 'desktop',
        browser: 'Chrome',
        referrer: 'https://google.com',
      };

      mockPrismaService.landingAnalytics.create.mockResolvedValue({
        id: 'analytics-1',
        pageId,
        eventType: 'view',
        ...metadata,
      });

      await service.trackPageView(pageId, metadata);

      expect(mockPrismaService.landingAnalytics.create).toHaveBeenCalledWith({
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
    });
  });

  describe('trackCTAClick', () => {
    it('should track a CTA click event', async () => {
      const ctaId = 'cta-1';
      const metadata = {
        pageId: 'page-1',
        sessionId: 'session-1',
        deviceType: 'mobile',
        browser: 'Safari',
        ctaText: 'Get Started',
      };

      mockPrismaService.landingAnalytics.create.mockResolvedValue({
        id: 'analytics-2',
        eventType: 'cta_click',
        ...metadata,
      });

      await service.trackCTAClick(ctaId, metadata);

      expect(mockPrismaService.landingAnalytics.create).toHaveBeenCalledWith({
        data: {
          pageId: metadata.pageId,
          eventType: 'cta_click',
          eventData: {
            ctaId,
            ctaText: metadata.ctaText,
            ctaPosition: undefined,
          },
          sessionId: metadata.sessionId,
          userId: undefined,
          deviceType: metadata.deviceType,
          browser: metadata.browser,
        },
      });
    });
  });

  describe('getPageAnalytics', () => {
    it('should return page analytics with metrics', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.count.mockResolvedValue(100);
      mockPrismaService.landingAnalytics.findMany
        .mockResolvedValueOnce([
          { sessionId: 'session-1' },
          { sessionId: 'session-2' },
          { sessionId: 'session-3' },
        ])
        .mockResolvedValueOnce([
          { eventData: { timeSpent: 30 } },
          { eventData: { timeSpent: 45 } },
          { eventData: { timeSpent: 60 } },
        ]);

      mockPrismaService.landingAnalytics.groupBy.mockResolvedValue([
        { sessionId: 'session-1', _count: { sessionId: 1 } },
        { sessionId: 'session-2', _count: { sessionId: 2 } },
        { sessionId: 'session-3', _count: { sessionId: 3 } },
      ]);

      const result = await service.getPageAnalytics(pageId);

      expect(result).toEqual({
        pageId,
        totalViews: 100,
        uniqueVisitors: 3,
        avgTimeOnPage: 45,
        bounceRate: 33.3,
        dateRange: {
          start: undefined,
          end: undefined,
        },
      });
    });
  });

  describe('getSectionEngagement', () => {
    it('should return section engagement metrics', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.findMany.mockResolvedValue([
        {
          eventData: {
            sectionId: 'section-1',
            timeSpent: 30,
            scrollDepth: 80,
          },
        },
        {
          eventData: {
            sectionId: 'section-1',
            timeSpent: 40,
            scrollDepth: 90,
          },
        },
        {
          eventData: {
            sectionId: 'section-2',
            timeSpent: 20,
            scrollDepth: 60,
          },
        },
      ]);

      const result = await service.getSectionEngagement(pageId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sectionId: 'section-1',
        views: 2,
        avgTimeSpent: 35,
        avgScrollDepth: 85,
      });
      expect(result[1]).toEqual({
        sectionId: 'section-2',
        views: 1,
        avgTimeSpent: 20,
        avgScrollDepth: 60,
      });
    });
  });

  describe('getCTAAnalytics', () => {
    it('should return CTA performance metrics', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.findMany.mockResolvedValue([
        { eventData: { ctaId: 'cta-1', ctaText: 'Sign Up' } },
        { eventData: { ctaId: 'cta-1', ctaText: 'Sign Up' } },
        { eventData: { ctaId: 'cta-2', ctaText: 'Learn More' } },
      ]);

      mockPrismaService.landingAnalytics.count.mockResolvedValue(100);

      const result = await service.getCTAAnalytics(pageId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ctaId: 'cta-1',
        ctaText: 'Sign Up',
        clicks: 2,
        ctr: 2,
      });
      expect(result[1]).toEqual({
        ctaId: 'cta-2',
        ctaText: 'Learn More',
        clicks: 1,
        ctr: 1,
      });
    });
  });

  describe('getTrafficSources', () => {
    it('should return traffic source breakdown', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.findMany.mockResolvedValue([
        { referrer: 'https://google.com' },
        { referrer: 'https://google.com' },
        { referrer: 'https://facebook.com' },
        { referrer: null },
      ]);

      const result = await service.getTrafficSources(pageId);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        source: 'https://google.com',
        visits: 2,
        percentage: 50,
      });
    });
  });

  describe('getDeviceAnalytics', () => {
    it('should return device and browser breakdown', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.findMany.mockResolvedValue([
        { deviceType: 'desktop', browser: 'Chrome' },
        { deviceType: 'desktop', browser: 'Chrome' },
        { deviceType: 'mobile', browser: 'Safari' },
        { deviceType: 'tablet', browser: 'Firefox' },
      ]);

      const result = await service.getDeviceAnalytics(pageId);

      expect(result.deviceBreakdown).toHaveLength(3);
      expect(result.browserBreakdown).toHaveLength(3);
      expect(result.deviceBreakdown[0]).toEqual({
        device: 'desktop',
        visits: 2,
        percentage: 50,
      });
    });
  });

  describe('exportAnalytics', () => {
    it('should export analytics as CSV', async () => {
      const pageId = 'page-1';

      mockPrismaService.landingAnalytics.findMany.mockResolvedValue([
        {
          timestamp: new Date('2024-01-01T12:00:00Z'),
          eventType: 'view',
          sessionId: 'session-1',
          userId: 'user-1',
          deviceType: 'desktop',
          browser: 'Chrome',
          referrer: 'https://google.com',
          eventData: {},
        },
      ]);

      const result = await service.exportAnalytics(pageId);

      expect(result).toContain('Timestamp,Event Type,Session ID');
      expect(result).toContain('view');
      expect(result).toContain('session-1');
    });
  });
});
