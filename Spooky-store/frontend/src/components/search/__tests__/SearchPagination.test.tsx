/**
 * SearchPagination Component Tests
 * Tests pagination controls, page navigation, and edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPagination } from '../SearchPagination';

describe('SearchPagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pagination controls', () => {
    render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Check that page buttons are rendered
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
  });

  it('should render previous and next buttons', () => {
    render(
      <SearchPagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <SearchPagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange with previous page', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should render page number buttons', () => {
    render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('should highlight current page button', () => {
    render(
      <SearchPagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
    expect(currentPageButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should call onPageChange when page number clicked', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const page3Button = screen.getByRole('button', { name: 'Page 3' });
    await user.click(page3Button);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should show ellipsis for many pages', () => {
    render(
      <SearchPagination
        currentPage={5}
        totalPages={20}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should show first and last page with ellipsis', () => {
    render(
      <SearchPagination
        currentPage={10}
        totalPages={20}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
  });

  it('should handle single page', () => {
    render(
      <SearchPagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should not render with zero pages', () => {
    const { container } = render(
      <SearchPagination
        currentPage={1}
        totalPages={0}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Component returns null for 0 or 1 pages
    expect(container.firstChild).toBeNull();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    nextButton.focus();
    await user.keyboard('{Enter}');
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should not call onPageChange when clicking current page', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
    await user.click(currentPageButton);
    
    // Should not call onPageChange for current page
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should show correct page range for middle pages', () => {
    render(
      <SearchPagination
        currentPage={10}
        totalPages={20}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Should show pages around current page
    expect(screen.getByRole('button', { name: 'Page 9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 11' })).toBeInTheDocument();
  });

  it('should apply proper button styles', () => {
    const { container } = render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle rapid page changes', async () => {
    const user = userEvent.setup();
    render(
      <SearchPagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Click multiple times rapidly
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    
    // Should have been called 3 times
    expect(mockOnPageChange).toHaveBeenCalledTimes(3);
  });
});
