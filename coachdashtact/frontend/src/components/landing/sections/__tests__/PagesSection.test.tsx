import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PagesSection } from '../PagesSection';
import type { LandingPageSection, PagesSectionData, CustomPage } from '@/types/landing-page';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockPages: CustomPage[] = [
  {
    id: '1',
    title: 'About Us',
    slug: 'about',
    content: 'About us content',
    excerpt: 'Learn more about our company',
    featuredImage: '/images/about.jpg',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    showInNavigation: true,
    displayOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Services',
    slug: 'services',
    content: 'Services content',
    excerpt: 'Discover our services',
    featuredImage: '/images/services.jpg',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    showInNavigation: true,
    displayOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Contact',
    slug: 'contact',
    content: 'Contact content',
    excerpt: 'Get in touch with us',
    featuredImage: '/images/contact.jpg',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    showInNavigation: true,
    displayOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('PagesSection', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const createSection = (data: Partial<PagesSectionData> = {}): LandingPageSection => ({
    id: 'pages-1',
    type: 'pages',
    enabled: true,
    order: 1,
    data: {
      title: 'Featured Pages',
      subtitle: 'Explore our content',
      layout: 'grid',
      columns: 3,
      pageCount: 6,
      showExcerpt: true,
      showImage: true,
      ctaText: 'View All Pages',
      ...data,
    } as PagesSectionData,
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    const section = createSection();
    render(<PagesSection section={section} />);
    
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('renders pages successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection();
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  it('renders section title and subtitle', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({
      title: 'Our Pages',
      subtitle: 'Check out our content',
    });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Our Pages')).toBeInTheDocument();
      expect(screen.getByText('Check out our content')).toBeInTheDocument();
    });
  });

  it('renders page excerpts when showExcerpt is true', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ showExcerpt: true });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Learn more about our company')).toBeInTheDocument();
      expect(screen.getByText('Discover our services')).toBeInTheDocument();
    });
  });

  it('hides excerpts when showExcerpt is false', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ showExcerpt: false });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.queryByText('Learn more about our company')).not.toBeInTheDocument();
    });
  });

  it('renders featured images when showImage is true', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ showImage: true });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('alt', 'About Us');
    });
  });

  it('renders CTA button with correct text', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ ctaText: 'See All Pages' });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('See All Pages')).toBeInTheDocument();
    });
  });

  it('renders empty state when no pages available', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const section = createSection();
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('No pages available yet.')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const section = createSection();
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load pages/i)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('fetches pages with correct query parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({
      pageCount: 9,
      filterByParent: 'parent-123',
    });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=PUBLISHED')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('visibility=PUBLIC')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=9')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('parentPageId=parent-123')
      );
    });
  });

  it('renders grid layout correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ layout: 'grid', columns: 3 });
    const { container } = render(<PagesSection section={section} />);

    await waitFor(() => {
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  it('renders list layout correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection({ layout: 'list' });
    const { container } = render(<PagesSection section={section} />);

    await waitFor(() => {
      const listContainer = container.querySelector('.space-y-6');
      expect(listContainer).toBeInTheDocument();
    });
  });

  it('renders correct number of pages based on pageCount', async () => {
    const limitedPages = mockPages.slice(0, 2);
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => limitedPages,
    });

    const section = createSection({ pageCount: 3 });
    render(<PagesSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.queryByText('Contact')).not.toBeInTheDocument();
    });
  });

  it('renders Learn More links with correct hrefs', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection();
    render(<PagesSection section={section} />);

    await waitFor(() => {
      const links = screen.getAllByText('Learn More');
      expect(links[0].closest('a')).toHaveAttribute('href', '/about');
      expect(links[1].closest('a')).toHaveAttribute('href', '/services');
      expect(links[2].closest('a')).toHaveAttribute('href', '/contact');
    });
  });

  it('applies correct maxWidth class', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPages,
    });

    const section = createSection();
    const { container } = render(<PagesSection section={section} maxWidth="narrow" />);

    await waitFor(() => {
      const sectionElement = container.querySelector('.max-w-4xl');
      expect(sectionElement).toBeInTheDocument();
    });
  });
});
