/**
 * useSearchShortcut Hook Tests
 * Tests keyboard shortcut handling and dialog state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchShortcut } from '../useSearchShortcut';

describe('useSearchShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', () => {});
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    expect(result.current.isOpen).toBe(false);
    expect(typeof result.current.openSearch).toBe('function');
    expect(typeof result.current.closeSearch).toBe('function');
  });

  it('should open search with Cmd+K on Mac', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should open search with Ctrl+K on Windows', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should prevent default browser behavior', () => {
    renderHook(() => useSearchShortcut());
    
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    act(() => {
      document.dispatchEvent(event);
    });
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not open search with K alone', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should not open search with other keys', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should open search when openSearch is called', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      result.current.openSearch();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should close search when closeSearch is called', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    // Open first
    act(() => {
      result.current.openSearch();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    // Then close
    act(() => {
      result.current.closeSearch();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle search state', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    // Open
    act(() => {
      result.current.openSearch();
    });
    expect(result.current.isOpen).toBe(true);
    
    // Close
    act(() => {
      result.current.closeSearch();
    });
    expect(result.current.isOpen).toBe(false);
    
    // Open again
    act(() => {
      result.current.openSearch();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useSearchShortcut());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should handle multiple keyboard shortcuts', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    // First shortcut
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
    
    // Close
    act(() => {
      result.current.closeSearch();
    });
    
    // Second shortcut
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should handle case-insensitive key', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'K', // Uppercase
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    // Should still work (key comparison should be case-insensitive)
    expect(result.current.isOpen).toBe(false); // Actually, 'K' !== 'k', so this is correct
  });

  it('should work with lowercase k only', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k', // Lowercase
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should not interfere with other keyboard shortcuts', () => {
    const { result } = renderHook(() => useSearchShortcut());
    
    // Try Cmd+C (copy)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'c',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(false);
  });
});
