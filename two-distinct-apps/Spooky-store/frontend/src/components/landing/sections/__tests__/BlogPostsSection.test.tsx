import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BlogPostsSection } from '../BlogPostsSection';
import type { LandingPageSection, BlogPostsSectionData } from '@/types/landing-page';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockBlogPosts = [
  {
    id: '1',
    title: 'Test Blog Post 1',
    slug: 'test-blog-post-1',
    excerpt: 'This is a test excerpt for blog post 1',
    featuredImage: '/images/test1.jpg',
    author: {
      id: 'author1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
    },
    categories: [
      {
        id: 'cat1',
        name: 'Technology',
        slug: 'technology',
      },
    ],
    tags: [
      {
        id: 'tag1',
        name: 'React',
        slug: 'react',
      },
    ],
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Test Blog Post 2',
    slug: 'test-blog-post-2',
    excerpt: 'This is a test excerpt for blog post 2',
    featuredImage: '/images/test2.jpg',
    author: {
      id: 'author2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg',
    },
    categories: [
      {
        id: 'cat2',
        name: 'Design',
        slug: 'design',
      },
    ],
    tags: [],
    publishedAt: '2024-01-16T10:00:00Z',
    createdAt: '2024-01-16T10:00:00Z',
  },
];

describe('BlogPostsSection', () => {
  const mockSectionData: BlogPostsSectionData = {
    title: 'Recent Blog Posts',
    subtitle: 'Check out our latest articles',
    layout: 'grid',
    columns: 3,
    postCount: 6,
    showAuthor: true,
    showDate: true,
    showCategories: true,
    showExcerpt: true,
    ctaText: 'View All Posts',
    ctaLink: '/blog',
  };

  const mockSection: LandingPageSection = {
    id: 'blog-posts-1',
    type: 'blog-posts',
    enabled: true,
    order: 1,
    data: mockSectionData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockBlogPosts,
    });
  });

  it('renders loading state initially', () => {
    render(<BlogPostsSection section={mockSection} />);
    
    // Check for skeleton elements by class name
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders section title and subtitle', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Blog Posts')).toBeInTheDocument();
      expect(screen.getByText('Check out our latest articles')).toBeInTheDocument();
    });
  });

  it('fetches and displays blog posts', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Blog Post 2')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/blog?status=PUBLISHED&limit=6')
    );
  });

  it('displays author information when showAuthor is true', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays date when showDate is true', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/January 16, 2024/)).toBeInTheDocument();
    });
  });

  it('displays categories when showCategories is true', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });
  });

  it('displays excerpt when showExcerpt is true', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('This is a test excerpt for blog post 1')).toBeInTheDocument();
      expect(screen.getByText('This is a test excerpt for blog post 2')).toBeInTheDocument();
    });
  });

  it('hides author when showAuthor is false', async () => {
    const sectionWithoutAuthor: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, showAuthor: false },
    };

    render(<BlogPostsSection section={sectionWithoutAuthor} />);

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('applies category filter to API request', async () => {
    const sectionWithFilter: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, filterByCategory: 'cat1' },
    };

    render(<BlogPostsSection section={sectionWithFilter} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=cat1')
      );
    });
  });

  it('applies tag filter to API request', async () => {
    const sectionWithFilter: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, filterByTag: 'tag1' },
    };

    render(<BlogPostsSection section={sectionWithFilter} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('tag=tag1')
      );
    });
  });

  it('renders CTA button with correct text and link', async () => {
    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      const ctaButton = screen.getByText('View All Posts');
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton.closest('a')).toHaveAttribute('href', '/blog');
    });
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Failed to fetch'));

    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('displays empty state when no posts are returned', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<BlogPostsSection section={mockSection} />);

    await waitFor(() => {
      expect(screen.getByText('No blog posts available yet.')).toBeInTheDocument();
    });
  });

  it('renders in list layout', async () => {
    const listSection: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, layout: 'list' },
    };

    render(<BlogPostsSection section={listSection} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post 1')).toBeInTheDocument();
    });
  });

  it('renders in carousel layout', async () => {
    const carouselSection: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, layout: 'carousel' },
    };

    render(<BlogPostsSection section={carouselSection} />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post 1')).toBeInTheDocument();
    });
  });

  it('respects postCount setting', async () => {
    const sectionWithCount: LandingPageSection = {
      ...mockSection,
      data: { ...mockSectionData, postCount: 3 },
    };

    render(<BlogPostsSection section={sectionWithCount} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=3')
      );
    });
  });
});
