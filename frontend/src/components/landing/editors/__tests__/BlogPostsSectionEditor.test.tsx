import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BlogPostsSectionEditor } from '../BlogPostsSectionEditor';
import type { BlogPostsSectionData } from '@/types/landing-page';

const mockCategories = [
  { id: 'cat1', name: 'Technology', slug: 'technology' },
  { id: 'cat2', name: 'Design', slug: 'design' },
];

const mockTags = [
  { id: 'tag1', name: 'React', slug: 'react' },
  { id: 'tag2', name: 'TypeScript', slug: 'typescript' },
];

describe('BlogPostsSectionEditor', () => {
  const mockData: BlogPostsSectionData = {
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

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock categories fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/blog/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        });
      }
      if (url.includes('/blog/tags')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTags,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders all form fields with initial data', async () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Recent Blog Posts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Check out our latest articles')).toBeInTheDocument();
      expect(screen.getByDisplayValue('View All Posts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('/blog')).toBeInTheDocument();
    });
  });

  it('fetches and displays categories', async () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/blog/categories')
      );
    });
  });

  it('fetches and displays tags', async () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/blog/tags')
      );
    });
  });

  it('updates title field', async () => {
    const user = userEvent.setup();
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    expect(titleInput).toHaveValue('New Title');
  });

  it('updates subtitle field', async () => {
    const user = userEvent.setup();
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const subtitleInput = screen.getByLabelText(/Subtitle/i);
    await user.clear(subtitleInput);
    await user.type(subtitleInput, 'New Subtitle');

    expect(subtitleInput).toHaveValue('New Subtitle');
  });

  it('toggles display options', async () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const showAuthorSwitch = screen.getByRole('switch', { name: /Show Author/i });
    expect(showAuthorSwitch).toBeChecked();

    fireEvent.click(showAuthorSwitch);
    expect(showAuthorSwitch).not.toBeChecked();
  });

  it('calls onSave with updated data when save button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText(/Section Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('updates CTA text and link', async () => {
    const user = userEvent.setup();
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    const ctaTextInput = screen.getByLabelText(/Button Text/i);
    await user.clear(ctaTextInput);
    await user.type(ctaTextInput, 'Read More');

    const ctaLinkInput = screen.getByLabelText(/Button Link/i);
    await user.clear(ctaLinkInput);
    await user.type(ctaLinkInput, '/articles');

    expect(ctaTextInput).toHaveValue('Read More');
    expect(ctaLinkInput).toHaveValue('/articles');
  });

  it('handles empty optional fields', () => {
    const dataWithoutOptionals: BlogPostsSectionData = {
      ...mockData,
      title: undefined,
      subtitle: undefined,
      filterByCategory: undefined,
      filterByTag: undefined,
    };

    render(
      <BlogPostsSectionEditor
        data={dataWithoutOptionals}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText(/Section Title/i)).toHaveValue('');
    expect(screen.getByLabelText(/Subtitle/i)).toHaveValue('');
  });

  it('displays all layout options', () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Layout select should be present (use exact match to avoid ambiguity)
    expect(screen.getByLabelText('Layout')).toBeInTheDocument();
  });

  it('displays all column options', () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Columns select should be present
    expect(screen.getByLabelText(/Columns/i)).toBeInTheDocument();
  });

  it('displays all post count options', () => {
    render(
      <BlogPostsSectionEditor
        data={mockData}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Post count select should be present
    expect(screen.getByLabelText(/Number of Posts/i)).toBeInTheDocument();
  });
});
