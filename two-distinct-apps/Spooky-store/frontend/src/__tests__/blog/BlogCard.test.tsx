/**
 * BlogCard Component Tests
 * 
 * Tests for the blog card component including:
 * - Content rendering
 * - Image display
 * - Author information
 * - Date formatting
 * - Categories and tags
 * - Link navigation
 * 
 * Requirements: 4.1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogCard } from '@/components/blog/BlogCard';
import { PostStatus } from '@/types/blog';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const mockPost = {
  id: 'post-1',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test excerpt for the blog post',
  content: 'Full content here',
  featuredImage: '/test-image.jpg',
  status: PostStatus.PUBLISHED,
  publishedAt: '2024-01-15T10:00:00.000Z',
  categories: [
    { id: 'cat-1', name: 'Technology', slug: 'technology' },
    { id: 'cat-2', name: 'Design', slug: 'design' },
  ],
  tags: [
    { id: 'tag-1', name: 'React', slug: 'react' },
    { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
  ],
  author: { name: 'John Doe' },
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

describe('BlogCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Content Rendering', () => {
    it('should render blog post title', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    it('should render blog post excerpt', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('This is a test excerpt for the blog post')).toBeInTheDocument();
    });

    it('should render without excerpt if not provided', () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: null };
      render(<BlogCard post={postWithoutExcerpt} />);
      
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      expect(screen.queryByText(/excerpt/i)).not.toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('should render featured image when provided', () => {
      render(<BlogCard post={mockPost} />);
      
      const image = screen.getByAltText('Test Blog Post');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    it('should not render image container when no featured image', () => {
      const postWithoutImage = { ...mockPost, featuredImage: null };
      render(<BlogCard post={postWithoutImage} />);
      
      expect(screen.queryByAltText('Test Blog Post')).not.toBeInTheDocument();
    });
  });

  describe('Author Information', () => {
    it('should render author name from author object', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render author name from authorName field', () => {
      const postWithAuthorName = {
        ...mockPost,
        author: null,
        authorName: 'Jane Smith',
      };
      render(<BlogCard post={postWithAuthorName} />);
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render "Anonymous" when no author information', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: null,
        authorName: null,
      };
      render(<BlogCard post={postWithoutAuthor} />);
      
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should render formatted publish date', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    });

    it('should render date with proper time element', () => {
      render(<BlogCard post={mockPost} />);
      
      const timeElement = screen.getByText('January 15, 2024').closest('time');
      expect(timeElement).toHaveAttribute('dateTime', '2024-01-15T10:00:00.000Z');
    });

    it('should not render date when publishedAt is null', () => {
      const postWithoutDate = { ...mockPost, publishedAt: null };
      render(<BlogCard post={postWithoutDate} />);
      
      expect(screen.queryByText(/january/i)).not.toBeInTheDocument();
    });
  });

  describe('Categories and Tags', () => {
    it('should render all categories', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('should render all tags with hashtag', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByText('#React')).toBeInTheDocument();
      expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    });

    it('should not render categories section when empty', () => {
      const postWithoutCategories = { ...mockPost, categories: [] };
      render(<BlogCard post={postWithoutCategories} />);
      
      expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    });

    it('should not render tags section when empty', () => {
      const postWithoutTags = { ...mockPost, tags: [] };
      render(<BlogCard post={postWithoutTags} />);
      
      expect(screen.queryByText('#React')).not.toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should link to blog post detail page', () => {
      render(<BlogCard post={mockPost} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/blog/test-blog-post');
    });

    it('should have hover effects on card', () => {
      render(<BlogCard post={mockPost} />);
      
      const card = screen.getByText('Test Blog Post').closest('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<BlogCard post={mockPost} />);
      
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have descriptive image alt text', () => {
      render(<BlogCard post={mockPost} />);
      
      const image = screen.getByAltText('Test Blog Post');
      expect(image).toBeInTheDocument();
    });
  });
});
