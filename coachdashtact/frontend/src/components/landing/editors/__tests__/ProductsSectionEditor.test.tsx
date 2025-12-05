import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductsSectionEditor } from '../ProductsSectionEditor';
import type { ProductsSectionData } from '@/types/landing-page';

const mockCategories = [
  { id: 'cat1', name: 'Category 1', slug: 'category-1' },
  { id: 'cat2', name: 'Category 2', slug: 'category-2' },
];

const mockTags = [
  { id: 'tag1', name: 'Tag 1' },
  { id: 'tag2', name: 'Tag 2' },
];

describe('ProductsSectionEditor', () => {
  const defaultData: ProductsSectionData = {
    title: 'Featured Products',
    subtitle: 'Check out our products',
    layout: 'grid',
    columns: 3,
    productCount: 6,
    showPrice: true,
    showRating: true,
    showStock: true,
    ctaText: 'Add to Cart',
  };

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders all form fields with initial data', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText(/Section Title/i)).toHaveValue('Featured Products');
    expect(screen.getByLabelText(/Subtitle/i)).toHaveValue('Check out our products');
    expect(screen.getByLabelText(/Button Text/i)).toHaveValue('Add to Cart');
  });

  it('fetches categories on mount', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });
    global.fetch = fetchMock;

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/products/categories')
      );
    });
  });

  it('fetches tags on mount', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });
    global.fetch = fetchMock;

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/products/tags')
      );
    });
  });

  it('updates title field', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(titleInput).toHaveValue('New Title');
  });

  it('updates subtitle field', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const subtitleInput = screen.getByLabelText(/Subtitle/i);
    fireEvent.change(subtitleInput, { target: { value: 'New Subtitle' } });

    expect(subtitleInput).toHaveValue('New Subtitle');
  });

  it('toggles showPrice switch', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const showPriceSwitch = screen.getByRole('switch', { name: /Show Price/i });
    expect(showPriceSwitch).toBeChecked();

    fireEvent.click(showPriceSwitch);
    expect(showPriceSwitch).not.toBeChecked();
  });

  it('toggles showRating switch', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const showRatingSwitch = screen.getByRole('switch', { name: /Show Rating/i });
    expect(showRatingSwitch).toBeChecked();

    fireEvent.click(showRatingSwitch);
    expect(showRatingSwitch).not.toBeChecked();
  });

  it('toggles showStock switch', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const showStockSwitch = screen.getByRole('switch', { name: /Show Stock Status/i });
    expect(showStockSwitch).toBeChecked();

    fireEvent.click(showStockSwitch);
    expect(showStockSwitch).not.toBeChecked();
  });

  it('calls onSave with updated data when save button is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('handles layout selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Layout select is rendered
    expect(screen.getByLabelText(/Layout/i)).toBeInTheDocument();
  });

  it('handles columns selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Columns select is rendered
    expect(screen.getByLabelText(/Columns/i)).toBeInTheDocument();
  });

  it('handles product count selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Product count select is rendered
    expect(screen.getByLabelText(/Number of Products/i)).toBeInTheDocument();
  });

  it('handles category filter selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Filter by Category/i)).toBeInTheDocument();
    });
  });

  it('handles tag filter selection', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Filter by Tag/i)).toBeInTheDocument();
    });
  });

  it('handles CTA text update', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCategories })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTags });

    render(
      <ProductsSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const ctaInput = screen.getByLabelText(/Button Text/i);
    fireEvent.change(ctaInput, { target: { value: 'Buy Now' } });

    expect(ctaInput).toHaveValue('Buy Now');
  });
});
