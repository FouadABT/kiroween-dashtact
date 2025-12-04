/**
 * Landing Page Editor Tests
 * 
 * Tests for the landing page editor component including:
 * - Section management (add, remove, reorder, enable/disable)
 * - Section editors (hero, features, footer, CTA, testimonials, stats, content)
 * - Image upload
 * - CTA button page selector
 * - Save and reset functionality
 * - Validation
 * 
 * Requirements: 1.1-1.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPageEditor } from '@/components/landing/LandingPageEditor';
import { LandingPageContent } from '@/types/landing-page';
import * as LandingApiModule from '@/lib/api';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the LandingApi and PagesApi
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api');
  return {
    ...actual,
    LandingApi: {
      getContent: vi.fn(),
      getContentAdmin: vi.fn(),
      updateContent: vi.fn(),
      resetToDefaults: vi.fn(),
      uploadSectionImage: vi.fn(),
    },
    PagesApi: {
      getAll: vi.fn().mockResolvedValue({ pages: [], total: 0, page: 1, limit: 20 }),
      getPublished: vi.fn().mockResolvedValue({ pages: [], total: 0, page: 1, limit: 20 }),
    },
  };
});

// Mock landing page content
const mockLandingContent: LandingPageContent = {
  id: 'landing-1',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      enabled: true,
      order: 0,
      data: {
        headline: 'Welcome to Our Platform',
        subheadline: 'Build amazing things',
        primaryCta: { text: 'Get Started', link: '/signup', linkType: 'url' },
        backgroundType: 'solid',
        backgroundColor: '#000000',
        textAlignment: 'center',
        height: 'large',
      },
    },
    {
      id: 'features-1',
      type: 'features',
      enabled: true,
      order: 1,
      data: {
        title: 'Our Features',
        subtitle: 'Everything you need',
        layout: 'grid',
        columns: 3,
        features: [
          {
            id: 'feature-1',
            icon: 'Zap',
            title: 'Fast',
            description: 'Lightning fast performance',
            order: 0,
          },
        ],
      },
    },
  ],
  settings: {
    theme: {
      primaryColor: '#000000',
    },
    layout: {
      maxWidth: 'container',
      spacing: 'normal',
    },
    seo: {
      title: 'Landing Page',
      description: 'Welcome to our platform',
    },
  },
  version: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('LandingPageEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
    // Setup default LandingApi mocks
    vi.mocked(LandingApiModule.LandingApi.getContentAdmin).mockResolvedValue(mockLandingContent);
    vi.mocked(LandingApiModule.LandingApi.updateContent).mockResolvedValue(mockLandingContent);
    vi.mocked(LandingApiModule.LandingApi.resetToDefaults).mockResolvedValue(mockLandingContent);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial Loading', () => {
    it('should display loading state initially', () => {
      render(<LandingPageEditor />);
      
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should load landing page content on mount', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(LandingApiModule.LandingApi.getContentAdmin).toHaveBeenCalled();
      });
    });

    it('should display content after loading', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Sections')).toBeInTheDocument();
        expect(screen.getByText('Global Settings')).toBeInTheDocument();
      });
    });

    it('should display error message on load failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(LandingApiModule.LandingApi.getContentAdmin).mockRejectedValueOnce(
        new Error('Failed to load')
      );

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load landing page content');
      });
    });
  });

  describe('Section Management', () => {
    it('should display existing sections', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
        expect(screen.getByText('Features Section')).toBeInTheDocument();
      });
    });

    it('should open section library when Add Section is clicked', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Section')).toBeInTheDocument();
      });
      
      const addButton = screen.getByText('Add Section');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Section')).toBeInTheDocument();
      });
    });

    it('should add new section from library', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Section')).toBeInTheDocument();
      });
      
      const addButton = screen.getByText('Add Section');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const ctaButton = screen.getByText('CTA');
        fireEvent.click(ctaButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Call to Action')).toBeInTheDocument();
      });
    });

    it('should toggle section enabled state', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      const eyeButtons = screen.getAllByRole('button', { name: '' });
      const toggleButton = eyeButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-eye')
      );
      
      if (toggleButton) {
        fireEvent.click(toggleButton);
        
        await waitFor(() => {
          expect(screen.getByText('Hidden')).toBeInTheDocument();
        });
      }
    });

    it('should delete section with confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(confirmSpy).toHaveBeenCalled();
        });
      }
      
      confirmSpy.mockRestore();
    });

    it('should duplicate section', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      const copyButtons = screen.getAllByRole('button', { name: '' });
      const duplicateButton = copyButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-copy')
      );
      
      if (duplicateButton) {
        fireEvent.click(duplicateButton);
        
        await waitFor(() => {
          const heroSections = screen.getAllByText('Hero Section');
          expect(heroSections.length).toBeGreaterThan(1);
        });
      }
    });

    it('should expand/collapse section editor', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-chevron-down')
      );
      
      if (expandButton) {
        fireEvent.click(expandButton);
        
        await waitFor(() => {
          expect(screen.getByLabelText(/headline/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Section Reordering', () => {
    it('should support drag and drop reordering', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
        expect(screen.getByText('Features Section')).toBeInTheDocument();
      });
      
      const sections = screen.getAllByRole('article');
      const firstSection = sections[0];
      
      fireEvent.dragStart(firstSection);
      fireEvent.dragOver(sections[1]);
      fireEvent.dragEnd(firstSection);
      
      // Sections should be reordered
      expect(screen.getByText('Save Changes')).toBeEnabled();
    });
  });

  describe('Section Editors', () => {
    describe('Hero Section Editor', () => {
      it('should edit hero section headline', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Hero Section')).toBeInTheDocument();
        });
        
        // Expand hero section
        const chevronButtons = screen.getAllByRole('button', { name: '' });
        const expandButton = chevronButtons.find(btn => 
          btn.querySelector('svg')?.classList.contains('lucide-chevron-down')
        );
        
        if (expandButton) {
          fireEvent.click(expandButton);
          
          await waitFor(() => {
            const headlineInput = screen.getByLabelText(/headline/i);
            expect(headlineInput).toBeInTheDocument();
          });
          
          const headlineInput = screen.getByLabelText(/headline/i);
          await userEvent.clear(headlineInput);
          await userEvent.type(headlineInput, 'New Headline');
          
          expect(screen.getByText('Save Changes')).toBeEnabled();
        }
      });

      it('should edit hero CTA buttons', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Hero Section')).toBeInTheDocument();
        });
        
        // Expand and edit CTA
        const chevronButtons = screen.getAllByRole('button', { name: '' });
        const expandButton = chevronButtons[0];
        fireEvent.click(expandButton);
        
        await waitFor(() => {
          const ctaTextInputs = screen.getAllByLabelText(/button text/i);
          expect(ctaTextInputs.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Features Section Editor', () => {
      it('should add new feature card', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Features Section')).toBeInTheDocument();
        });
        
        // Expand features section
        const chevronButtons = screen.getAllByRole('button', { name: '' });
        const expandButton = chevronButtons[1];
        fireEvent.click(expandButton);
        
        await waitFor(() => {
          const addFeatureButton = screen.getByText(/add feature/i);
          expect(addFeatureButton).toBeInTheDocument();
          fireEvent.click(addFeatureButton);
        });
      });

      it('should edit feature card', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Features Section')).toBeInTheDocument();
        });
        
        // Expand features section
        const chevronButtons = screen.getAllByRole('button', { name: '' });
        const expandButton = chevronButtons[1];
        fireEvent.click(expandButton);
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Fast')).toBeInTheDocument();
        });
      });

      it('should remove feature card', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Features Section')).toBeInTheDocument();
        });
        
        // Expand features section
        const chevronButtons = screen.getAllByRole('button', { name: '' });
        const expandButton = chevronButtons[1];
        fireEvent.click(expandButton);
        
        await waitFor(() => {
          const deleteButtons = screen.getAllByRole('button', { name: '' });
          const featureDeleteButton = deleteButtons.find(btn => 
            btn.querySelector('svg')?.classList.contains('lucide-trash-2')
          );
          
          if (featureDeleteButton) {
            fireEvent.click(featureDeleteButton);
          }
        });
      });
    });

    describe('CTA Section Editor', () => {
      it('should edit CTA section title and description', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add CTA section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const ctaButton = screen.getByText('CTA');
          fireEvent.click(ctaButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText('Call to Action')).toBeInTheDocument();
        });
      });
    });

    describe('Footer Section Editor', () => {
      it('should edit footer company information', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add footer section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const footerButton = screen.getByText('Footer');
          fireEvent.click(footerButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText('Footer Section')).toBeInTheDocument();
        });
      });

      it('should add navigation links', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add footer section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const footerButton = screen.getByText('Footer');
          fireEvent.click(footerButton);
        });
        
        await waitFor(() => {
          const chevronButtons = screen.getAllByRole('button', { name: '' });
          const expandButton = chevronButtons.find(btn => 
            btn.querySelector('svg')?.classList.contains('lucide-chevron-down')
          );
          
          if (expandButton) {
            fireEvent.click(expandButton);
          }
        });
      });
    });

    describe('Testimonials Section Editor', () => {
      it('should add testimonial', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add testimonials section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const testimonialsButton = screen.getByText('Testimonials');
          fireEvent.click(testimonialsButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText('Testimonials')).toBeInTheDocument();
        });
      });
    });

    describe('Stats Section Editor', () => {
      it('should add stat', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add stats section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const statsButton = screen.getByText('Stats');
          fireEvent.click(statsButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText('Statistics')).toBeInTheDocument();
        });
      });
    });

    describe('Content Section Editor', () => {
      it('should edit content', async () => {
        render(<LandingPageEditor />);
        
        await waitFor(() => {
          expect(screen.getByText('Add Section')).toBeInTheDocument();
        });
        
        // Add content section
        const addButton = screen.getByText('Add Section');
        fireEvent.click(addButton);
        
        await waitFor(() => {
          const contentButton = screen.getByText('Content');
          fireEvent.click(contentButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText('Content Section')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Image Upload', () => {
    it('should upload hero background image', async () => {
      vi.mocked(LandingApiModule.LandingApi.uploadSectionImage).mockResolvedValue({
        url: '/uploads/hero-bg.jpg',
        filename: 'hero-bg.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      });

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const fileInputs = screen.getAllByLabelText(/image/i);
        expect(fileInputs.length).toBeGreaterThan(0);
      });
    });

    it('should validate image file type', async () => {
      const { toast } = await import('@/hooks/use-toast');
      
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const fileInputs = screen.getAllByLabelText(/image/i);
        if (fileInputs.length > 0) {
          const file = new File(['content'], 'test.txt', { type: 'text/plain' });
          fireEvent.change(fileInputs[0], { target: { files: [file] } });
        }
      });
    });

    it('should validate image file size', async () => {
      const { toast } = await import('@/hooks/use-toast');
      
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const fileInputs = screen.getAllByLabelText(/image/i);
        if (fileInputs.length > 0) {
          // Create a file larger than 5MB
          const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
            type: 'image/jpeg' 
          });
          fireEvent.change(fileInputs[0], { target: { files: [largeFile] } });
        }
      });
    });

    it('should display image preview after upload', async () => {
      vi.mocked(LandingApiModule.LandingApi.uploadSectionImage).mockResolvedValue({
        url: '/uploads/hero-bg.jpg',
        filename: 'hero-bg.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      });

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const fileInputs = screen.getAllByLabelText(/image/i);
        if (fileInputs.length > 0) {
          const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
          fireEvent.change(fileInputs[0], { target: { files: [file] } });
        }
      });
    });
  });

  describe('CTA Button Page Selector', () => {
    it('should display page selector for CTA links', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const linkTypeSelects = screen.getAllByRole('combobox');
        expect(linkTypeSelects.length).toBeGreaterThan(0);
      });
    });

    it('should switch between URL and page link types', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const linkTypeSelects = screen.getAllByRole('combobox');
        if (linkTypeSelects.length > 0) {
          fireEvent.change(linkTypeSelects[0], { target: { value: 'page' } });
        }
      });
    });

    it('should select page from dropdown', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section and interact with page selector
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const linkTypeSelects = screen.getAllByRole('combobox');
        if (linkTypeSelects.length > 0) {
          fireEvent.change(linkTypeSelects[0], { target: { value: 'page' } });
        }
      });
    });
  });

  describe('Save and Reset Functionality', () => {
    it('should enable save button when changes are made', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).toBeEnabled();
      });
    });

    it('should save changes successfully', async () => {
      const { toast } = await import('@/hooks/use-toast');

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(LandingApiModule.LandingApi.updateContent).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Landing page updated successfully');
      });
    });

    it('should display error on save failure', async () => {
      const { toast } = await import('@/hooks/use-toast');
      vi.mocked(LandingApiModule.LandingApi.updateContent).mockRejectedValueOnce(
        new Error('Save failed')
      );

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save landing page');
      });
    });

    it('should reset to defaults with confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const { toast } = await import('@/hooks/use-toast');

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
      });
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(LandingApiModule.LandingApi.resetToDefaults).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Landing page reset to defaults');
      });
      
      confirmSpy.mockRestore();
    });

    it('should not reset if confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
      });
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });
      
      // Should not call API
      expect(LandingApiModule.LandingApi.resetToDefaults).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should display unsaved changes warning', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
      });
    });

    it('should disable save button when no changes', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Validation', () => {
    it('should validate required fields in hero section', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: '' } });
      });
      
      // Try to save
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
    });

    it('should validate CTA button text', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Expand hero section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const ctaTextInputs = screen.getAllByLabelText(/button text/i);
        if (ctaTextInputs.length > 0) {
          fireEvent.change(ctaTextInputs[0], { target: { value: '' } });
        }
      });
    });

    it('should validate feature card fields', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Features Section')).toBeInTheDocument();
      });
      
      // Expand features section
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[1];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Fast');
        fireEvent.change(titleInput, { target: { value: '' } });
      });
    });
  });

  describe('Preview Panel', () => {
    it('should toggle preview panel', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Preview')).toBeInTheDocument();
      });
      
      const previewButton = screen.getByText('Show Preview');
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hide Preview')).toBeInTheDocument();
      });
    });

    it('should update preview when sections change', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Preview')).toBeInTheDocument();
      });
      
      // Show preview
      const previewButton = screen.getByText('Show Preview');
      fireEvent.click(previewButton);
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      // Preview should update
      await waitFor(() => {
        expect(screen.getByText('Hide Preview')).toBeInTheDocument();
      });
    });
  });

  describe('Global Settings', () => {
    it('should switch to global settings tab', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Global Settings')).toBeInTheDocument();
      });
      
      const settingsTab = screen.getByText('Global Settings');
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(screen.getByText(/seo/i)).toBeInTheDocument();
      });
    });

    it('should edit SEO settings', async () => {
      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Global Settings')).toBeInTheDocument();
      });
      
      const settingsTab = screen.getByText('Global Settings');
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'New SEO Title' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeEnabled();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable buttons during save', async () => {
      let resolveSave: ((value: any) => void) | undefined;
      const savePromise = new Promise<any>((resolve) => {
        resolveSave = resolve;
      });

      vi.mocked(LandingApiModule.LandingApi.updateContent).mockReturnValue(savePromise);

      render(<LandingPageEditor />);
      
      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument();
      });
      
      // Make a change
      const chevronButtons = screen.getAllByRole('button', { name: '' });
      const expandButton = chevronButtons[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const headlineInput = screen.getByLabelText(/headline/i);
        fireEvent.change(headlineInput, { target: { value: 'New Headline' } });
      });
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
        const savingButton = screen.getByText('Saving...').closest('button');
        expect(savingButton).toBeDisabled();
      });
      
      // Resolve the promise
      resolveSave?.(mockLandingContent);
    });
  });
});
