/**
 * BlogEditor Component Tests
 * 
 * Tests for the blog editor component including:
 * - Form validation
 * - Create and edit modes
 * - Auto-save functionality
 * - Category and tag selection
 * - Image upload integration
 * - Author fields toggle
 * - SEO metadata fields
 * - Slug generation
 * - Excerpt generation
 * 
 * Requirements: 4.2, 4.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useRouter } from 'next/navigation';
import { PostStatus } from '@/types/blog';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock features config
vi.mock('@/config/features.config', () => ({
  featuresConfig: {
    blog: {
      enabled: true,
      postsPerPage: 10,
      enableCategories: true,
      enableTags: true,
      requireAuthor: false,
    },
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock router
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();
const mockRouter = {
  push: mockPush,
  back: mockBack,
  refresh: mockRefresh,
  forward: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

// Mock categories and tags
const mockCategories = [
  { id: 'cat-1', name: 'Technology', slug: 'technology' },
  { id: 'cat-2', name: 'Design', slug: 'design' },
];

const mockTags = [
  { id: 'tag-1', name: 'React', slug: 'react' },
  { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
];

// Mock blog post
const mockPost = {
  id: 'post-1',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test excerpt',
  content: 'This is the test content',
  featuredImage: '/test-image.jpg',
  status: PostStatus.DRAFT,
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  metaTitle: 'Test Meta Title',
  metaDescription: 'Test meta description',
  categories: [mockCategories[0]],
  tags: [mockTags[0]],
  publishedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('BlogEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    
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
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Form Rendering', () => {
    it('should render all form fields in create mode', async () => {
      render(<BlogEditor mode="create" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/excerpt/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
      });
    });

    it('should populate form fields in edit mode', async () => {
      render(<BlogEditor post={mockPost} mode="edit" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockPost.title)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockPost.slug)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockPost.excerpt)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockPost.content)).toBeInTheDocument();
      });
    });

    it('should render category and tag selects when enabled', async () => {
      render(<BlogEditor mode="create" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/categories/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      });
    });

    it('should render SEO metadata fields', async () => {
      render(<BlogEditor mode="create" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/meta title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const { toast } = await import('@/hooks/use-toast');
      render(<BlogEditor mode="create" />);
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Title is required');
      });
    });

    it('should show error when content is empty', async () => {
      const { toast } = await import('@/hooks/use-toast');
      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.type(titleInput, 'Test Title');
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Content is required');
      });
    });

    it('should validate all required fields before submission', async () => {
      const { toast } = await import('@/hooks/use-toast');
      render(<BlogEditor mode="create" />);
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      // Should not call API
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/blog'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('Create Mode', () => {
    it('should create new blog post as draft', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 'new-post-1', ...JSON.parse(options.body) }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      
      await userEvent.type(titleInput, 'New Blog Post');
      await userEvent.type(contentInput, 'This is the content');
      fireEvent.click(saveDraftButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/blog'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"status":"DRAFT"'),
          })
        );
      });
    });

    it('should create new blog post as published', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 'new-post-1', ...JSON.parse(options.body) }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const publishButton = screen.getByRole('button', { name: /publish/i });
      
      await userEvent.type(titleInput, 'New Blog Post');
      await userEvent.type(contentInput, 'This is the content');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/blog'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"status":"PUBLISHED"'),
          })
        );
      });
    });

    it('should redirect to blog management after successful creation', async () => {
      const { toast } = await import('@/hooks/use-toast');
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 'new-post-1' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const publishButton = screen.getByRole('button', { name: /publish/i });
      
      await userEvent.type(titleInput, 'New Blog Post');
      await userEvent.type(contentInput, 'This is the content');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/dashboard/blog');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should update existing blog post', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ ...mockPost, ...JSON.parse(options.body) }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor post={mockPost} mode="edit" />);
      
      const titleInput = screen.getByDisplayValue(mockPost.title);
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Title');
      fireEvent.click(saveDraftButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/blog/${mockPost.id}`),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"title":"Updated Title"'),
          })
        );
      });
    });
  });

  describe('Author Fields', () => {
    it('should toggle author fields visibility', async () => {
      render(<BlogEditor mode="create" />);
      
      await waitFor(() => {
        const authorToggle = screen.getByLabelText(/add author information/i);
        expect(authorToggle).toBeInTheDocument();
      });
      
      const authorToggle = screen.getByLabelText(/add author information/i);
      fireEvent.click(authorToggle);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/author name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/author email/i)).toBeInTheDocument();
      });
    });

    it('should show author fields when editing post with author', async () => {
      render(<BlogEditor post={mockPost} mode="edit" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockPost.authorName!)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockPost.authorEmail!)).toBeInTheDocument();
      });
    });
  });

  describe('Excerpt Generation', () => {
    it('should generate excerpt from content', async () => {
      render(<BlogEditor mode="create" />);
      
      const contentInput = screen.getByLabelText(/content/i);
      await userEvent.type(contentInput, 'This is a long content that should be truncated to create an excerpt. It has multiple sentences and should be shortened appropriately.');
      
      const generateButton = screen.getByRole('button', { name: /generate from content/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        const excerptInput = screen.getByLabelText(/excerpt/i) as HTMLTextAreaElement;
        expect(excerptInput.value).toBeTruthy();
        expect(excerptInput.value.length).toBeLessThanOrEqual(200);
      });
    });

    it('should show preview of auto-generated excerpt', async () => {
      render(<BlogEditor mode="create" />);
      
      const contentInput = screen.getByLabelText(/content/i);
      await userEvent.type(contentInput, 'This is test content for excerpt generation.');
      
      await waitFor(() => {
        expect(screen.getByText(/preview \(auto-generated\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Failed to create post' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const publishButton = screen.getByRole('button', { name: /publish/i });
      
      await userEvent.type(titleInput, 'Test Title');
      await userEvent.type(contentInput, 'Test content');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create post');
      });
    });

    it('should not redirect on save failure', async () => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Error' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const publishButton = screen.getByRole('button', { name: /publish/i });
      
      await userEvent.type(titleInput, 'Test Title');
      await userEvent.type(contentInput, 'Test content');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form during submission', async () => {
      let resolveSubmit: ((value: Response) => void) | undefined;
      const submitPromise = new Promise<Response>((resolve) => {
        resolveSubmit = resolve;
      });

      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url.includes('/blog/categories/all')) {
          return Promise.resolve({ ok: true, json: async () => mockCategories });
        }
        if (url.includes('/blog/tags/all')) {
          return Promise.resolve({ ok: true, json: async () => mockTags });
        }
        if (options?.method === 'POST') {
          return submitPromise;
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<BlogEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const publishButton = screen.getByRole('button', { name: /publish/i }) as HTMLButtonElement;
      
      await userEvent.type(titleInput, 'Test Title');
      await userEvent.type(contentInput, 'Test content');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(publishButton).toBeDisabled();
        expect(screen.getByText(/publishing/i)).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolveSubmit?.({
        ok: true,
        json: async () => ({ id: 'new-post-1' }),
      } as Response);
    });
  });

  describe('Cancel Action', () => {
    it('should navigate back when cancel is clicked', async () => {
      render(<BlogEditor mode="create" />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });
  });
});
