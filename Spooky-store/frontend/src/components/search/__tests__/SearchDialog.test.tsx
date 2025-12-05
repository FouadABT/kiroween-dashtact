/**
 * SearchDialog Component Tests
 * Tests dialog behavior, keyboard shortcuts, search integration, and state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchDialog } from '../SearchDialog';
import * as useSearchModule from '@/hooks/useSearch';

// Mock dependencies
vi.mock('@/hooks/useSearch');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('SearchDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockUseSearch = vi.mocked(useSearchModule.useSearch);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearch.mockReturnValue({
      results: [],
      isLoading: false,
      error: null,
      totalCount: 0,
    });
  });

  it('should render when open', () => {
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SearchDialog open={false} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display search input with autofocus', () => {
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    const input = screen.getByPlaceholderText(/start typing to search/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('autofocus');
  });

  it('should show placeholder text when no query entered', () => {
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/start typing to search/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseSearch.mockReturnValue({
      results: [],
      isLoading: true,
      error: null,
      totalCount: 0,
    });

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should display error message', () => {
    mockUseSearch.mockReturnValue({
      results: [],
      isLoading: false,
      error: 'Search failed',
      totalCount: 0,
    });

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/search failed/i)).toBeInTheDocument();
  });

  it('should display search results', () => {
    const mockResults = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User',
        description: 'test@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockUseSearch.mockReturnValue({
      results: mockResults,
      isLoading: false,
      error: null,
      totalCount: 1,
    });

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display empty state when no results', () => {
    mockUseSearch.mockReturnValue({
      results: [],
      isLoading: false,
      error: null,
      totalCount: 0,
    });

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    const input = screen.getByPlaceholderText(/start typing to search/i);
    userEvent.type(input, 'test query');

    waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it('should call useSearch with quick mode', async () => {
    const user = userEvent.setup();
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    const input = screen.getByPlaceholderText(/start typing to search/i);
    await user.type(input, 'test');
    
    await waitFor(() => {
      expect(mockUseSearch).toHaveBeenCalledWith('test', { quick: true });
    });
  });

  it('should display "View all results" link when results exist', () => {
    const mockResults = [
      {
        id: '1',
        entityType: 'users' as const,
        title: 'Test User',
        description: 'test@example.com',
        url: '/dashboard/users/1',
        metadata: {},
        relevanceScore: 100,
      },
    ];

    mockUseSearch.mockReturnValue({
      results: mockResults,
      isLoading: false,
      error: null,
      totalCount: 1,
    });

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    expect(screen.getByText(/view all results/i)).toBeInTheDocument();
  });

  it('should handle Escape key to close dialog', async () => {
    const user = userEvent.setup();
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should update search query on input change', async () => {
    const user = userEvent.setup();
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />);
    
    const input = screen.getByPlaceholderText(/start typing to search/i);
    await user.type(input, 'new query');
    
    expect(input).toHaveValue('new query');
  });
});
