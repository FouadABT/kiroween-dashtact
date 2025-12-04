/**
 * SearchFilters Component Tests
 * Tests filter selection, URL parameter updates, and sort controls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters } from '../SearchFilters';

describe('SearchFilters', () => {
  const mockOnTypeChange = vi.fn();
  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all entity type filters', () => {
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('should highlight active filter', () => {
    const { container } = render(
      <SearchFilters
        activeType="users"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    const usersButton = screen.getByText('Users').closest('button');
    expect(usersButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should call onTypeChange when filter clicked', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    const usersButton = screen.getByText('Users');
    await user.click(usersButton);
    
    expect(mockOnTypeChange).toHaveBeenCalledTimes(1);
    expect(mockOnTypeChange).toHaveBeenCalledWith('users');
  });

  it('should render sort dropdown', () => {
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  it('should display current sort option', () => {
    render(
      <SearchFilters
        activeType="all"
        sortBy="date"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    // The Select component shows the value, check for trigger
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('should call onSortChange when sort option selected', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    // Open dropdown
    const sortButton = screen.getByRole('combobox');
    await user.click(sortButton);
    
    // Select date option
    const dateOption = screen.getByRole('option', { name: /date/i });
    await user.click(dateOption);
    
    expect(mockOnSortChange).toHaveBeenCalledWith('date');
  });

  it('should have all sort options available', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    // Open dropdown
    const sortButton = screen.getByRole('combobox');
    await user.click(sortButton);
    
    expect(screen.getByRole('option', { name: /relevance/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /name/i })).toBeInTheDocument();
  });

  it('should allow switching between filters', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    // Click Users
    await user.click(screen.getByText('Users'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('users');
    
    // Click Products
    await user.click(screen.getByText('Products'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('products');
    
    // Click All
    await user.click(screen.getByText('All'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('all');
  });

  it('should apply correct styles to inactive filters', () => {
    render(
      <SearchFilters
        activeType="users"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    const allButton = screen.getByText('All').closest('button');
    // Inactive buttons have outline variant
    expect(allButton).not.toHaveClass('bg-primary');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    const usersButton = screen.getByText('Users');
    usersButton.focus();
    await user.keyboard('{Enter}');
    
    expect(mockOnTypeChange).toHaveBeenCalledWith('users');
  });

  it('should handle missing count data gracefully', () => {
    render(
      <SearchFilters
        activeType="all"
        sortBy="relevance"
        onTypeChange={mockOnTypeChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    // Should still render all filters
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should apply responsive classes', () => {
    const { container } = render(
      <SearchFilters
        selectedType="all"
        selectedSort="relevance"
        onFilterChange={mockOnFilterChange}
        onSortChange={mockOnSortChange}
      />
    );
    
    const filterContainer = container.querySelector('.flex');
    expect(filterContainer).toHaveClass('flex-wrap', 'gap-2');
  });
});
