/**
 * GlobalSearchBar Component Tests
 * Tests rendering, keyboard shortcut display, and click behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearchBar } from '../GlobalSearchBar';
import * as useSearchShortcutModule from '@/hooks/useSearchShortcut';

// Mock the useSearchShortcut hook
vi.mock('@/hooks/useSearchShortcut');

describe('GlobalSearchBar', () => {
  const mockOpenSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchShortcutModule.useSearchShortcut).mockReturnValue({
      isOpen: false,
      openSearch: mockOpenSearch,
      closeSearch: vi.fn(),
    });
  });

  it('should render search input with placeholder', () => {
    render(<GlobalSearchBar />);
    
    const input = screen.getByRole('textbox', { name: /open search dialog/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('Search...'));
  });

  it('should display search icon', () => {
    const { container } = render(<GlobalSearchBar />);
    
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should display keyboard shortcut badge', () => {
    render(<GlobalSearchBar />);
    
    const kbd = screen.getByText('K');
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });

  it('should display Cmd key for Mac', () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    render(<GlobalSearchBar />);
    
    expect(screen.getByText('⌘')).toBeInTheDocument();
  });

  it('should display Ctrl key for Windows', () => {
    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    });

    render(<GlobalSearchBar />);
    
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('should be read-only', () => {
    render(<GlobalSearchBar />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('should call openSearch when clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalSearchBar />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    expect(mockOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA label', () => {
    render(<GlobalSearchBar />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Open search dialog');
  });

  it('should apply correct CSS classes', () => {
    render(<GlobalSearchBar />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10', 'pr-16', 'bg-background', 'border-border');
  });
});
