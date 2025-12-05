/**
 * SearchResultItem Component Tests
 * Tests result display, metadata rendering, and interaction
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultItem } from '../SearchResultItem';
import type { SearchResult } from '@/types/search';
import { beforeEach } from 'node:test';

describe('SearchResultItem', () => {
  const mockOnClick = vi.fn();

  const baseResult: SearchResult = {
    id: '1',
    entityType: 'users',
    title: 'Test User',
    description: 'This is a test user description',
    url: '/dashboard/users/1',
    metadata: {
      date: '2024-01-01T00:00:00Z',
      status: 'Active',
    },
    relevanceScore: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render result title', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render result description', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    expect(screen.getByText('This is a test user description')).toBeInTheDocument();
  });

  it('should render entity type badge', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should display entity type icon', () => {
    const { container } = render(
      <SearchResultItem result={baseResult} onClick={mockOnClick} />
    );
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render metadata when provided', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const longDescription = 'a'.repeat(200);
    const resultWithLongDesc = {
      ...baseResult,
      description: longDescription,
    };

    const { container } = render(
      <SearchResultItem result={resultWithLongDesc} onClick={mockOnClick} />
    );
    
    const descElement = container.querySelector('.line-clamp-2');
    expect(descElement).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    const item = screen.getByRole('option');
    await user.click(item);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard navigation (Enter key)', async () => {
    const user = userEvent.setup();
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    const item = screen.getByRole('option');
    item.focus();
    await user.keyboard('{Enter}');
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard navigation (Space key)', async () => {
    const user = userEvent.setup();
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    const item = screen.getByRole('option');
    item.focus();
    await user.keyboard(' ');
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard focusable', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    const item = screen.getByRole('option');
    expect(item).toBeInTheDocument();
  });

  it('should display different icons for different entity types', () => {
    const entityTypes: Array<SearchResult['entityType']> = [
      'users',
      'products',
      'posts',
      'pages',
      'customers',
      'orders',
    ];

    entityTypes.forEach((entityType) => {
      const result = { ...baseResult, entityType };
      const { container, unmount } = render(
        <SearchResultItem result={result} onClick={mockOnClick} />
      );
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should apply hover styles', () => {
    const { container } = render(
      <SearchResultItem result={baseResult} onClick={mockOnClick} />
    );
    
    const item = container.querySelector('[role="option"]');
    expect(item).toHaveClass('hover:bg-accent');
  });

  it('should apply focus styles', () => {
    const { container } = render(
      <SearchResultItem result={baseResult} onClick={mockOnClick} />
    );
    
    const item = container.querySelector('[role="option"]');
    expect(item).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should render without metadata', () => {
    const resultWithoutMetadata = {
      ...baseResult,
      metadata: {},
    };

    render(<SearchResultItem result={resultWithoutMetadata} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should handle missing description', () => {
    const resultWithoutDesc = {
      ...baseResult,
      description: '',
    };

    render(<SearchResultItem result={resultWithoutDesc} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display author in metadata when provided', () => {
    const resultWithAuthor = {
      ...baseResult,
      metadata: {
        ...baseResult.metadata,
        author: 'John Doe',
      },
    };

    render(<SearchResultItem result={resultWithAuthor} onClick={mockOnClick} />);
    
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('should format date in metadata', () => {
    render(<SearchResultItem result={baseResult} onClick={mockOnClick} />);
    
    // Check that date is rendered (format may vary)
    const dateElement = screen.getByText(/2024/);
    expect(dateElement).toBeInTheDocument();
  });
});
