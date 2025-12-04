/**
 * Landing Page Rendering Tests
 * 
 * Tests for the public landing page rendering including:
 * - Section rendering for all types
 * - Section ordering
 * - Enabled/disabled sections
 * - CTA link resolution
 * - Global settings application
 * 
 * Requirements: 1.2-1.4, 1.6, 1.7, 11.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LandingPage } from '@/components/landing/LandingPage';
import { LandingPageContent } from '@/types/landing-page';

// Mock fetch
global.fetch = vi.fn();

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

// Mock landing page content with all section types
const mockLandingContent: LandingPageContent = {
  id: 'landing-1',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      enabled: true,
      order: 0,
      data: {
        headline: 'Welcome to Our Platform',
        subheadline: 'Build amazing things',
        primaryCta: { text: 'Get Started', link: '/signup', linkType: 'url' },
        secondaryCta: { text: 'Learn More', link: 'about-us', linkType: 'page' },
        backgroundType: 'solid',
        backgroundColor: '#000000',
        textAlignment: 'center',
        height: 'large',
      },
    },
    {
      id: 'features-1',
      type: 'features',
      enabled: true,
      order: 1,
      data: {
        title: 'Our Features',
        subtitle: 'Everything you need',
        layout: 'grid',
        columns: 3,
        features: [
          {
            id: 'feature-1',
            icon: 'Zap',
            title: 'Fast',
            description: 'Lightning fast performance',
            order: 0,
          },
          {
            id: 'feature-2',
            icon: 'Shield',
            title: 'Secure',
            description: 'Bank-level security',
            order: 1,
          },
        ],
      },
    },
    {
      id: 'cta-1',
      type: 'cta',
      enabled: true,
      order: 2,
      data: {
        title: 'Ready to Get Started?',
        description: 'Join thousands of users today',
        primaryCta: { text: 'Sign Up Now', link: '/signup', linkType: 'url' },
        backgroundColor: '#000000',
        textColor: '#ffffff',
        alignment: 'center',
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      enabled: true,
      order: 3,
      data: {
        title: 'What Our Users Say',
        subtitle: 'Trusted by thousands',
        layout: 'grid',
        testimonials: [
          {
            id: 'testimonial-1',
            quote: 'This platform changed my life!',
            author: 'John Doe',
            role: 'CEO',
            company: 'Acme Inc',
            order: 0,
          },
        ],
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      enabled: true,
      order: 4,
      data: {
        title: 'Our Impact',
        layout: 'horizontal',
        stats: [
          {
            id: 'stat-1',
            value: '10K+',
            label: 'Active Users',
            order: 0,
          },
          {
            id: 'stat-2',
            value: '99.9%',
            label: 'Uptime',
            order: 1,
          },
        ],
      },
    },
    {
      id: 'content-1',
      type: 'content',
      enabled: true,
      order: 5,
      data: {
        title: 'About Our Platform',
        content: 'We provide the best solutions for your business needs.',
        layout: 'single',
      },
    },
    {
      id: 'footer-1',
      type: 'footer',
      enabled: true,
      order: 6,
      data: {
        companyName: 'Our Company',
        description: 'Building the future',
        navLinks: [
          {
            label: 'About',
            url: 'about',
            linkType: 'page',
            order: 0,
          },
          {
            label: 'Contact',
            url: '/contact',
            linkType: 'url',
            order: 1,
          },
        ],
        socialLinks: [
          {
            platform: 'twitter',
            url: 'https://twitter.com/company',
            icon: 'Twitter',
          },
        ],
        copyright: '© 2024 Our Company',
        showNewsletter: false,
      },
    },
  ],
  settings: {
    theme: {
      primaryColor: '#000000',
    },
    layout: {
      maxWidth: 'container',
      spacing: 'normal',
    },
    seo: {
      title: 'Landing Page',
      description: 'Welcome to our platform',
    },
  },
  version: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('LandingPage Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default fetch mock
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockLandingContent,
    } as Response);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Section Rendering - All Types', () => {
    it('should render hero section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
        expect(screen.getByText('Build amazing things')).toBeInTheDocument();
        expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
        expect(screen.getByText('Learn More')).toBeInTheDocument();
      });
    });

    it('should render features section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Our Features')).toBeInTheDocument();
        expect(screen.getByText('Everything you need')).toBeInTheDocument();
        expect(screen.getByText('Fast')).toBeInTheDocument();
        expect(screen.getByText('Lightning fast performance')).toBeInTheDocument();
        expect(screen.getByText('Secure')).toBeInTheDocument();
        expect(screen.getByText('Bank-level security')).toBeInTheDocument();
      });
    });

    it('should render CTA section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
        expect(screen.getByText('Join thousands of users today')).toBeInTheDocument();
        expect(screen.getByText('Sign Up Now')).toBeInTheDocument();
      });
    });

    it('should render testimonials section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('What Our Users Say')).toBeInTheDocument();
        expect(screen.getByText('Trusted by thousands')).toBeInTheDocument();
        expect(screen.getByText(/This platform changed my life/i)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/CEO/i)).toBeInTheDocument();
      });
    });

    it('should render stats section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Our Impact')).toBeInTheDocument();
        expect(screen.getByText('10K+')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('99.9%')).toBeInTheDocument();
        expect(screen.getByText('Uptime')).toBeInTheDocument();
      });
    });

    it('should render content section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('About Our Platform')).toBeInTheDocument();
        expect(screen.getByText('We provide the best solutions for your business needs.')).toBeInTheDocument();
      });
    });

    it('should render footer section', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Our Company')).toBeInTheDocument();
        expect(screen.getByText('Building the future')).toBeInTheDocument();
        expect(screen.getAllByText('About').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
        expect(screen.getByText('© 2024 Our Company')).toBeInTheDocument();
      });
    });

    it('should handle unknown section types gracefully', async () => {
      const contentWithUnknownSection = {
        ...mockLandingContent,
        sections: [
          ...mockLandingContent.sections,
          {
            id: 'unknown-1',
            type: 'unknown-type',
            enabled: true,
            order: 99,
            data: {},
          },
        ],
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithUnknownSection,
      } as Response);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown section type: unknown-type');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Section Ordering', () => {
    it('should render sections in correct order', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      });

      // Get all sections by their container elements
      const sections = document.querySelectorAll('[data-section-type]');
      
      // Verify order: hero, features, cta, testimonials, stats, content, footer
      expect(sections[0]).toHaveAttribute('data-section-type', 'hero');
      expect(sections[1]).toHaveAttribute('data-section-type', 'features');
      expect(sections[2]).toHaveAttribute('data-section-type', 'cta');
      expect(sections[3]).toHaveAttribute('data-section-type', 'testimonials');
      expect(sections[4]).toHaveAttribute('data-section-type', 'stats');
      expect(sections[5]).toHaveAttribute('data-section-type', 'content');
      expect(sections[6]).toHaveAttribute('data-section-type', 'footer');
    });

    it('should respect custom section order', async () => {
      const contentWithCustomOrder = {
        ...mockLandingContent,
        sections: mockLandingContent.sections.map((section, index) => ({
          ...section,
          order: mockLandingContent.sections.length - index - 1, // Reverse order
        })),
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithCustomOrder,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Our Company')).toBeInTheDocument();
      });

      // Footer should be first now (order 6 reversed to 0)
      const sections = document.querySelectorAll('[data-section-type]');
      expect(sections[0]).toHaveAttribute('data-section-type', 'footer');
    });

    it('should handle sections with same order', async () => {
      const contentWithSameOrder = {
        ...mockLandingContent,
        sections: mockLandingContent.sections.map(section => ({
          ...section,
          order: 0, // All same order
        })),
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithSameOrder,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      });

      // All sections should still render
      expect(screen.getByText('Our Features')).toBeInTheDocument();
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    });
  });

  describe('Enabled/Disabled Sections', () => {
    it('should only render enabled sections', async () => {
      const contentWithDisabledSections = {
        ...mockLandingContent,
        sections: mockLandingContent.sections.map(section => ({
          ...section,
          enabled: section.type === 'hero' || section.type === 'footer',
        })),
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithDisabledSections,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        // Enabled sections should render
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
        expect(screen.getByText('Our Company')).toBeInTheDocument();
        
        // Disabled sections should not render
        expect(screen.queryByText('Our Features')).not.toBeInTheDocument();
        expect(screen.queryByText('Ready to Get Started?')).not.toBeInTheDocument();
        expect(screen.queryByText('What Our Users Say')).not.toBeInTheDocument();
        expect(screen.queryByText('Our Impact')).not.toBeInTheDocument();
        expect(screen.queryByText('About Our Platform')).not.toBeInTheDocument();
      });
    });

    it('should handle all sections disabled', async () => {
      const contentWithAllDisabled = {
        ...mockLandingContent,
        sections: mockLandingContent.sections.map(section => ({
          ...section,
          enabled: false,
        })),
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithAllDisabled,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        // No sections should render
        expect(screen.queryByText('Welcome to Our Platform')).not.toBeInTheDocument();
        expect(screen.queryByText('Our Features')).not.toBeInTheDocument();
        expect(screen.queryByText('Our Company')).not.toBeInTheDocument();
      });
    });

    it('should toggle section visibility correctly', async () => {
      // Test that disabled sections are not rendered
      const updatedContent = {
        ...mockLandingContent,
        sections: mockLandingContent.sections.map(section => ({
          ...section,
          enabled: section.type !== 'features',
        })),
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedContent,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        // Hero should be visible (enabled)
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
        // Features should not be visible (disabled)
        expect(screen.queryByText('Our Features')).not.toBeInTheDocument();
      });
    });
  });

  describe('CTA Link Resolution', () => {
    it('should resolve external URL links correctly', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        // Get all "Get Started" links and find the one in the hero section
        const getStartedLinks = screen.getAllByText('Get Started');
        const heroGetStartedLink = getStartedLinks.find(link => 
          link.closest('[data-section-type="hero"]')
        );
        expect(heroGetStartedLink?.closest('a')).toHaveAttribute('href', '/signup');
      });
    });

    it('should resolve page links correctly', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        const learnMoreLink = screen.getByText('Learn More').closest('a');
        expect(learnMoreLink).toHaveAttribute('href', '/about-us');
      });
    });

    it('should handle CTA links in footer navigation', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        // Get all "About" links and find the one in the footer section
        const aboutLinks = screen.getAllByText('About');
        const footerAboutLink = aboutLinks.find(link => 
          link.closest('[data-section-type="footer"]')
        );
        expect(footerAboutLink?.closest('a')).toHaveAttribute('href', '/about');
        
        // Get all "Contact" links and find the one in the footer section
        const contactLinks = screen.getAllByText('Contact');
        const footerContactLink = contactLinks.find(link => 
          link.closest('[data-section-type="footer"]')
        );
        expect(footerContactLink?.closest('a')).toHaveAttribute('href', '/contact');
      });
    });

    it('should handle external URLs with proper attributes', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        const socialLink = screen.getByText('Our Company')
          .closest('footer')
          ?.querySelector('a[href="https://twitter.com/company"]');
        
        expect(socialLink).toHaveAttribute('target', '_blank');
        expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should handle missing CTA links gracefully', async () => {
      const contentWithMissingLinks = {
        ...mockLandingContent,
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 0,
            data: {
              headline: 'Welcome',
              subheadline: 'Test',
              primaryCta: { text: 'Click', link: '', linkType: 'url' },
              backgroundType: 'solid',
              textAlignment: 'center',
              height: 'medium',
            },
          },
        ],
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithMissingLinks,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const link = screen.getByText('Click').closest('a');
        expect(link).toHaveAttribute('href', '#');
      });
    });

    it('should resolve page links with leading slash', async () => {
      const contentWithSlashLinks = {
        ...mockLandingContent,
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 0,
            data: {
              headline: 'Welcome',
              subheadline: 'Test',
              primaryCta: { text: 'Click', link: '/already-a-path', linkType: 'page' },
              backgroundType: 'solid',
              textAlignment: 'center',
              height: 'medium',
            },
          },
        ],
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithSlashLinks,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const link = screen.getByText('Click').closest('a');
        expect(link).toHaveAttribute('href', '/already-a-path');
      });
    });
  });

  describe('Global Settings Application', () => {
    it('should apply container max width setting', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.max-w-7xl');
        expect(container).toBeInTheDocument();
      });
    });

    it('should apply full max width setting', async () => {
      const contentWithFullWidth = {
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          layout: {
            maxWidth: 'full',
            spacing: 'normal',
          },
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithFullWidth,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.max-w-full');
        expect(container).toBeInTheDocument();
      });
    });

    it('should apply narrow max width setting', async () => {
      const contentWithNarrowWidth = {
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          layout: {
            maxWidth: 'narrow',
            spacing: 'normal',
          },
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithNarrowWidth,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.max-w-4xl');
        expect(container).toBeInTheDocument();
      });
    });

    it('should apply normal spacing setting', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.space-y-16');
        expect(container).toBeInTheDocument();
      });
    });

    it('should apply compact spacing setting', async () => {
      const contentWithCompactSpacing = {
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          layout: {
            maxWidth: 'container',
            spacing: 'compact',
          },
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithCompactSpacing,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.space-y-8');
        expect(container).toBeInTheDocument();
      });
    });

    it('should apply relaxed spacing setting', async () => {
      const contentWithRelaxedSpacing = {
        ...mockLandingContent,
        settings: {
          ...mockLandingContent.settings,
          layout: {
            maxWidth: 'container',
            spacing: 'relaxed',
          },
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithRelaxedSpacing,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        const container = document.querySelector('.space-y-24');
        expect(container).toBeInTheDocument();
      });
    });

    it('should handle missing global settings gracefully', async () => {
      const contentWithoutSettings = {
        ...mockLandingContent,
        settings: undefined,
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => contentWithoutSettings,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should display loading state while fetching', () => {
      vi.mocked(global.fetch).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      render(<LandingPage />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display error state on fetch failure', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Page')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should display error state on non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Page')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch landing page content')).toBeInTheDocument();
      });
    });

    it('should handle missing content gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Page')).toBeInTheDocument();
        expect(screen.getByText('Content not available')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('should render complete landing page with all sections', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        // Verify all sections are present
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
        expect(screen.getByText('Our Features')).toBeInTheDocument();
        expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
        expect(screen.getByText('What Our Users Say')).toBeInTheDocument();
        expect(screen.getByText('Our Impact')).toBeInTheDocument();
        expect(screen.getByText('About Our Platform')).toBeInTheDocument();
        expect(screen.getByText('Our Company')).toBeInTheDocument();
      });
    });

    it('should apply all settings and render all enabled sections in order', async () => {
      render(<LandingPage />);
      
      await waitFor(() => {
        // Check global settings applied
        expect(document.querySelector('.max-w-7xl')).toBeInTheDocument();
        expect(document.querySelector('.space-y-16')).toBeInTheDocument();
        
        // Check sections rendered in order
        const sections = document.querySelectorAll('[data-section-type]');
        expect(sections).toHaveLength(7);
        
        // Check all enabled sections present
        expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
        expect(screen.getByText('Our Features')).toBeInTheDocument();
      });
    });
  });
});
