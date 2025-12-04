/**
 * SearchEmptyState Component Tests
 * Tests empty state display and messaging
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchEmptyState } from '../SearchEmptyState';

describe('SearchEmptyState', () => {
  it('should render empty state message', () => {
    render(<SearchEmptyState query="test query" />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('should display the search query', () => {
    render(<SearchEmptyState query="test query" />);
    
    expect(screen.getByText(/"test query"/i)).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const { container } = render(<SearchEmptyState query="test" />);
    
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should display helpful suggestions', () => {
    render(<SearchEmptyState query="test" />);
    
    expect(screen.getByText(/try different keywords/i)).toBeInTheDocument();
  });

  it('should handle empty query string', () => {
    render(<SearchEmptyState query="" />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('should handle long query strings', () => {
    const longQuery = 'a'.repeat(100);
    render(<SearchEmptyState query={longQuery} />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(<SearchEmptyState query="test" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('should center content', () => {
    const { container } = render(<SearchEmptyState query="test" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center');
  });

  it('should use muted colors for secondary text', () => {
    const { container } = render(<SearchEmptyState query="test" />);
    
    const suggestion = screen.getByText(/try different keywords/i);
    expect(suggestion).toHaveClass('text-muted-foreground');
  });

  it('should handle special characters in query', () => {
    render(<SearchEmptyState query="test@#$%^&*()" />);
    
    expect(screen.getByText(/"test@#\$%\^&\*\(\)"/i)).toBeInTheDocument();
  });
});
