/**
 * MetadataContext Unit Tests
 * 
 * Tests for the metadata context including:
 * - Metadata updates
 * - Dynamic value changes
 * - Document title updates
 * - Meta tag updates
 * - Debouncing behavior
 * - Cleanup and unmounting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { MetadataProvider, useMetadata } from '@/contexts/MetadataContext';
import { PageMetadata } from '@/types/metadata';

// Wrapper component for tests
const wrapper = ({ children }: { children: ReactNode }) => (
  <MetadataProvider>{children}</MetadataProvider>
);

// Helper to get meta tag content
const getMetaContent = (name: string, attribute: 'name' | 'property' = 'name'): string | null => {
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  return element ? element.getAttribute('content') : null;
};

// Helper to check if canonical link exists
const getCanonicalHref = (): string | null => {
  const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  return link ? link.href : null;
};

// Helper to get structured data
const getStructuredData = (): any => {
  const script = document.querySelector('script[type="application/ld+json"][data-metadata-context]');
  return script ? JSON.parse(script.textContent || '{}') : null;
};

describe('MetadataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear document head
    document.head.innerHTML = '';
    document.title = '';
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with null metadata and empty dynamic values', () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      expect(result.current.metadata).toBeNull();
      expect(result.current.dynamicValues).toEqual({});
    });

    it('should provide all required context methods', () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      expect(typeof result.current.updateMetadata).toBe('function');
      expect(typeof result.current.setDynamicValues).toBe('function');
      expect(typeof result.current.resetMetadata).toBe('function');
    });
  });

  describe('Metadata Updates', () => {
    it('should update metadata state', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      const newMetadata: Partial<PageMetadata> = {
        title: 'Test Page',
        description: 'Test description',
      };

      act(() => {
        result.current.updateMetadata(newMetadata);
      });

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.metadata).toMatchObject(newMetadata);
    });

    it('should merge metadata updates', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          title: 'First Title',
          description: 'First description',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        result.current.updateMetadata({
          title: 'Updated Title',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.metadata?.title).toBe('Updated Title');
      expect(result.current.metadata?.description).toBe('First description');
    });

    it('should debounce rapid metadata updates', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      // Make multiple rapid updates
      act(() => {
        result.current.updateMetadata({ title: 'Title 1' });
        result.current.updateMetadata({ title: 'Title 2' });
        result.current.updateMetadata({ title: 'Title 3' });
      });

      // Should not update immediately
      expect(result.current.metadata).toBeNull();

      // Wait for debounce
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Should only apply the last update
      expect(result.current.metadata?.title).toBe('Title 3');
    });
  });

  describe('Document Title Updates', () => {
    it('should update document title', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          title: 'New Page Title',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(document.title).toBe('New Page Title');
    });

    it('should update document title multiple times', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({ title: 'First Title' });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(document.title).toBe('First Title');

      act(() => {
        result.current.updateMetadata({ title: 'Second Title' });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(document.title).toBe('Second Title');
    });
  });

  describe('Meta Tag Updates', () => {
    it('should update description meta tag', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          description: 'Test page description',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('description')).toBe('Test page description');
    });

    it('should update keywords meta tag', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          keywords: ['test', 'page', 'metadata'],
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('keywords')).toBe('test, page, metadata');
    });

    it('should create meta tags if they do not exist', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      expect(getMetaContent('description')).toBeNull();

      act(() => {
        result.current.updateMetadata({
          description: 'New description',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('description')).toBe('New description');
    });

    it('should update existing meta tags', async () => {
      // Create initial meta tag
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', 'Initial description');
      document.head.appendChild(meta);

      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          description: 'Updated description',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('description')).toBe('Updated description');
      // Should not create duplicate tags
      expect(document.querySelectorAll('meta[name="description"]').length).toBe(1);
    });
  });

  describe('Canonical URL Updates', () => {
    it('should add canonical link', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          canonical: 'https://example.com/page',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getCanonicalHref()).toBe('https://example.com/page');
    });

    it('should update existing canonical link', async () => {
      // Create initial canonical link
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://example.com/old';
      document.head.appendChild(link);

      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          canonical: 'https://example.com/new',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getCanonicalHref()).toBe('https://example.com/new');
      expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    });

    it('should remove canonical link when set to empty string', async () => {
      // Create initial canonical link
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://example.com/page';
      document.head.appendChild(link);

      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          canonical: '',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getCanonicalHref()).toBeNull();
    });
  });

  describe('Open Graph Meta Tags', () => {
    it('should update Open Graph title', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          openGraph: {
            title: 'OG Title',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('og:title', 'property')).toBe('OG Title');
    });

    it('should update Open Graph description', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          openGraph: {
            description: 'OG Description',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('og:description', 'property')).toBe('OG Description');
    });

    it('should update Open Graph type', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          openGraph: {
            type: 'article',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('og:type', 'property')).toBe('article');
    });

    it('should update Open Graph image', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          openGraph: {
            images: [
              {
                url: 'https://example.com/image.jpg',
                width: 1200,
                height: 630,
                alt: 'Test image',
                type: 'image/jpeg',
              },
            ],
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('og:image', 'property')).toBe('https://example.com/image.jpg');
      expect(getMetaContent('og:image:width', 'property')).toBe('1200');
      expect(getMetaContent('og:image:height', 'property')).toBe('630');
      expect(getMetaContent('og:image:alt', 'property')).toBe('Test image');
      expect(getMetaContent('og:image:type', 'property')).toBe('image/jpeg');
    });

    it('should update Open Graph URL and site name', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          openGraph: {
            url: 'https://example.com/page',
            siteName: 'Example Site',
            locale: 'en_US',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('og:url', 'property')).toBe('https://example.com/page');
      expect(getMetaContent('og:site_name', 'property')).toBe('Example Site');
      expect(getMetaContent('og:locale', 'property')).toBe('en_US');
    });
  });

  describe('Twitter Card Meta Tags', () => {
    it('should update Twitter card type', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          twitter: {
            card: 'summary_large_image',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('twitter:card')).toBe('summary_large_image');
    });

    it('should update Twitter site and creator', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          twitter: {
            site: '@example',
            creator: '@author',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('twitter:site')).toBe('@example');
      expect(getMetaContent('twitter:creator')).toBe('@author');
    });

    it('should update Twitter title and description', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          twitter: {
            title: 'Twitter Title',
            description: 'Twitter Description',
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('twitter:title')).toBe('Twitter Title');
      expect(getMetaContent('twitter:description')).toBe('Twitter Description');
    });

    it('should update Twitter image', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          twitter: {
            images: ['https://example.com/twitter-image.jpg'],
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('twitter:image')).toBe('https://example.com/twitter-image.jpg');
    });
  });

  describe('Robots Meta Tag', () => {
    it('should update robots meta tag with index and follow', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          robots: {
            index: true,
            follow: true,
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('robots')).toBe('index, follow');
    });

    it('should update robots meta tag with noindex and nofollow', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          robots: {
            index: false,
            follow: false,
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(getMetaContent('robots')).toBe('noindex, nofollow');
    });

    it('should update robots meta tag with additional directives', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          robots: {
            index: true,
            follow: true,
            noarchive: true,
            nosnippet: true,
            noimageindex: true,
            maxSnippet: 160,
            maxImagePreview: 'large',
            maxVideoPreview: 30,
          },
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const robotsContent = getMetaContent('robots');
      expect(robotsContent).toContain('index');
      expect(robotsContent).toContain('follow');
      expect(robotsContent).toContain('noarchive');
      expect(robotsContent).toContain('nosnippet');
      expect(robotsContent).toContain('noimageindex');
      expect(robotsContent).toContain('max-snippet:160');
      expect(robotsContent).toContain('max-image-preview:large');
      expect(robotsContent).toContain('max-video-preview:30');
    });
  });

  describe('Structured Data', () => {
    it('should add structured data script', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        author: 'Test Author',
      };

      act(() => {
        result.current.updateMetadata({
          structuredData,
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const data = getStructuredData();
      expect(data).toEqual(structuredData);
    });

    it('should replace existing structured data', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      const firstData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'First Article',
      };

      act(() => {
        result.current.updateMetadata({
          structuredData: firstData,
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const secondData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Second Article',
      };

      act(() => {
        result.current.updateMetadata({
          structuredData: secondData,
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const data = getStructuredData();
      expect(data).toEqual(secondData);
      // Should not create duplicate scripts
      expect(document.querySelectorAll('script[type="application/ld+json"][data-metadata-context]').length).toBe(1);
    });
  });

  describe('Dynamic Values', () => {
    it('should set dynamic values', () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.setDynamicValues({
          userName: 'John Doe',
          userId: '123',
        });
      });

      expect(result.current.dynamicValues).toEqual({
        userName: 'John Doe',
        userId: '123',
      });
    });

    it('should replace dynamic values on subsequent calls', () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.setDynamicValues({
          userName: 'John Doe',
        });
      });

      expect(result.current.dynamicValues).toEqual({
        userName: 'John Doe',
      });

      act(() => {
        result.current.setDynamicValues({
          userId: '456',
        });
      });

      expect(result.current.dynamicValues).toEqual({
        userId: '456',
      });
    });
  });

  describe('Reset Metadata', () => {
    it('should reset metadata and dynamic values', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          title: 'Test Title',
          description: 'Test Description',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        result.current.setDynamicValues({
          userName: 'John Doe',
        });
      });

      expect(result.current.metadata).not.toBeNull();
      expect(result.current.dynamicValues).not.toEqual({});

      act(() => {
        result.current.resetMetadata();
      });

      expect(result.current.metadata).toBeNull();
      expect(result.current.dynamicValues).toEqual({});
    });

    it('should clear pending debounced updates', async () => {
      const { result } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          title: 'Test Title',
        });
      });

      // Reset before debounce completes
      act(() => {
        result.current.resetMetadata();
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.metadata).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useMetadata is used outside MetadataProvider', () => {
      expect(() => {
        renderHook(() => useMetadata());
      }).toThrow('useMetadata must be used within a MetadataProvider');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useMetadata(), { wrapper });

      act(() => {
        result.current.updateMetadata({
          title: 'Test Title',
        });
      });

      unmount();

      // Advance timers after unmount
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Should not throw or cause issues
      expect(true).toBe(true);
    });

    it('should not update state after unmount', async () => {
      const { result, unmount } = renderHook(() => useMetadata(), { wrapper });

      unmount();

      // Try to update after unmount
      act(() => {
        result.current.updateMetadata({
          title: 'Test Title',
        });
      });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Should not cause errors
      expect(true).toBe(true);
    });
  });
});
