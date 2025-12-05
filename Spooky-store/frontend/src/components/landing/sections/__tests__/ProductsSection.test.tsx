import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductsSection } from '../ProductsSection';
import type { LandingPageSection } from '@/types/landing-page';

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

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    slug: 'product-1',
    description: 'Description 1',
    price: 100,
    salePrice: 80,
    images: ['https://example.com/image1.jpg'],
    category: { id: 'cat1', name: 'Category 1', slug: 'category-1' },
    tags: [{ id: 'tag1', name: 'Tag 1' }],
    rating: 4.5,
    reviewCount: 10,
    stock: 5,
    inStock: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Product 2',
    slug: 'product-2',
    description: 'Description 2',
    price: 200,
    salePrice: null,
    images: ['https://example.com/image2.jpg'],
    category: { id: 'cat2', name: 'Category 2', slug: 'category-2' },
    tags: [],
    rating: 5,
    reviewCount: 20,
    stock: 0,
    inStock: false,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

describe('ProductsSection', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const createSection = (overrides = {}): LandingPageSection => ({
    id: 'products-1',
    type: 'products',
    enabled: true,
    order: 1,
    data: {
      title: 'Featured Products',
      subtitle: 'Check out our products',
      layout: 'grid',
      columns: 3,
      productCount: 6,
      showPrice: true,
      showRating: true,
      showStock: true,
      ctaText: 'Add to Cart',
      ...overrides,
    },
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    const section = createSection();
    render(<ProductsSection section={section} />);
    
    // Check for skeleton elements by their data-slot attribute
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders products after successful fetch', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection();
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('renders section title and subtitle', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({
      title: 'Our Products',
      subtitle: 'Best sellers',
    });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('Best sellers')).toBeInTheDocument();
    });
  });

  it('displays price when showPrice is true', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({ showPrice: true });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('$80.00')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  it('displays sale badge for discounted products', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection();
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('-20% OFF')).toBeInTheDocument();
    });
  });

  it('displays stock status when showStock is true', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({ showStock: true });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText(/In Stock \(5 available\)/)).toBeInTheDocument();
      expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    });
  });

  it('displays rating when showRating is true', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({ showRating: true });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('(10)')).toBeInTheDocument();
      expect(screen.getByText('(20)')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const section = createSection();
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('renders empty state when no products', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const section = createSection();
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('No products available yet.')).toBeInTheDocument();
    });
  });

  it('applies category filter to API request', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });
    global.fetch = fetchMock;

    const section = createSection({ filterByCategory: 'cat1' });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('category=cat1')
      );
    });
  });

  it('applies tag filter to API request', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });
    global.fetch = fetchMock;

    const section = createSection({ filterByTag: 'tag1' });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('tag=tag1')
      );
    });
  });

  it('renders featured layout with large first product', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({ layout: 'featured' });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      // Check for product cards by data-slot
      const cards = document.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(2);
    });
  });

  it('renders carousel layout', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection({ layout: 'carousel' });
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  it('disables add to cart button for out of stock products', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const section = createSection();
    render(<ProductsSection section={section} />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /Add to Cart|Out of Stock/ });
      const outOfStockButton = buttons.find(btn => btn.textContent === 'Out of Stock');
      expect(outOfStockButton).toBeDisabled();
    });
  });
});
