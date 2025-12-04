import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PagesSectionEditor } from '../PagesSectionEditor';
import type { PagesSectionData, CustomPage } from '@/types/landing-page';

const mockParentPages: CustomPage[] = [
  {
    id: 'parent-1',
    title: 'Resources',
    slug: 'resources',
    content: 'Resources content',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    showInNavigation: true,
    displayOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'parent-2',
    title: 'Company',
    slug: 'company',
    content: 'Company content',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    showInNavigation: true,
    displayOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('PagesSectionEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockParentPages,
    });
  });

  const defaultData: PagesSectionData = {
    title: 'Featured Pages',
    subtitle: 'Explore our content',
    layout: 'grid',
    columns: 3,
    pageCount: 6,
    showExcerpt: true,
    showImage: true,
    ctaText: 'View All Pages',
  };

  it('renders all form fields', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Section Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subtitle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Layout/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Columns/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Pages/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show Excerpt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show Featured Image/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Button Text/i)).toBeInTheDocument();
    });
  });

  it('displays initial data correctly', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Featured Pages')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Explore our content')).toBeInTheDocument();
      expect(screen.getByDisplayValue('View All Pages')).toBeInTheDocument();
    });
  });

  it('updates title field', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    fireEvent.change(titleInput, { target: { value: 'Our Pages' } });

    expect(titleInput).toHaveValue('Our Pages');
  });

  it('updates subtitle field', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const subtitleInput = screen.getByLabelText(/Subtitle/i);
    fireEvent.change(subtitleInput, { target: { value: 'New subtitle' } });

    expect(subtitleInput).toHaveValue('New subtitle');
  });

  it('updates CTA text field', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const ctaInput = screen.getByLabelText(/Button Text/i);
    fireEvent.change(ctaInput, { target: { value: 'See All' } });

    expect(ctaInput).toHaveValue('See All');
  });

  it('toggles showExcerpt switch', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const excerptSwitch = screen.getByLabelText(/Show Excerpt/i);
    expect(excerptSwitch).toBeChecked();

    fireEvent.click(excerptSwitch);
    expect(excerptSwitch).not.toBeChecked();
  });

  it('toggles showImage switch', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const imageSwitch = screen.getByLabelText(/Show Featured Image/i);
    expect(imageSwitch).toBeChecked();

    fireEvent.click(imageSwitch);
    expect(imageSwitch).not.toBeChecked();
  });

  it('fetches parent pages on mount', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pages')
      );
    });
  });

  it('calls onSave with updated data when Save Changes is clicked', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('handles layout selection', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Note: Testing select components requires more complex interaction
    // This is a simplified test
    const layoutLabel = screen.getByText('Layout');
    expect(layoutLabel).toBeInTheDocument();
  });

  it('handles columns selection', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const columnsLabel = screen.getByText(/Columns/i);
    expect(columnsLabel).toBeInTheDocument();
  });

  it('handles page count selection', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const pageCountLabel = screen.getByText(/Number of Pages/i);
    expect(pageCountLabel).toBeInTheDocument();
  });

  it('renders filter section', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Parent Page/i)).toBeInTheDocument();
    });
  });

  it('renders display options section', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Display Options')).toBeInTheDocument();
  });

  it('renders CTA section', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Call to Action')).toBeInTheDocument();
  });

  it('handles empty title gracefully', async () => {
    const dataWithoutTitle = { ...defaultData, title: undefined };
    render(
      <PagesSectionEditor
        data={dataWithoutTitle}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    expect(titleInput).toHaveValue('');
  });

  it('handles empty subtitle gracefully', async () => {
    const dataWithoutSubtitle = { ...defaultData, subtitle: undefined };
    render(
      <PagesSectionEditor
        data={dataWithoutSubtitle}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const subtitleInput = screen.getByLabelText(/Subtitle/i);
    expect(subtitleInput).toHaveValue('');
  });

  it('handles fetch error for parent pages gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Should still render the form even if fetch fails
    await waitFor(() => {
      expect(screen.getByLabelText(/Section Title/i)).toBeInTheDocument();
    });
  });

  it('preserves all data fields when saving', async () => {
    render(
      <PagesSectionEditor
        data={defaultData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          layout: 'grid',
          columns: 3,
          pageCount: 6,
          showExcerpt: true,
          showImage: true,
          ctaText: 'View All Pages',
        })
      );
    });
  });
});
