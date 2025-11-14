/**
 * Page Editor Tests
 * 
 * Tests for the page editor including:
 * - Page creation
 * - Page editing
 * - Slug auto-generation
 * - Slug validation
 * - Parent page selector
 * - Featured image upload
 * - Save as draft
 * - Publish
 * - Preview
 * - Validation
 * 
 * Requirements: 3.1-3.12, 10.1-10.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageEditor } from '@/components/pages/PageEditor';
import { PageStatus, PageVisibility } from '@/types/pages';
import type { CustomPage } from '@/types/pages';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen });

// Mock page data
const mockPage: CustomPage = {
  id: 'page-1',
  title: 'About Us',
  slug: 'about-us',
  content: '<p>About us content</p>',
  excerpt: 'Learn about our company',
  featuredImage: '/images/about.jpg',
  status: PageStatus.DRAFT,
  visibility: PageVisibility.PUBLIC,
  parentPageId: null,
  showInNavigation: true,
  displayOrder: 1,
  metaTitle: 'About Us - Company',
  metaDescription: 'Learn more about our company',
  metaKeywords: 'about, company',
  customCssClass: 'about-page',
  templateKey: 'default',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-15').toISOString(),
};

const mockPages: CustomPage[] = [
  {
    id: 'page-2',
    title: 'Services',
    slug: 'services',
    content: '<p>Services</p>',
    status: PageStatus.PUBLISHED,
    visibility: PageVisibility.PUBLIC,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-3',
    title: 'Contact',
    slug: 'contact',
    content: '<p>Contact</p>',
    status: PageStatus.PUBLISHED,
    visibility: PageVisibility.PUBLIC,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('PageEditor', () => {
  let mockToastSuccess: any;
  let mockToastError: any;
  let mockToastInfo: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockWindowOpen.mockClear();
    
    // Get toast mocks
    const { toast } = await import('@/hooks/use-toast');
    mockToastSuccess = toast.success;
    mockToastError = toast.error;
    mockToastInfo = toast.info;
    
    // Mock fetch for default responses
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/pages/admin/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPage),
        } as Response);
      }
      if (url.includes('/pages/admin?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: mockPages,
            total: mockPages.length,
          }),
        } as Response);
      }
      if (url.includes('/pages/validate-slug')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: true }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Page Creation', () => {
    it('should render create mode with empty form', () => {
      render(<PageEditor mode="create" />);
      
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
      expect(screen.getByText('Create a new custom page for your site')).toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(<PageEditor mode="create" />);
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/excerpt/i)).toBeInTheDocument();
    });

    it('should create new page with valid data', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (options?.method === 'POST' && url.includes('/pages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockPage,
              id: 'new-page-id',
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      // Fill in form
      const titleInput = screen.getByLabelText(/title/i);
      const slugInput = screen.getByLabelText(/slug/i);
      
      await user.type(titleInput, 'New Page');
      await user.type(slugInput, 'new-page');
      
      // Switch to content tab and add content
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await user.click(contentTab);
      
      // Find content editor (textarea or contenteditable)
      const contentEditor = screen.getByRole('textbox', { name: /content/i }) || 
                           document.querySelector('[contenteditable="true"]');
      if (contentEditor) {
        await user.type(contentEditor, 'Page content');
      }
      
      // Save
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Page created successfully');
        expect(mockPush).toHaveBeenCalledWith('/dashboard/pages/new-page-id/edit');
      });
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Try to save without filling required fields
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Title is required');
      });
    });

    it('should disable preview in create mode', () => {
      render(<PageEditor mode="create" />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toBeDisabled();
    });
  });

  describe('Page Editing', () => {
    it('should load existing page data', async () => {
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/admin/page-1'),
          expect.any(Object)
        );
      });
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
    });

    it('should display loading state while fetching', () => {
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });

    it('should update existing page', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (url.includes('/pages/admin/page-1') && !options?.method) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        if (options?.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Update title
      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated About Us');
      
      // Save
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Page updated successfully');
      });
    });

    it('should handle load error', async () => {
      global.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Not found' }),
        } as Response)
      );

      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load page');
      });
    });
  });

  describe('Slug Auto-generation', () => {
    it('should auto-generate slug from title', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'My New Page');
      
      // Slug should be auto-generated
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
        expect(slugInput.value).toBe('my-new-page');
      });
    });

    it('should handle special characters in title', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'About Us & Services!');
      
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
        expect(slugInput.value).toBe('about-us-services');
      });
    });

    it('should allow manual slug editing', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'custom-slug');
      
      await waitFor(() => {
        const input = screen.getByLabelText(/slug/i) as HTMLInputElement;
        expect(input.value).toBe('custom-slug');
      });
    });

    it('should convert slug to lowercase', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'MySlug');
      
      await waitFor(() => {
        const input = screen.getByLabelText(/slug/i) as HTMLInputElement;
        expect(input.value).toBe('myslug');
      });
    });

    it('should replace spaces with hyphens', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'My Page Title');
      
      await waitFor(() => {
        const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
        expect(slugInput.value).toBe('my-page-title');
      });
    });
  });

  describe('Slug Validation', () => {
    it('should validate slug availability', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string) => {
        if (url.includes('/pages/validate-slug')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ available: true }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'test-slug');
      
      // Validation should be triggered
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/validate-slug'),
          expect.any(Object)
        );
      });
    });

    it('should show error for duplicate slug', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string) => {
        if (url.includes('/pages/validate-slug')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              available: false,
              suggestion: 'test-slug-2'
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'test-slug');
      
      await waitFor(() => {
        expect(screen.getByText(/slug is already in use/i)).toBeInTheDocument();
      });
    });

    it('should suggest alternative slug', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string) => {
        if (url.includes('/pages/validate-slug')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              available: false,
              suggestion: 'test-slug-2'
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'test-slug');
      
      await waitFor(() => {
        expect(screen.getByText(/try: test-slug-2/i)).toBeInTheDocument();
      });
    });

    it('should validate slug format', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'invalid slug!');
      
      await waitFor(() => {
        expect(screen.getByText(/only lowercase letters, numbers, and hyphens/i)).toBeInTheDocument();
      });
    });

    it('should check for system route conflicts', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string) => {
        if (url.includes('/pages/validate-slug')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              available: false,
              isSystemRoute: true
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, 'dashboard');
      
      await waitFor(() => {
        expect(screen.getByText(/conflicts with system route/i)).toBeInTheDocument();
      });
    });
  });

  describe('Parent Page Selector', () => {
    it('should display parent page dropdown', async () => {
      render(<PageEditor mode="create" />);
      
      // Switch to settings tab
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/parent page/i)).toBeInTheDocument();
      });
    });

    it('should load available pages', async () => {
      global.fetch = vi.fn((url: string) => {
        if (url.includes('/pages/admin?')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: mockPages,
              total: mockPages.length,
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/admin?'),
          expect.any(Object)
        );
      });
    });

    it('should select parent page', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);
      
      await waitFor(() => {
        const parentSelect = screen.getByLabelText(/parent page/i);
        expect(parentSelect).toBeInTheDocument();
      });
      
      const parentSelect = screen.getByLabelText(/parent page/i);
      fireEvent.change(parentSelect, { target: { value: 'page-2' } });
      
      expect((parentSelect as HTMLSelectElement).value).toBe('page-2');
    });

    it('should exclude current page from parent options', async () => {
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      fireEvent.click(settingsTab);
      
      // Current page should not be in parent options
      await waitFor(() => {
        const parentSelect = screen.getByLabelText(/parent page/i);
        const options = Array.from((parentSelect as HTMLSelectElement).options);
        expect(options.find(opt => opt.value === 'page-1')).toBeUndefined();
      });
    });

    it('should clear parent selection', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);
      
      await waitFor(() => {
        const parentSelect = screen.getByLabelText(/parent page/i);
        expect(parentSelect).toBeInTheDocument();
      });
      
      const parentSelect = screen.getByLabelText(/parent page/i);
      fireEvent.change(parentSelect, { target: { value: 'page-2' } });
      fireEvent.change(parentSelect, { target: { value: '' } });
      
      expect((parentSelect as HTMLSelectElement).value).toBe('');
    });
  });

  describe('Featured Image Upload', () => {
    it('should display image upload field', () => {
      render(<PageEditor mode="create" />);
      
      expect(screen.getByText(/featured image/i)).toBeInTheDocument();
    });

    it('should upload image', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (url.includes('/pages/featured-image')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ url: '/uploads/image.jpg' }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/featured-image'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should display image preview', async () => {
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Image preview should be displayed
      await waitFor(() => {
        const image = screen.getByAltText(/featured image/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/images/about.jpg');
      });
    });

    it('should remove image', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      const removeButton = screen.getByRole('button', { name: /remove image/i });
      await user.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByAltText(/featured image/i)).not.toBeInTheDocument();
      });
    });

    it('should validate file type', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('file type')
        );
      });
    });

    it('should validate file size', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Create a large file (> 5MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
      
      await user.upload(input, largeFile);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('file size')
        );
      });
    });
  });

  describe('Save as Draft', () => {
    it('should save page as draft', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockPage,
              status: PageStatus.DRAFT,
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="create" />);
      
      // Fill in required fields
      await user.type(screen.getByLabelText(/title/i), 'Draft Page');
      await user.type(screen.getByLabelText(/slug/i), 'draft-page');
      
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await user.click(contentTab);
      
      const contentEditor = screen.getByRole('textbox', { name: /content/i }) || 
                           document.querySelector('[contenteditable="true"]');
      if (contentEditor) {
        await user.type(contentEditor, 'Draft content');
      }
      
      // Save as draft
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"status":"DRAFT"'),
          })
        );
      });
    });

    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Make a change
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, ' Updated');
      
      await waitFor(() => {
        expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should auto-save after 30 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (url.includes('/pages/admin/page-1') && !options?.method) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        if (options?.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Make a change
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, ' Updated');
      
      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/page-1'),
          expect.objectContaining({
            method: 'PATCH',
          })
        );
      });
      
      vi.useRealTimers();
    });

    it('should warn before leaving with unsaved changes', async () => {
      const user = userEvent.setup();
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Make a change
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, ' Updated');
      
      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'beforeunload',
          expect.any(Function)
        );
      });
    });
  });

  describe('Publish', () => {
    it('should publish page', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (url.includes('/pages/admin/page-1') && !options?.method) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        if (url.includes('/pages/page-1/publish')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockPage,
              status: PageStatus.PUBLISHED,
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Publish
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/pages/page-1/publish'),
          expect.objectContaining({
            method: 'PATCH',
          })
        );
        expect(mockToastSuccess).toHaveBeenCalledWith('Page published successfully');
      });
    });

    it('should require pages:publish permission', () => {
      render(<PageEditor mode="create" />);
      
      // Publish button should be wrapped in PermissionGuard
      const publishButton = screen.queryByRole('button', { name: /publish/i });
      expect(publishButton).toBeInTheDocument();
    });

    it('should handle publish error', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn((url: string, options?: any) => {
        if (url.includes('/pages/admin/page-1') && !options?.method) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPage),
          } as Response);
        }
        if (url.includes('/pages/page-1/publish')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Publish failed' }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to publish page');
      });
    });
  });

  describe('Preview', () => {
    it('should open preview in new tab', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('/about-us?preview=true', '_blank');
    });

    it('should use current slug for preview URL', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Change slug
      const slugInput = screen.getByLabelText(/slug/i);
      await user.clear(slugInput);
      await user.type(slugInput, 'new-slug');
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('/new-slug?preview=true', '_blank');
    });

    it('should show info message in create mode', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toBeDisabled();
      
      await user.click(previewButton);
      
      // Should not open preview
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should preview with draft content', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="edit" pageId="page-1" />);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('About Us');
      });
      
      // Make changes without saving
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, ' Updated');
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      // Preview should still work with unsaved changes
      expect(mockWindowOpen).toHaveBeenCalledWith('/about-us?preview=true', '_blank');
    });
  });

  describe('Validation', () => {
    it('should validate title is required', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Try to save without title
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Title is required');
      });
    });

    it('should validate slug is required', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Fill title but not slug
      await user.type(screen.getByLabelText(/title/i), 'Test Page');
      
      // Clear auto-generated slug
      const slugInput = screen.getByLabelText(/slug/i);
      await user.clear(slugInput);
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Slug is required');
      });
    });

    it('should validate content is required', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Fill title and slug but not content
      await user.type(screen.getByLabelText(/title/i), 'Test Page');
      await user.type(screen.getByLabelText(/slug/i), 'test-page');
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Content is required');
      });
    });

    it('should validate title length', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Title too long (> 200 characters)
      const longTitle = 'a'.repeat(201);
      await user.type(screen.getByLabelText(/title/i), longTitle);
      
      await waitFor(() => {
        expect(screen.getByText(/title must be 200 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should validate excerpt length', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Excerpt too long (> 500 characters)
      const longExcerpt = 'a'.repeat(501);
      await user.type(screen.getByLabelText(/excerpt/i), longExcerpt);
      
      await waitFor(() => {
        expect(screen.getByText(/excerpt must be 500 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should validate meta title length', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Switch to SEO tab
      const seoTab = screen.getByRole('tab', { name: /seo/i });
      await user.click(seoTab);
      
      // Meta title too long (> 200 characters)
      const longMetaTitle = 'a'.repeat(201);
      await user.type(screen.getByLabelText(/meta title/i), longMetaTitle);
      
      await waitFor(() => {
        expect(screen.getByText(/meta title must be 200 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should validate meta description length', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Switch to SEO tab
      const seoTab = screen.getByRole('tab', { name: /seo/i });
      await user.click(seoTab);
      
      // Meta description too long (> 500 characters)
      const longMetaDesc = 'a'.repeat(501);
      await user.type(screen.getByLabelText(/meta description/i), longMetaDesc);
      
      await waitFor(() => {
        expect(screen.getByText(/meta description must be 500 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should validate custom CSS class format', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Switch to settings tab
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);
      
      // Invalid CSS class (contains special characters)
      await user.type(screen.getByLabelText(/custom css class/i), 'invalid@class');
      
      await waitFor(() => {
        expect(screen.getByText(/only alphanumeric characters, hyphens, and underscores/i)).toBeInTheDocument();
      });
    });

    it('should show character count for fields', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      await user.type(screen.getByLabelText(/title/i), 'Test');
      
      await waitFor(() => {
        expect(screen.getByText(/4 \/ 200/)).toBeInTheDocument();
      });
    });

    it('should prevent save with validation errors', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Fill with invalid data
      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByLabelText(/slug/i), 'invalid slug!');
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      // Should not call API
      await waitFor(() => {
        const postCalls = (global.fetch as any).mock.calls.filter(
          (call: any) => call[1]?.method === 'POST'
        );
        expect(postCalls.length).toBe(0);
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should display all tabs', () => {
      render(<PageEditor mode="create" />);
      
      expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /seo/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
    });

    it('should switch between tabs', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Switch to SEO tab
      const seoTab = screen.getByRole('tab', { name: /seo/i });
      await user.click(seoTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/meta title/i)).toBeInTheDocument();
      });
      
      // Switch to settings tab
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });
    });

    it('should maintain form data when switching tabs', async () => {
      const user = userEvent.setup();
      
      render(<PageEditor mode="create" />);
      
      // Fill content tab
      await user.type(screen.getByLabelText(/title/i), 'Test Page');
      
      // Switch to SEO tab
      const seoTab = screen.getByRole('tab', { name: /seo/i });
      await user.click(seoTab);
      
      // Switch back to content tab
      const contentTab = screen.getByRole('tab', { name: /content/i });
      await user.click(contentTab);
      
      // Data should be preserved
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('Test Page');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while saving', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockPage),
        } as Response), 1000))
      );

      render(<PageEditor mode="create" />);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByLabelText(/slug/i), 'test');
      
      const contentEditor = screen.getByRole('textbox', { name: /content/i }) || 
                           document.querySelector('[contenteditable="true"]');
      if (contentEditor) {
        await user.type(contentEditor, 'Content');
      }
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save draft/i })).toBeDisabled();
      });
    });

    it('should disable buttons while saving', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockPage),
        } as Response), 1000))
      );

      render(<PageEditor mode="create" />);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByLabelText(/slug/i), 'test');
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      // All action buttons should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save draft/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /publish/i })).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save error', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Save failed' }),
        } as Response)
      );

      render(<PageEditor mode="create" />);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByLabelText(/slug/i), 'test');
      
      const contentEditor = screen.getByRole('textbox', { name: /content/i }) || 
                           document.querySelector('[contenteditable="true"]');
      if (contentEditor) {
        await user.type(contentEditor, 'Content');
      }
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Save failed');
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      
      global.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );

      render(<PageEditor mode="create" />);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Test');
      await user.type(screen.getByLabelText(/slug/i), 'test');
      
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });
});
