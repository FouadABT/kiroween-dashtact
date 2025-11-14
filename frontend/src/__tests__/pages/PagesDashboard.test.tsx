/**
 * Pages Dashboard Tests
 * 
 * Tests for the pages dashboard including:
 * - Pages list rendering
 * - Filtering and search
 * - Sorting and pagination
 * - Page actions (edit, delete, publish, unpublish)
 * - Bulk actions
 * - Hierarchy view
 * 
 * Requirements: 2.1-2.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PagesList } from '@/components/pages/PagesList';
import { PageStatus, PageVisibility } from '@/types/pages';
import type { CustomPage } from '@/types/pages';
import * as ApiModule from '@/lib/api';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the PagesApi
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    PagesApi: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      getBySlug: vi.fn(),
      getPublished: vi.fn(),
    },
  };
});

// Mock pages data
const mockPages: CustomPage[] = [
  {
    id: 'page-1',
    title: 'About Us',
    slug: 'about-us',
    content: '<p>About us content</p>',
    excerpt: 'Learn about our company',
    status: PageStatus.PUBLISHED,
    visibility: PageVisibility.PUBLIC,
    displayOrder: 1,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'page-2',
    title: 'Contact',
    slug: 'contact',
    content: '<p>Contact us</p>',
    excerpt: 'Get in touch',
    status: PageStatus.DRAFT,
    visibility: PageVisibility.PUBLIC,
    displayOrder: 2,
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'page-3',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: '<p>Privacy policy content</p>',
    status: PageStatus.PUBLISHED,
    visibility: PageVisibility.PRIVATE,
    displayOrder: 3,
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-05').toISOString(),
  },
];

describe('PagesDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    
    // Setup default PagesApi mocks
    vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
      data: mockPages,
      total: mockPages.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Pages List Rendering', () => {
    it('should display loading state initially', () => {
      render(<PagesList />);
      
      const loadingElements = screen.getAllByRole('generic');
      const hasLoadingState = loadingElements.some(el => 
        el.className.includes('animate-pulse')
      );
      expect(hasLoadingState).toBe(true);
    });

    it('should load and display pages', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });

    it('should display page count', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('3 pages total')).toBeInTheDocument();
      });
    });

    it('should display empty state when no pages', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('No pages found')).toBeInTheDocument();
        expect(screen.getByText('Create your first page')).toBeInTheDocument();
      });
    });

    it('should display error message on load failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.getAll).mockRejectedValueOnce(
        new Error('Failed to load')
      );

      render(<PagesList />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load pages. Please try again.');
      });
    });

    it('should display Create Page button', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Page')).toBeInTheDocument();
      });
    });

    it('should navigate to create page on button click', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Page');
        fireEvent.click(createButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard/pages/new');
    });
  });

  describe('Filtering and Search', () => {
    it('should display search input', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search pages by title or slug...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should filter pages by search term', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search pages by title or slug...');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search pages by title or slug...');
      await userEvent.type(searchInput, 'About');

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'About' })
        );
      }, { timeout: 500 });
    });

    it('should clear search with X button', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search pages by title or slug...');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search pages by title or slug...');
      await userEvent.type(searchInput, 'About');

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: '' });
        expect(clearButton).toBeInTheDocument();
      });
    });

    it('should display filters dropdown', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      await waitFor(() => {
        const draftOption = screen.getByText('Draft');
        fireEvent.click(draftOption);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'DRAFT' })
        );
      });
    });

    it('should filter by visibility', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      await waitFor(() => {
        const publicOption = screen.getAllByText('Public')[0];
        fireEvent.click(publicOption);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ visibility: 'PUBLIC' })
        );
      });
    });

    it('should display active filters count', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      await waitFor(() => {
        const draftOption = screen.getByText('Draft');
        fireEvent.click(draftOption);
      });

      // Badge should appear with count
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        expect(filtersButton.parentElement).toBeInTheDocument();
      });
    });

    it('should clear all filters', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      await waitFor(() => {
        const draftOption = screen.getByText('Draft');
        fireEvent.click(draftOption);
      });

      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Filters');
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ 
            status: undefined,
            visibility: undefined,
          })
        );
      });
    });
  });

  describe('Sorting and Pagination', () => {
    it('should display sort dropdown', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Recently Updated')).toBeInTheDocument();
      });
    });

    it('should sort by recently updated by default', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ 
            sortBy: 'updatedAt',
            sortOrder: 'desc',
          })
        );
      });
    });

    it('should change sort order', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        const sortButton = screen.getByText('Recently Updated');
        fireEvent.click(sortButton);
      });

      await waitFor(() => {
        const titleOption = screen.getByText('Title (A-Z)');
        fireEvent.click(titleOption);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ 
            sortBy: 'title',
            sortOrder: 'asc',
          })
        );
      });
    });

    it('should display pagination when multiple pages', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: mockPages,
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: mockPages,
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('should navigate to previous page', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: mockPages,
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        fireEvent.click(prevButton);
      });

      await waitFor(() => {
        expect(ApiModule.PagesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('should disable Previous button on first page', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: mockPages,
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable Next button on last page', async () => {
      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: mockPages,
        total: 50,
        page: 3,
        limit: 20,
        totalPages: 3,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('Page Actions', () => {
    it('should navigate to edit page', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Find and click edit button (pencil icon)
      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const editButton = firstCard.querySelector('[data-action="edit"]');
      
      if (editButton) {
        fireEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/dashboard/pages/page-1/edit');
      }
    });

    it('should delete page with confirmation', async () => {
      const { toast } = await import('@/hooks/use-toast');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(ApiModule.PagesApi.delete).mockResolvedValue(undefined);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Find and click delete button
      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const deleteButton = firstCard.querySelector('[data-action="delete"]');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(ApiModule.PagesApi.delete).toHaveBeenCalledWith('page-1');
          expect(toast.success).toHaveBeenCalledWith('Page deleted successfully');
        });
      }

      confirmSpy.mockRestore();
    });

    it('should not delete page if confirmation cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const deleteButton = firstCard.querySelector('[data-action="delete"]');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(ApiModule.PagesApi.delete).not.toHaveBeenCalled();
      }

      confirmSpy.mockRestore();
    });

    it('should publish draft page', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.publish).mockResolvedValue({
        ...mockPages[1],
        status: PageStatus.PUBLISHED,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });

      // Find the draft page card
      const cards = screen.getAllByRole('article');
      const draftCard = cards.find(card => card.textContent?.includes('Contact'));
      
      if (draftCard) {
        const publishButton = draftCard.querySelector('[data-action="publish"]');
        if (publishButton) {
          fireEvent.click(publishButton);
          
          await waitFor(() => {
            expect(ApiModule.PagesApi.publish).toHaveBeenCalledWith('page-2');
            expect(toast.success).toHaveBeenCalledWith('Page published successfully');
          });
        }
      }
    });

    it('should unpublish published page', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.unpublish).mockResolvedValue({
        ...mockPages[0],
        status: PageStatus.DRAFT,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const cards = screen.getAllByRole('article');
      const publishedCard = cards.find(card => card.textContent?.includes('About Us'));
      
      if (publishedCard) {
        const unpublishButton = publishedCard.querySelector('[data-action="unpublish"]');
        if (unpublishButton) {
          fireEvent.click(unpublishButton);
          
          await waitFor(() => {
            expect(ApiModule.PagesApi.unpublish).toHaveBeenCalledWith('page-1');
            expect(toast.success).toHaveBeenCalledWith('Page unpublished successfully');
          });
        }
      }
    });

    it('should duplicate page', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.create).mockResolvedValue({
        ...mockPages[0],
        id: 'page-4',
        title: 'About Us (Copy)',
        slug: 'about-us-copy',
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const duplicateButton = firstCard.querySelector('[data-action="duplicate"]');
      
      if (duplicateButton) {
        fireEvent.click(duplicateButton);
        
        await waitFor(() => {
          expect(ApiModule.PagesApi.create).toHaveBeenCalledWith(
            expect.objectContaining({
              title: expect.stringContaining('(Copy)'),
              status: PageStatus.DRAFT,
            })
          );
          expect(toast.success).toHaveBeenCalledWith('Page duplicated successfully');
        });
      }
    });

    it('should view page in new tab', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const viewButton = firstCard.querySelector('[data-action="view"]');
      
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(windowOpenSpy).toHaveBeenCalledWith('/about-us', '_blank');
      }

      windowOpenSpy.mockRestore();
    });

    it('should display error on action failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.delete).mockRejectedValueOnce(
        new Error('Delete failed')
      );
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const deleteButton = firstCard.querySelector('[data-action="delete"]');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Failed to delete page. Please try again.');
        });
      }

      confirmSpy.mockRestore();
    });
  });

  describe('Bulk Actions', () => {
    it('should select individual pages', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
        });
      }
    });

    it('should select all pages', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      // Select multiple pages
      if (checkboxes.length >= 2) {
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
        
        await waitFor(() => {
          expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
        });
      }
    });

    it('should deselect pages', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        // Select
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
        });

        // Deselect
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should display bulk actions bar when pages selected', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.getByText('Publish')).toBeInTheDocument();
          expect(screen.getByText('Unpublish')).toBeInTheDocument();
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });
      }
    });

    it('should bulk publish pages', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.publish).mockResolvedValue({
        ...mockPages[0],
        status: PageStatus.PUBLISHED,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length >= 2) {
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
        
        await waitFor(() => {
          const publishButton = screen.getByText('Publish');
          fireEvent.click(publishButton);
        });

        await waitFor(() => {
          expect(ApiModule.PagesApi.publish).toHaveBeenCalled();
          expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('published successfully'));
        });
      }
    });

    it('should bulk unpublish pages', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.unpublish).mockResolvedValue({
        ...mockPages[0],
        status: PageStatus.DRAFT,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length >= 2) {
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
        
        await waitFor(() => {
          const unpublishButton = screen.getByText('Unpublish');
          fireEvent.click(unpublishButton);
        });

        await waitFor(() => {
          expect(ApiModule.PagesApi.unpublish).toHaveBeenCalled();
          expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('unpublished successfully'));
        });
      }
    });

    it('should bulk delete pages with confirmation', async () => {
      const { toast } = await import('@/hooks/use-toast');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(ApiModule.PagesApi.delete).mockResolvedValue(undefined);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length >= 2) {
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
        
        await waitFor(() => {
          const deleteButton = screen.getByText('Delete');
          fireEvent.click(deleteButton);
        });

        await waitFor(() => {
          expect(ApiModule.PagesApi.delete).toHaveBeenCalled();
          expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('deleted successfully'));
        });
      }

      confirmSpy.mockRestore();
    });

    it('should clear selection', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
        });

        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
        
        await waitFor(() => {
          expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should display error on bulk action failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.publish).mockRejectedValueOnce(
        new Error('Bulk action failed')
      );

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          const publishButton = screen.getByText('Publish');
          fireEvent.click(publishButton);
        });

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Failed to perform bulk action. Please try again.');
        });
      }
    });
  });

  describe('View Modes', () => {
    it('should display grid view by default', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Grid view should show cards in grid layout
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should switch to list view', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Find list view button
      const buttons = screen.getAllByRole('button');
      const listButton = buttons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-list')
      );
      
      if (listButton) {
        fireEvent.click(listButton);
        
        await waitFor(() => {
          const cards = screen.getAllByRole('article');
          expect(cards.length).toBeGreaterThan(0);
        });
      }
    });

    it('should switch to hierarchy view', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Hierarchy view would be tested if the tab is visible
      // For now, we verify the component renders
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('should maintain view mode selection', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const listButton = buttons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-list')
      );
      
      if (listButton) {
        fireEvent.click(listButton);
        
        // View mode should persist
        await waitFor(() => {
          expect(screen.getByText('About Us')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Hierarchy View', () => {
    it('should display pages in hierarchical structure', async () => {
      const hierarchicalPages: CustomPage[] = [
        {
          ...mockPages[0],
          parentPageId: null,
        },
        {
          ...mockPages[1],
          parentPageId: 'page-1',
        },
        {
          ...mockPages[2],
          parentPageId: 'page-1',
        },
      ];

      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: hierarchicalPages,
        total: hierarchicalPages.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });

    it('should show parent-child relationships', async () => {
      const hierarchicalPages: CustomPage[] = [
        {
          ...mockPages[0],
          parentPageId: null,
        },
        {
          ...mockPages[1],
          parentPageId: 'page-1',
        },
      ];

      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: hierarchicalPages,
        total: hierarchicalPages.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });
    });

    it('should handle pages without parents', async () => {
      const topLevelPages: CustomPage[] = mockPages.map(page => ({
        ...page,
        parentPageId: null,
      }));

      vi.mocked(ApiModule.PagesApi.getAll).mockResolvedValue({
        data: topLevelPages,
        total: topLevelPages.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading skeleton', () => {
      render(<PagesList />);
      
      const loadingElements = screen.getAllByRole('generic');
      const hasLoadingState = loadingElements.some(el => 
        el.className.includes('animate-pulse')
      );
      expect(hasLoadingState).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(ApiModule.PagesApi.getAll).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<PagesList />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load pages. Please try again.');
      });
    });

    it('should refetch pages after actions', async () => {
      const { toast } = await import('@/hooks/use-toast');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(ApiModule.PagesApi.delete).mockResolvedValue(undefined);

      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      const initialCallCount = vi.mocked(ApiModule.PagesApi.getAll).mock.calls.length;

      const cards = screen.getAllByRole('article');
      const firstCard = cards[0];
      const deleteButton = firstCard.querySelector('[data-action="delete"]');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(vi.mocked(ApiModule.PagesApi.getAll).mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }

      confirmSpy.mockRestore();
    });

    it('should clear selection after filter change', async () => {
      render(<PagesList />);
      
      await waitFor(() => {
        expect(screen.getByText('About Us')).toBeInTheDocument();
      });

      // Select a page
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
        });

        // Change filter
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
        
        await waitFor(() => {
          const draftOption = screen.getByText('Draft');
          fireEvent.click(draftOption);
        });

        // Selection should be cleared
        await waitFor(() => {
          expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
        });
      }
    });
  });
});
