import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

// Mock fetch
global.fetch = vi.fn();

describe('AnalyticsDashboard', () => {
  const mockPageAnalytics = {
    pageId: 'page-1',
    totalViews: 1500,
    uniqueVisitors: 850,
    avgTimeOnPage: 120,
    bounceRate: 35.5,
  };

  const mockSectionEngagement = [
    {
      sectionId: 'section-1',
      views: 1200,
      avgTimeSpent: 45,
      avgScrollDepth: 85,
    },
    {
      sectionId: 'section-2',
      views: 800,
      avgTimeSpent: 30,
      avgScrollDepth: 70,
    },
  ];

  const mockCTAAnalytics = [
    {
      ctaId: 'cta-1',
      ctaText: 'Get Started',
      clicks: 150,
      ctr: 10,
    },
  ];

  const mockTrafficSources = [
    {
      source: 'https://google.com',
      visits: 800,
      percentage: 53.3,
    },
    {
      source: 'Direct',
      visits: 700,
      percentage: 46.7,
    },
  ];

  const mockDeviceAnalytics = {
    deviceBreakdown: [
      { device: 'desktop', visits: 900, percentage: 60 },
      { device: 'mobile', visits: 600, percentage: 40 },
    ],
    browserBreakdown: [
      { browser: 'Chrome', visits: 1000, percentage: 66.7 },
      { browser: 'Safari', visits: 500, percentage: 33.3 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/analytics/page-1?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPageAnalytics),
        });
      }
      if (url.includes('/sections?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSectionEngagement),
        });
      }
      if (url.includes('/cta?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCTAAnalytics),
        });
      }
      if (url.includes('/traffic-sources?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrafficSources),
        });
      }
      if (url.includes('/devices?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDeviceAnalytics),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('should render loading state initially', () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    // Should show skeleton loaders
    expect(screen.getByRole('heading', { name: /analytics dashboard/i })).toBeInTheDocument();
  });

  it('should display page analytics metrics', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument(); // Total views
      expect(screen.getByText('850')).toBeInTheDocument(); // Unique visitors
      expect(screen.getByText('2m 0s')).toBeInTheDocument(); // Avg time
      expect(screen.getByText('35.5%')).toBeInTheDocument(); // Bounce rate
    });
  });

  it('should display section engagement', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      expect(screen.getByText('section-1')).toBeInTheDocument();
      expect(screen.getByText('section-2')).toBeInTheDocument();
      expect(screen.getByText('1200 views • 45s avg. time')).toBeInTheDocument();
    });
  });

  it('should display CTA performance', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('150 clicks')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });
  });

  it('should display traffic sources', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      expect(screen.getByText('https://google.com')).toBeInTheDocument();
      expect(screen.getByText('Direct')).toBeInTheDocument();
      expect(screen.getByText('800 visits (53.3%)')).toBeInTheDocument();
    });
  });

  it('should display device breakdown', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      expect(screen.getByText('60%')).toBeInTheDocument(); // Desktop
      expect(screen.getByText('40%')).toBeInTheDocument(); // Mobile
    });
  });

  it('should format time correctly', async () => {
    render(<AnalyticsDashboard pageId="page-1" />);

    await waitFor(() => {
      // 120 seconds should be formatted as "2m 0s"
      expect(screen.getByText('2m 0s')).toBeInTheDocument();
    });
  });
});
