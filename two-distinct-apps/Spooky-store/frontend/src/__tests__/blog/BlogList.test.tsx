/**
 * BlogList Component Tests
 * 
 * Tests for the blog list component including:
 * - Blog posts rendering
 * - Pagination
 * - Category filtering
 * - Tag filtering
 * - Loading states
 * - Error handling
 * - Empty states
 * 
 * Requirements: 4.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlogList } from '@/components/blog/BlogList';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostStatus } from '@/types/blog';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock features config
vi.mock('@/config/features.config', () => ({
  featuresConfig: {
    blog: {
      enabled: true,
      postsPerPage: 10,
      enableCategories: true,
      enableTags: true,
    },
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

// Mock search params
const mockSearchParams = {
  get: vi.fn(),
  toString: vi.fn(() => ''),
};

// Mock blog posts
const mockPosts = [
  {
    id: 'post-1',
    title: 'First Blog Post',
    slug: 'first-blog-post',
    excerpt: 'This is the first post',
    content: 'Content 1',
    featuredImage: '/image1.jpg',
    status: PostStatus.PUBLISHED,
    publishedAt: new Date().toISOString(),
    categories: [{ id: 'cat-1', name: 'Technology', slug: 'technology' }],
    tags: [{ id: 'tag-1', name: 'React', slug: 'react' }],
    author: { name: 'Author 1' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    title: 'Second Blog Post',
    slug: 'second-blog-post',
    excerpt: 'This is the second post',
    content: 'Content 2',
    featuredImage: '/image2.jpg',
    status: PostStatus.PUBLISHED,
    publishedAt: new Date().toISOString(),
    categories: [{ id: 'cat-2', name: 'Design', slug: 'design' }],
    tags: [{ id: 'tag-2', name: 'TypeScript', slug: 'typescript' }],
    author: { name: 'Author 2' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Technology', slug: 'technology', _count: { posts: 5 } },
  { id: 'cat-2', name: 'Design', slug: 'design', _count: { posts: 3 } },
];

const mockTags = [
  { id: 'tag-1', name: 'React', slug: 'react', _count: { posts: 4 } },
  { id: 'tag-2', name: 'TypeScript', slug: 'typescript', _count: { posts: 6 } },
];

const mockResponse = {
  posts: mockPosts,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
};

describe('BlogList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue(null);
    
    // Setup default fetch mocks
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/blog/categories/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        });
      }
      if (url.includes('/blog/tags/all')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTags,
        });
      }
      if (url.includes('/blog?')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  describe('Blog Posts Rendering', () => {
    it('should render blog posts', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('First Blog Post')).toBeInTheDocument();
        expect(screen.getByText('Second Blog Post')).toBeInTheDocument();
      });
    });

    it('should render blog post excerpts', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('This is the first post')).toBeInTheDocument();
        expect(screen.getByText('This is the second post')).toBeInTheDocument();
      });
    });

    it('should render blog post categories', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
      });
    });

    it('should render blog post tags', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('#React')).toBeInTheDocument();
        expect(screen.getByText('#TypeScript')).toBeInTheDocument();
      });
    });

    it('should render author names', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Author 1')).toBeInTheDocument();
        expect(screen.getByText('Author 2')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should render category filter dropdown', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/filter by category/i)).toBeInTheDocument();
      });
    });

    it('should render tag filter dropdown', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/filter by tag/i)).toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'category') return 'technology';
        return null;
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('category=technology')
        );
      });
    });

    it('should filter by tag', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'tag') return 'react';
        return null;
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('tag=react')
        );
      });
    });

    it('should show active filters', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'category') return 'technology';
        if (key === 'tag') return 'react';
        return null;
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/category: technology/i)).toBeInTheDocument();
        expect(screen.getByText(/tag: react/i)).toBeInTheDocument();
      });
    });

    it('should show clear filters button when filters are active', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'category') return 'technology';
        return null;
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
      });
    });

    it('should clear filters when clear button is clicked', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'category') return 'technology';
        return null;
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear filters/i });
        fireEvent.click(clearButton);
      });
      
      expect(mockPush).toHaveBeenCalledWith('/blog');
    });
  });

  describe('Pagination', () => {
    it('should render pagination when multiple pages exist', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              posts: mockPosts,
              pagination: {
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3,
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });
    });

    it('should not render pagination when only one page exists', async () => {
      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
      });
    });

    it('should fetch correct page', async () => {
      render(<BlogList page={2} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while fetching', async () => {
      let resolveFetch: ((value: Response) => void) | undefined;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return fetchPromise;
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Resolve the promise
      resolveFetch?.({
        ok: true,
        json: async () => mockResponse,
      } as Response);
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Failed to fetch' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load blog posts/i)).toBeInTheDocument();
      });
    });

    it('should show try again button on error', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Error' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no posts exist', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              posts: [],
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/no blog posts found/i)).toBeInTheDocument();
      });
    });

    it('should show filtered empty state when no posts match filters', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'category') return 'technology';
        return null;
      });

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (url.includes('/blog?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              posts: [],
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogList page={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/no blog posts found matching your filters/i)).toBeInTheDocument();
      });
    });
  });
});
